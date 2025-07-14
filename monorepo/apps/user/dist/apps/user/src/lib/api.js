// Add this at the top of the file to fix linter error for import.meta.env
/// <reference types="vite/client" />
import axios from 'axios';
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
    login: async (data) => {
        const response = await api.post('/user/login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    signup: async (data) => {
        const response = await api.post('/user/signup', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    googleAuth: async (idToken) => {
        const response = await api.post('/user/google-auth', { idToken });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
};
export const routes = {
    getAll: async () => {
        const response = await api.get('/user/routes');
        console.log('API /user/routes response:', response.data);
        return response;
    },
    getById: (id) => api.get(`/user/routes/${id}`),
    getByVendor: (vendorId) => api.get(`/user/routes?vendor=${vendorId}`),
    getSeats: (routeId, travelDate) => {
        let url = `/user/routes/${routeId}/seats`;
        if (travelDate) {
            url += `?travelDate=${encodeURIComponent(travelDate)}`;
        }
        return api.get(url);
    },
};
export const vendors = {
    getAll: () => api.get('/vendors'),
    getById: (id) => api.get(`/vendors/${id}`),
};
export const tickets = {
    create: (data) => api.post('/tickets', data),
    getByUser: () => api.get(`/user/tickets`),
    getById: (id) => api.get(`/tickets/${id}`),
    getByReference: (bookingReference) => api.get(`/user/tickets/reference/${bookingReference}`),
    updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
};
export const user = {
    getMe: () => api.get('/user/me'),
    updateMe: (data) => api.patch('/user/me', data),
};
export const notifications = {
    getAll: () => api.get('/user/notifications'),
    markAsRead: (id) => api.patch(`/user/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};
export default api;
