-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    yandex_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы настроек пользователя
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p61343402_world_time_app.users(id),
    theme VARCHAR(50) DEFAULT 'white',
    weather_city VARCHAR(100) DEFAULT 'Москва',
    timezone_mode VARCHAR(20) DEFAULT '24',
    notifications_enabled BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);

-- Создание таблицы стран
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE
);

-- Создание таблицы городов
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.cities (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES t_p61343402_world_time_app.countries(id),
    name VARCHAR(100) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    is_capital BOOLEAN DEFAULT false,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Создание таблицы избранных городов
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p61343402_world_time_app.users(id),
    city_id INTEGER REFERENCES t_p61343402_world_time_app.cities(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, city_id)
);

-- Создание таблицы сессий
CREATE TABLE IF NOT EXISTS t_p61343402_world_time_app.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p61343402_world_time_app.users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_cities_country ON t_p61343402_world_time_app.cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON t_p61343402_world_time_app.cities(name);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON t_p61343402_world_time_app.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p61343402_world_time_app.sessions(token);

-- Заполнение базовыми данными стран
INSERT INTO t_p61343402_world_time_app.countries (name, code) VALUES
('Россия', 'RUS'),
('Беларусь', 'BLR'),
('Казахстан', 'KAZ'),
('США', 'USA'),
('Великобритания', 'GBR'),
('Франция', 'FRA'),
('Германия', 'DEU'),
('Япония', 'JPN'),
('Китай', 'CHN'),
('ОАЭ', 'ARE'),
('Австралия', 'AUS'),
('Индия', 'IND'),
('Бразилия', 'BRA'),
('Канада', 'CAN'),
('Италия', 'ITA'),
('Испания', 'ESP'),
('Турция', 'TUR'),
('Южная Корея', 'KOR'),
('Мексика', 'MEX'),
('Аргентина', 'ARG')
ON CONFLICT (code) DO NOTHING;

-- Заполнение городами России
INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Москва', 'Europe/Moscow', true, 55.7558, 37.6173 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS'
ON CONFLICT DO NOTHING;

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Санкт-Петербург', 'Europe/Moscow', false, 59.9311, 30.3609 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Калининград', 'Europe/Kaliningrad', false, 54.7104, 20.4522 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Казань', 'Europe/Moscow', false, 55.7887, 49.1221 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Омск', 'Asia/Omsk', false, 54.9885, 73.3242 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Новосибирск', 'Asia/Novosibirsk', false, 55.0084, 82.9357 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Екатеринбург', 'Asia/Yekaterinburg', false, 56.8389, 60.6057 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Владивосток', 'Asia/Vladivostok', false, 43.1155, 131.8855 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Ростов-на-Дону', 'Europe/Moscow', false, 47.2357, 39.7015 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Уфа', 'Asia/Yekaterinburg', false, 54.7388, 55.9721 FROM t_p61343402_world_time_app.countries WHERE code = 'RUS';

-- Заполнение городами других стран
INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Минск', 'Europe/Minsk', true, 53.9006, 27.5590 FROM t_p61343402_world_time_app.countries WHERE code = 'BLR';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Алматы', 'Asia/Almaty', false, 43.2220, 76.8512 FROM t_p61343402_world_time_app.countries WHERE code = 'KAZ';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Астана', 'Asia/Almaty', true, 51.1694, 71.4491 FROM t_p61343402_world_time_app.countries WHERE code = 'KAZ';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Нью-Йорк', 'America/New_York', false, 40.7128, -74.0060 FROM t_p61343402_world_time_app.countries WHERE code = 'USA';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Вашингтон', 'America/New_York', true, 38.9072, -77.0369 FROM t_p61343402_world_time_app.countries WHERE code = 'USA';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Лос-Анджелес', 'America/Los_Angeles', false, 34.0522, -118.2437 FROM t_p61343402_world_time_app.countries WHERE code = 'USA';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Лондон', 'Europe/London', true, 51.5074, -0.1278 FROM t_p61343402_world_time_app.countries WHERE code = 'GBR';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Париж', 'Europe/Paris', true, 48.8566, 2.3522 FROM t_p61343402_world_time_app.countries WHERE code = 'FRA';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Берлин', 'Europe/Berlin', true, 52.5200, 13.4050 FROM t_p61343402_world_time_app.countries WHERE code = 'DEU';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Токио', 'Asia/Tokyo', true, 35.6762, 139.6503 FROM t_p61343402_world_time_app.countries WHERE code = 'JPN';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Пекин', 'Asia/Shanghai', true, 39.9042, 116.4074 FROM t_p61343402_world_time_app.countries WHERE code = 'CHN';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Шанхай', 'Asia/Shanghai', false, 31.2304, 121.4737 FROM t_p61343402_world_time_app.countries WHERE code = 'CHN';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Дубай', 'Asia/Dubai', false, 25.2048, 55.2708 FROM t_p61343402_world_time_app.countries WHERE code = 'ARE';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Абу-Даби', 'Asia/Dubai', true, 24.4539, 54.3773 FROM t_p61343402_world_time_app.countries WHERE code = 'ARE';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Сидней', 'Australia/Sydney', false, -33.8688, 151.2093 FROM t_p61343402_world_time_app.countries WHERE code = 'AUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Канберра', 'Australia/Sydney', true, -35.2809, 149.1300 FROM t_p61343402_world_time_app.countries WHERE code = 'AUS';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Дели', 'Asia/Kolkata', true, 28.6139, 77.2090 FROM t_p61343402_world_time_app.countries WHERE code = 'IND';

INSERT INTO t_p61343402_world_time_app.cities (country_id, name, timezone, is_capital, latitude, longitude) 
SELECT id, 'Мумбаи', 'Asia/Kolkata', false, 19.0760, 72.8777 FROM t_p61343402_world_time_app.countries WHERE code = 'IND';