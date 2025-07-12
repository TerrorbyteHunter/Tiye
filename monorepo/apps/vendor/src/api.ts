import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post('/vendor/login', credentials);
    localStorage.setItem('vendor_token', data.token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('vendor_token');
  },
};

export const vendor = {
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },
  updateProfile: async (profile: any) => {
    const { data } = await api.put('/profile', profile);
    return data;
  },
};

export const routes = {
  getAll: async () => {
    const { data } = await api.get('/routes');
    return data;
  },
  getCompleted: async () => {
    const { data } = await api.get('/routes/completed');
    return data;
  },
  create: async (route: any) => {
    const { data } = await api.post('/routes', route);
    return data;
  },
  update: async (id: string, route: any) => {
    const { data } = await api.patch(`/routes/${id}`, route);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/routes/${id}`);
    return data;
  },
};

export const tickets = {
  getAll: async () => {
    const { data } = await api.get('/tickets');
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.put(`/tickets/${id}/status`, { status });
    return data;
  },
};

export const customers = {
  getAll: async () => {
    const { data } = await api.get('/customers');
    return data;
  },
};

export const reports = {
  getAnalytics: async () => {
    const { data } = await api.get('/reports/analytics');
    return data;
  },
}; 