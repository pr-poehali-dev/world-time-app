import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { AuthDialog } from '@/components/AuthDialog';
import { SettingsSheet } from '@/components/SettingsSheet';
import { api } from '@/lib/api';
import { getCurrentTheme, applyTheme } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';

interface CityData {
  id: number;
  name: string;
  country: string;
  timezone: string;
  is_capital: boolean;
  isFavorite?: boolean;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<CityData[]>([]);
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [currentTimes, setCurrentTimes] = useState<Record<number, string>>({});
  const [weather, setWeather] = useState({ temp: '22°C', condition: 'Ясно', description: '' });
  const [weatherCity, setWeatherCity] = useState('Москва');
  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'profile'>('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const parallelCity: CityData = {
    id: 0,
    name: 'Параллельный мир',
    country: 'Параллельная сторона',
    timezone: 'parallel',
    is_capital: false,
    isFavorite: false
  };

  useEffect(() => {
    const theme = getCurrentTheme();
    applyTheme(theme);
    checkAuth();
    loadCities();
    loadWeather();
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const times: Record<number, string> = {};
      [...cities, parallelCity].forEach((city) => {
        times[city.id] = getCurrentTime(city.timezone);
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [cities]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setCities(allCities.slice(0, 20));
    }
  }, [searchQuery, allCities]);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const profile = await api.auth.getProfile();
        if (profile.id) {
          setUser(profile);
          setIsAuthenticated(true);
          loadSettings();
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
      }
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await api.settings.get();
      if (settings.weather_city) {
        setWeatherCity(settings.weather_city);
        loadWeather(settings.weather_city);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const loadCities = async () => {
    try {
      const result = await api.cities.search('');
      if (result.cities) {
        setAllCities(result.cities);
        setCities(result.cities.slice(0, 20));
      }
    } catch (error) {
      console.error('Failed to load cities', error);
    }
  };

  const loadWeather = async (city?: string) => {
    try {
      const data = await api.weather.get(city || weatherCity);
      setWeather(data);
    } catch (error) {
      console.error('Failed to load weather', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setCities(allCities.slice(0, 20));
      return;
    }

    try {
      const result = await api.cities.search(query);
      if (result.cities) {
        setCities(result.cities);
      }
    } catch (error) {
      console.error('Search failed', error);
    }
  };

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

  const toggleFavorite = async (cityId: number) => {
    if (!isAuthenticated) {
      toast({ title: 'Войдите для сохранения избранного', variant: 'destructive' });
      setAuthOpen(true);
      return;
    }

    try {
      await api.cities.addFavorite(cityId);
      setCities(cities.map(c => c.id === cityId ? { ...c, isFavorite: !c.isFavorite } : c));
      toast({ title: 'Добавлено в избранное!' });
    } catch (error) {
      toast({ title: 'Ошибка при сохранении', variant: 'destructive' });
    }
  };

  const displayCities = activeTab === 'favorites' 
    ? cities.filter(c => c.isFavorite)
    : cities;

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
                    <h3 className="text-xl font-semibold">{weatherCity}, Россия</h3>
                    <p className="text-2xl font-bold text-primary">
                      {currentTimes[allCities.find(c => c.name === weatherCity)?.id || 1] || '--:--'}
                    </p>
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

            <Card className="glass-effect p-6 mb-4 hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    🌀 {parallelCity.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{parallelCity.country}</p>
                </div>
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                  <Icon name="Heart" size={24} className="text-muted-foreground" />
                </Button>
              </div>
              <div className="text-4xl font-bold text-accent animate-scale-pulse">
                {currentTimes[0] || getParallelTime()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Время течёт в соотношении 21:5
              </p>
            </Card>
          </>
        )}

        {activeTab === 'favorites' && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Heart" size={32} className="text-secondary" />
              Избранное
            </h2>
            {displayCities.length === 0 && (
              <Card className="glass-effect p-8 text-center">
                <Icon name="HeartOff" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Нет избранных городов</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            {isAuthenticated ? (
              <Card className="glass-effect p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Icon name="User" size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-muted-foreground">{user?.phone}</p>
                  </div>
                </div>
                <Button onClick={() => setSettingsOpen(true)} className="w-full">
                  <Icon name="Settings" size={20} className="mr-2" />
                  Настройки
                </Button>
              </Card>
            ) : (
              <Card className="glass-effect p-8 text-center">
                <Icon name="UserX" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">Войдите для доступа к профилю</p>
                <Button onClick={() => setAuthOpen(true)} className="w-full">
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </Button>
              </Card>
            )}
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
                      {city.name}
                      {city.is_capital && <span className="text-xs text-accent">(столица)</span>}
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
                <div className="text-4xl font-bold text-primary animate-scale-pulse">
                  {currentTimes[city.id] || '--:--'}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-primary/30 p-4 bg-background/80">
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

      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen}
        onSuccess={() => {
          checkAuth();
          loadSettings();
        }}
      />
      
      {isAuthenticated && (
        <SettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          user={user}
          onProfileUpdate={() => {
            checkAuth();
            loadSettings();
            loadWeather();
          }}
        />
      )}
    </div>
  );
};

export default Index;
