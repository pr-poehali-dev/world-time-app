import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для работы с городами и избранным'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    schema = os.environ['MAIN_DB_SCHEMA']
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            search = params.get('search', '')
            country = params.get('country', '')
            
            cur = conn.cursor()
            
            if search:
                cur.execute(
                    f"SELECT c.id, c.name, c.timezone, c.is_capital, co.name as country, c.latitude, c.longitude "
                    f"FROM {schema}.cities c "
                    f"JOIN {schema}.countries co ON c.country_id = co.id "
                    f"WHERE LOWER(c.name) LIKE %s OR LOWER(co.name) LIKE %s "
                    f"ORDER BY c.is_capital DESC, c.name",
                    (f'%{search.lower()}%', f'%{search.lower()}%')
                )
            elif country:
                cur.execute(
                    f"SELECT c.id, c.name, c.timezone, c.is_capital, co.name as country, c.latitude, c.longitude "
                    f"FROM {schema}.cities c "
                    f"JOIN {schema}.countries co ON c.country_id = co.id "
                    f"WHERE co.name = %s "
                    f"ORDER BY c.is_capital DESC, c.name",
                    (country,)
                )
            else:
                cur.execute(
                    f"SELECT c.id, c.name, c.timezone, c.is_capital, co.name as country, c.latitude, c.longitude "
                    f"FROM {schema}.cities c "
                    f"JOIN {schema}.countries co ON c.country_id = co.id "
                    f"ORDER BY c.is_capital DESC, c.name LIMIT 50"
                )
            
            cities = []
            for row in cur.fetchall():
                cities.append({
                    'id': row[0],
                    'name': row[1],
                    'timezone': row[2],
                    'is_capital': row[3],
                    'country': row[4],
                    'latitude': float(row[5]) if row[5] else None,
                    'longitude': float(row[6]) if row[6] else None
                })
            
            cur.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'cities': cities}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
            body = json.loads(event.get('body', '{}'))
            city_id = body.get('city_id')
            
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
            
            cur.execute(
                f"INSERT INTO {schema}.user_favorites (user_id, city_id) VALUES (%s, %s) "
                f"ON CONFLICT (user_id, city_id) DO NOTHING",
                (user_id, city_id)
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
