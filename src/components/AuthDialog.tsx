import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!phone || !firstName || !lastName) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.auth.register(phone, firstName, lastName);
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        toast({ title: 'Регистрация успешна!' });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({ title: 'Ошибка регистрации', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone) {
      toast({ title: 'Введите номер телефона', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.auth.login(phone);
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        toast({ title: 'Вход выполнен!' });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({ title: result.error || 'Ошибка входа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleYandexLogin = () => {
    const clientId = 'YOUR_YANDEX_CLIENT_ID';
    const redirectUri = window.location.origin + '/yandex-callback';
    const url = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Вход в TimeWorld</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div>
              <Label htmlFor="login-phone">Номер телефона</Label>
              <Input
                id="login-phone"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <div>
              <Label htmlFor="reg-phone">Номер телефона</Label>
              <Input
                id="reg-phone"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reg-firstname">Имя</Label>
              <Input
                id="reg-firstname"
                placeholder="Иван"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reg-lastname">Фамилия</Label>
              <Input
                id="reg-lastname"
                placeholder="Петров"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Button onClick={handleRegister} className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">или</span>
          </div>
        </div>
        
        <Button onClick={handleYandexLogin} variant="outline" className="w-full">
          <Icon name="LogIn" size={20} className="mr-2" />
          Войти через Яндекс
        </Button>
      </DialogContent>
    </Dialog>
  );
}
