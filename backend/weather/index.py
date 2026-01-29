import json
import os
import urllib.request
from urllib.parse import urlencode

def handler(event: dict, context) -> dict:
    '''API для получения данных о погоде из OpenWeatherMap'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    city = params.get('city', 'Москва')
    api_key = os.environ.get('OPENWEATHER_API_KEY', '')
    
    if not api_key:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'temp': '22°C',
                'condition': 'Ясно',
                'description': 'API ключ не настроен'
            }),
            'isBase64Encoded': False
        }
    
    try:
        weather_params = {
            'q': city,
            'appid': api_key,
            'units': 'metric',
            'lang': 'ru'
        }
        
        url = f'https://api.openweathermap.org/data/2.5/weather?{urlencode(weather_params)}'
        
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            temp = round(data['main']['temp'])
            condition = data['weather'][0]['main']
            description = data['weather'][0]['description'].capitalize()
            
            condition_map = {
                'Clear': 'Ясно',
                'Clouds': 'Облачно',
                'Rain': 'Дождь',
                'Snow': 'Снег',
                'Thunderstorm': 'Гроза',
                'Drizzle': 'Морось',
                'Mist': 'Туман',
                'Fog': 'Туман'
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'temp': f'{temp}°C',
                    'condition': condition_map.get(condition, condition),
                    'description': description,
                    'humidity': data['main']['humidity'],
                    'wind_speed': data['wind']['speed']
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'temp': '22°C',
                'condition': 'Ясно',
                'description': f'Ошибка получения данных: {str(e)}'
            }),
            'isBase64Encoded': False
        }
