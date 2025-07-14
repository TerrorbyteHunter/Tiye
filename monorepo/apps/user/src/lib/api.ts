// Add this at the top of the file to fix linter error for import.meta.env
/// <reference types="vite/client" />
import axios from 'axios';
import type { Route, Ticket, Vendor } from '../types/schema';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (data: any) => {
    const response = await api.post<any>('/user/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  signup: async (data: any) => {
    const response = await api.post<any>('/user/signup', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  googleAuth: async (idToken: string) => {
    const response = await api.post<any>('/user/google-auth', { idToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
};

export const routes = {
  getAll: async () => {
    const response = await api.get<Route[]>('/user/routes');
    console.log('API /user/routes response:', response.data);
    return response;
  },
  getById: (id: number) => api.get<Route>(`/user/routes/${id}`),
  getByVendor: (vendorId: number) => api.get<Route[]>(`/user/routes?vendor=${vendorId}`),
  getSeats: (routeId: string | number, travelDate?: string) => {
    let url = `/user/routes/${routeId}/seats`;
    if (travelDate) {
      url += `?travelDate=${encodeURIComponent(travelDate)}`;
    }
    return api.get(url);
  },
};

export const vendors = {
  getAll: () => api.get<Vendor[]>('/vendors'),
  getById: (id: number) => api.get<Vendor>(`/vendors/${id}`),
};

export const tickets = {
  create: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Ticket>('/tickets', data),
  getByUser: () => api.get<Ticket[]>(`/user/tickets`),
  getById: (id: number) => api.get<Ticket>(`/tickets/${id}`),
  getByReference: (bookingReference: string) => api.get<Ticket>(`/user/tickets/reference/${bookingReference}`),
  updateStatus: (id: number, status: string) => api.patch<Ticket>(`/tickets/${id}/status`, { status }),
};

export const user = {
  getMe: () => api.get('/user/me'),
  updateMe: (data: any) => api.patch('/user/me', data),
};

export const notifications = {
  getAll: () => api.get('/user/notifications'),
  markAsRead: (id: string | number) => api.patch(`/user/notifications/${id}/read`),
  delete: (id: string | number) => api.delete(`/notifications/${id}`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api; 