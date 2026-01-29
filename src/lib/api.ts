const API_BASE = 'https://functions.poehali.dev';

const API_ENDPOINTS = {
  auth: '060e15f4-3ccb-47c1-bb22-42c4e5c08489',
  weather: '29547927-ed53-42c3-a032-659896e1d618',
  cities: '6e3e86cd-c50b-46bd-9c45-3b9f724628b4',
  settings: 'ec92728f-1256-45c9-8906-8ff0dc4ae1fc'
};

const getToken = () => localStorage.getItem('auth_token');

export const api = {
  auth: {
    register: async (phone: string, firstName: string, lastName: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.auth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', phone, first_name: firstName, last_name: lastName })
      });
      return res.json();
    },
    
    login: async (phone: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.auth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', phone })
      });
      return res.json();
    },
    
    yandexCallback: async (code: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.auth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'yandex_callback', code })
      });
      return res.json();
    },
    
    getProfile: async () => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.auth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    
    updateProfile: async (firstName: string, lastName: string, phone: string) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.auth}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone })
      });
      return res.json();
    }
  },
  
  weather: {
    get: async (city: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.weather}?city=${encodeURIComponent(city)}`);
      return res.json();
    }
  },
  
  cities: {
    search: async (query: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.cities}?search=${encodeURIComponent(query)}`);
      return res.json();
    },
    
    getByCountry: async (country: string) => {
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.cities}?country=${encodeURIComponent(country)}`);
      return res.json();
    },
    
    addFavorite: async (cityId: number) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.cities}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ city_id: cityId })
      });
      return res.json();
    }
  },
  
  settings: {
    get: async () => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.settings}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    
    update: async (settings: any) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/${API_ENDPOINTS.settings}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      return res.json();
    }
  }
};
