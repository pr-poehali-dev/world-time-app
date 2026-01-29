import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления настройками пользователя'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    schema = os.environ['MAIN_DB_SCHEMA']
    
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT user_id FROM {schema}.sessions WHERE token = %s AND expires_at > NOW()",
            (token,)
        )
        result = cur.fetchone()
        
        if not result:
            cur.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недействительный токен'}),
                'isBase64Encoded': False
            }
        
        user_id = result[0]
        
        if method == 'GET':
            cur.execute(
                f"SELECT theme, weather_city, timezone_mode, notifications_enabled "
                f"FROM {schema}.user_settings WHERE user_id = %s",
                (user_id,)
            )
            settings = cur.fetchone()
            cur.close()
            
            if not settings:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'theme': 'white',
                        'weather_city': 'Москва',
                        'timezone_mode': '24',
                        'notifications_enabled': True
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'theme': settings[0],
                    'weather_city': settings[1],
                    'timezone_mode': settings[2],
                    'notifications_enabled': settings[3]
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            theme = body.get('theme')
            weather_city = body.get('weather_city')
            timezone_mode = body.get('timezone_mode')
            notifications_enabled = body.get('notifications_enabled')
            
            cur.execute(
                f"UPDATE {schema}.user_settings "
                f"SET theme = COALESCE(%s, theme), "
                f"weather_city = COALESCE(%s, weather_city), "
                f"timezone_mode = COALESCE(%s, timezone_mode), "
                f"notifications_enabled = COALESCE(%s, notifications_enabled) "
                f"WHERE user_id = %s",
                (theme, weather_city, timezone_mode, notifications_enabled, user_id)
            )
            conn.commit()
            cur.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
