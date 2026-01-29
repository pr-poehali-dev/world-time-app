export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    muted: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'white',
    name: 'Белая',
    colors: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      primary: '262 83% 58%',
      secondary: '328 86% 70%',
      accent: '199 89% 48%',
      card: '0 0% 98%',
      muted: '210 40% 96%'
    }
  },
  {
    id: 'dark',
    name: 'Чёрная',
    colors: {
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      primary: '262 83% 58%',
      secondary: '328 86% 70%',
      accent: '199 89% 48%',
      card: '0 0% 5%',
      muted: '0 0% 10%'
    }
  },
  {
    id: 'blue',
    name: 'Синяя',
    colors: {
      background: '220 60% 10%',
      foreground: '0 0% 100%',
      primary: '210 100% 60%',
      secondary: '200 100% 70%',
      accent: '190 100% 50%',
      card: '220 60% 15%',
      muted: '220 40% 20%'
    }
  },
  {
    id: 'red',
    name: 'Красная',
    colors: {
      background: '0 40% 10%',
      foreground: '0 0% 100%',
      primary: '0 100% 60%',
      secondary: '340 90% 65%',
      accent: '20 100% 55%',
      card: '0 40% 15%',
      muted: '0 30% 20%'
    }
  },
  {
    id: 'orange',
    name: 'Оранжевая',
    colors: {
      background: '25 40% 10%',
      foreground: '0 0% 100%',
      primary: '30 100% 55%',
      secondary: '40 100% 60%',
      accent: '20 100% 50%',
      card: '25 40% 15%',
      muted: '25 30% 20%'
    }
  },
  {
    id: 'kids',
    name: 'Серо-буро-малиновая в крапинку (для детей)',
    description: 'Яркая детская тема',
    colors: {
      background: '320 30% 95%',
      foreground: '0 0% 20%',
      primary: '320 70% 55%',
      secondary: '150 60% 45%',
      accent: '0 0% 60%',
      card: '320 40% 98%',
      muted: '320 20% 90%'
    }
  }
];

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  localStorage.setItem('theme', theme.id);
};

export const getCurrentTheme = (): Theme => {
  const savedThemeId = localStorage.getItem('theme') || 'white';
  return themes.find(t => t.id === savedThemeId) || themes[0];
};
