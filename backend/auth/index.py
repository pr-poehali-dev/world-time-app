import json
import os
import secrets
import psycopg2
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs
import urllib.request

def handler(event: dict, context) -> dict:
    '''API для авторизации пользователей по телефону и через Яндекс OAuth'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    schema = os.environ['MAIN_DB_SCHEMA']
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                phone = body.get('phone')
                first_name = body.get('first_name')
                last_name = body.get('last_name')
                
                cur = conn.cursor()
                cur.execute(
                    f"INSERT INTO {schema}.users (phone, first_name, last_name) VALUES (%s, %s, %s) "
                    f"ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name "
                    f"RETURNING id",
                    (phone, first_name, last_name)
                )
                user_id = cur.fetchone()[0]
                
                cur.execute(
                    f"INSERT INTO {schema}.user_settings (user_id) VALUES (%s) "
                    f"ON CONFLICT (user_id) DO NOTHING",
                    (user_id,)
                )
                
                token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=30)
                cur.execute(
                    f"INSERT INTO {schema}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                    (user_id, token, expires_at)
                )
                conn.commit()
                cur.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'token': token, 'user_id': user_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                phone = body.get('phone')
                
                cur = conn.cursor()
                cur.execute(f"SELECT id FROM {schema}.users WHERE phone = %s", (phone,))
                result = cur.fetchone()
                
                if not result:
                    cur.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
                
                user_id = result[0]
                token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=30)
                cur.execute(
                    f"INSERT INTO {schema}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                    (user_id, token, expires_at)
                )
                conn.commit()
                cur.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'token': token, 'user_id': user_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'yandex_callback':
                code = body.get('code')
                
                token_url = 'https://oauth.yandex.ru/token'
                token_data = {
                    'grant_type': 'authorization_code',
                    'code': code,
                    'client_id': os.environ.get('YANDEX_CLIENT_ID', ''),
                    'client_secret': os.environ.get('YANDEX_CLIENT_SECRET', '')
                }
                
                req = urllib.request.Request(
                    token_url,
                    data=urlencode(token_data).encode('utf-8'),
                    method='POST'
                )
                
                with urllib.request.urlopen(req) as response:
                    token_response = json.loads(response.read().decode('utf-8'))
                    access_token = token_response.get('access_token')
                
                info_req = urllib.request.Request(
                    'https://login.yandex.ru/info',
                    headers={'Authorization': f'OAuth {access_token}'}
                )
                
                with urllib.request.urlopen(info_req) as info_response:
                    user_info = json.loads(info_response.read().decode('utf-8'))
                    yandex_id = user_info.get('id')
                    first_name = user_info.get('first_name', '')
                    last_name = user_info.get('last_name', '')
                    phone = user_info.get('default_phone', {}).get('number', f'yandex_{yandex_id}')
                
                cur = conn.cursor()
                cur.execute(
                    f"INSERT INTO {schema}.users (phone, first_name, last_name, yandex_id) "
                    f"VALUES (%s, %s, %s, %s) "
                    f"ON CONFLICT (yandex_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name "
                    f"RETURNING id",
                    (phone, first_name, last_name, yandex_id)
                )
                user_id = cur.fetchone()[0]
                
                cur.execute(
                    f"INSERT INTO {schema}.user_settings (user_id) VALUES (%s) "
                    f"ON CONFLICT (user_id) DO NOTHING",
                    (user_id,)
                )
                
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=30)
                cur.execute(
                    f"INSERT INTO {schema}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                    (user_id, session_token, expires_at)
                )
                conn.commit()
                cur.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'token': session_token, 'user_id': user_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Токен не предоставлен'}),
                    'isBase64Encoded': False
                }
            
            cur = conn.cursor()
            cur.execute(
                f"SELECT u.id, u.phone, u.first_name, u.last_name, u.yandex_id "
                f"FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id "
                f"WHERE s.token = %s AND s.expires_at > NOW()",
                (token,)
            )
            result = cur.fetchone()
            cur.close()
            
            if not result:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недействительный токен'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result[0],
                    'phone': result[1],
                    'first_name': result[2],
                    'last_name': result[3],
                    'yandex_id': result[4]
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
            body = json.loads(event.get('body', '{}'))
            
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
            first_name = body.get('first_name')
            last_name = body.get('last_name')
            phone = body.get('phone')
            
            cur.execute(
                f"UPDATE {schema}.users SET first_name = %s, last_name = %s, phone = %s, updated_at = NOW() WHERE id = %s",
                (first_name, last_name, phone, user_id)
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
