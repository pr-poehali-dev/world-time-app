import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CityTime {
  id: string;
  city: string;
  country: string;
  timezone: string;
  isFavorite: boolean;
  isParallel?: boolean;
}

const initialCities: CityTime[] = [
  { id: '1', city: 'Москва', country: 'Россия', timezone: 'Europe/Moscow', isFavorite: false },
  { id: '2', city: 'Минск', country: 'Беларусь', timezone: 'Europe/Minsk', isFavorite: false },
  { id: '3', city: 'Алматы', country: 'Казахстан', timezone: 'Asia/Almaty', isFavorite: false },
  { id: '4', city: 'Параллельный мир', country: 'Параллельная сторона', timezone: 'parallel', isFavorite: false, isParallel: true },
  { id: '5', city: 'Лондон', country: 'Великобритания', timezone: 'Europe/London', isFavorite: false },
  { id: '6', city: 'Нью-Йорк', country: 'США', timezone: 'America/New_York', isFavorite: false },
  { id: '7', city: 'Токио', country: 'Япония', timezone: 'Asia/Tokyo', isFavorite: false },
  { id: '8', city: 'Дубай', country: 'ОАЭ', timezone: 'Asia/Dubai', isFavorite: false },
  { id: '9', city: 'Париж', country: 'Франция', timezone: 'Europe/Paris', isFavorite: false },
  { id: '10', city: 'Сидней', country: 'Австралия', timezone: 'Australia/Sydney', isFavorite: false },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<CityTime[]>(initialCities);
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState({ temp: '22°C', condition: 'Ясно' });
  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'profile'>('home');

  const getParallelTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const parallelHours = Math.floor((hours * 21) / 24);
    const parallelMinutes = Math.floor((minutes * 5) / 60);
    return `${String(parallelHours).padStart(2, '0')}:${String(parallelMinutes).padStart(2, '0')}`;
  };

  const getCurrentTime = (timezone: string) => {
    if (timezone === 'parallel') {
      return getParallelTime();
    }
    try {
      return new Date().toLocaleTimeString('ru-RU', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '--:--';
    }
  };

  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {};
      cities.forEach((city) => {
        times[city.id] = getCurrentTime(city.timezone);
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [cities]);

  const toggleFavorite = (id: string) => {
    setCities(
      cities.map((city) =>
        city.id === id ? { ...city, isFavorite: !city.isFavorite } : city
      )
    );
  };

  const filteredCities = cities.filter(
    (city) =>
      city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayCities = activeTab === 'favorites' 
    ? cities.filter(c => c.isFavorite)
    : filteredCities;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="max-w-6xl mx-auto p-4 pb-24">
        <header className="mb-8 pt-6 animate-fade-in">
          <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            TimeWorld
          </h1>
          <p className="text-center text-muted-foreground">Время во всех уголках мира</p>
        </header>

        {activeTab === 'home' && (
          <>
            <Card className="glass-effect p-6 mb-6 pulse-glow animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon name="CloudSun" size={32} className="text-accent" />
                  <div>
                    <h3 className="text-xl font-semibold">Москва, Россия</h3>
                    <p className="text-2xl font-bold text-primary">{currentTimes['1'] || '--:--'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{weather.temp}</p>
                  <p className="text-muted-foreground">{weather.condition}</p>
                </div>
              </div>
            </Card>

            <div className="mb-6 relative animate-fade-in">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск страны или города..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 glass-effect text-lg border-primary/30 focus:border-primary"
              />
            </div>
          </>
        )}

        {activeTab === 'favorites' && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Heart" size={32} className="text-secondary" />
              Избранное
            </h2>
            {cities.filter(c => c.isFavorite).length === 0 && (
              <Card className="glass-effect p-8 text-center">
                <Icon name="HeartOff" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Нет избранных городов</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <Card className="glass-effect p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Icon name="User" size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Профиль пользователя</h2>
                  <p className="text-muted-foreground">+7 (XXX) XXX-XX-XX</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти через Яндекс
              </Button>
            </Card>

            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="Settings" size={24} />
                Настройки
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Bell" size={20} className="mr-2" />
                  Уведомления
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Clock" size={20} className="mr-2" />
                  Часовые пояса
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Palette" size={20} className="mr-2" />
                  Оформление
                </Button>
              </div>
            </Card>
          </div>
        )}

        {(activeTab === 'home' || activeTab === 'favorites') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayCities.map((city, index) => (
              <Card
                key={city.id}
                className="glass-effect p-6 hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {city.isParallel && '🌀'} {city.city}
                    </h3>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(city.id)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Icon
                      name="Heart"
                      size={24}
                      className={city.isFavorite ? 'fill-secondary text-secondary' : 'text-muted-foreground'}
                    />
                  </Button>
                </div>
                <div className={`text-4xl font-bold ${city.isParallel ? 'text-accent' : 'text-primary'} animate-scale-pulse`}>
                  {currentTimes[city.id] || '--:--'}
                </div>
                {city.isParallel && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Время течёт в соотношении 21:5
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-primary/30 p-4">
        <div className="max-w-6xl mx-auto flex justify-around items-center">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon name="Home" size={24} />
            <span className="text-xs">Главная</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'favorites' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon name="Heart" size={24} />
            <span className="text-xs">Избранное</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon name="User" size={24} />
            <span className="text-xs">Профиль</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
