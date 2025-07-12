import axios from 'axios';
import { Ticket, Route, Vendor } from './types/schema';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tickets = {
  getByRoute: async (routeId: number): Promise<Ticket[]> => {
    const response = await api.get(`/tickets?routeId=${routeId}`);
    return response.data;
  },
};

export const routes = {
  list: async (): Promise<Route[]> => {
    const response = await api.get('/routes');
    return response.data;
  },
};

export const vendor = {
  getCurrent: async (): Promise<Vendor> => {
    const response = await api.get('/vendor/profile');
    return response.data;
  },
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  vendor: Vendor;
}

export const auth = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/vendor/login', credentials);
    localStorage.setItem('vendor_token', response.data.token);
    return response.data;
  },
};