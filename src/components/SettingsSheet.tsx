import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { themes, applyTheme } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onProfileUpdate: () => void;
}

const weatherCities = [
  'Москва', 'Санкт-Петербург', 'Калининград', 'Омск', 'Казань',
  'Новосибирск', 'Екатеринбург', 'Владивосток', 'Минск', 'Алматы'
];

export function SettingsSheet({ open, onOpenChange, user, onProfileUpdate }: SettingsSheetProps) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [theme, setTheme] = useState('white');
  const [weatherCity, setWeatherCity] = useState('Москва');
  const [timezoneMode, setTimezoneMode] = useState('24');
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const settings = await api.settings.get();
      if (settings.theme) setTheme(settings.theme);
      if (settings.weather_city) setWeatherCity(settings.weather_city);
      if (settings.timezone_mode) setTimezoneMode(settings.timezone_mode);
      if (settings.notifications_enabled !== undefined) setNotifications(settings.notifications_enabled);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.auth.updateProfile(firstName, lastName, phone);
      toast({ title: 'Профиль обновлён!' });
      onProfileUpdate();
    } catch (error) {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      applyTheme(selectedTheme);
      api.settings.update({ theme: themeId }).catch(console.error);
    }
  };

  const handleWeatherCityChange = (city: string) => {
    setWeatherCity(city);
    api.settings.update({ weather_city: city }).catch(console.error);
  };

  const handleTimezoneModeChange = (mode: string) => {
    setTimezoneMode(mode);
    api.settings.update({ timezone_mode: mode }).catch(console.error);
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    api.settings.update({ notifications_enabled: enabled }).catch(console.error);
    toast({ title: enabled ? 'Уведомления включены' : 'Уведомления выключены' });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    onProfileUpdate();
    onOpenChange(false);
    toast({ title: 'Вы вышли из аккаунта' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-effect overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <Icon name="Settings" size={28} />
            Настройки
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="User" size={20} />
              Профиль
            </h3>
            <div>
              <Label htmlFor="settings-firstname">Имя</Label>
              <Input
                id="settings-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
              />
            </div>
            <div>
              <Label htmlFor="settings-lastname">Фамилия</Label>
              <Input
                id="settings-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Петров"
              />
            </div>
            <div>
              <Label htmlFor="settings-phone">Телефон</Label>
              <Input
                id="settings-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full">
              Сохранить профиль
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Palette" size={20} />
              Оформление
            </h3>
            <div>
              <Label htmlFor="theme-select">Тема</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="CloudSun" size={20} />
              Погода
            </h3>
            <div>
              <Label htmlFor="weather-city">Город для погоды</Label>
              <Select value={weatherCity} onValueChange={handleWeatherCityChange}>
                <SelectTrigger id="weather-city">
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {weatherCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Clock" size={20} />
              Часовые пояса
            </h3>
            <div>
              <Label htmlFor="timezone-mode">Режим отображения</Label>
              <Select value={timezoneMode} onValueChange={handleTimezoneModeChange}>
                <SelectTrigger id="timezone-mode">
                  <SelectValue placeholder="Выберите режим" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 часа</SelectItem>
                  <SelectItem value="24/7">24 на 7</SelectItem>
                  <SelectItem value="21/5">21 на 5 (параллельное)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Bell" size={20} />
              Уведомления
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-toggle">Включить уведомления</Label>
              <Switch
                id="notifications-toggle"
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти из аккаунта
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
