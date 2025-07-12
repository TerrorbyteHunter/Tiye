import axios from 'axios';
import type { VendorLoginData, VendorAuthResponse, Vendor } from '../types/schema';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding token to request');
    }
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  (error) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login');
      localStorage.removeItem('vendor_token');
      // Clear saved credentials when session expires
      localStorage.removeItem('vendor_remember_me');
      localStorage.removeItem('vendor_saved_email');
      window.location.href = '/login';
      return Promise.reject(new Error('Please log in again'));
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    // Return a more informative error
    return Promise.reject(error.response?.data?.error || error.message || 'An error occurred');
  }
);

export const auth = {
  login: async (credentials: VendorLoginData): Promise<VendorAuthResponse> => {
    const { data } = await api.post('/vendor/login', credentials);
    localStorage.setItem('vendor_token', data.token);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/vendor/logout');
    localStorage.removeItem('vendor_token');
    // Clear saved credentials when logging out
    localStorage.removeItem('vendor_remember_me');
    localStorage.removeItem('vendor_saved_email');
    return data;
  }
};

export const vendor = {
  getCurrent: async (): Promise<Vendor> => {
    const { data } = await api.get('/vendor/profile');
    return data;
  },
  update: async (id: number, vendorData: Partial<Vendor>): Promise<Vendor> => {
    const { data } = await api.patch(`/vendors/${id}`, vendorData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/vendor/profile');
    return data;
  },
  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/vendor/profile', profileData);
    return data;
  },
  login: async (credentials: any) => {
    const { data } = await api.post('/vendor/login', credentials);
    localStorage.setItem('vendor_token', data.token);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/vendor/logout');
    localStorage.removeItem('vendor_token');
    // Clear saved credentials when logging out
    localStorage.removeItem('vendor_remember_me');
    localStorage.removeItem('vendor_saved_email');
    return data;
  },
  getBuses: async () => {
    const response = await api.get('/vendor/buses');
    return response.data;
  },
  addBus: async (data: { plateNumber: string; name: string; capacity: number }) => {
    const response = await api.post('/vendor/buses', data);
    return response.data;
  },
  assignRoute: async (data: { busId: number; routeId: string }) => {
    const response = await api.post(`/vendor/buses/${data.busId}/assign-route`, {
      routeId: data.routeId,
    });
    return response.data;
  },
  updateBusLocation: async (busId: number, location: { lat: number; lng: number }) => {
    const response = await api.post(`/vendor/buses/${busId}/location`, location);
    return response.data;
  },
  deleteBus: async (busId: number) => {
    const response = await api.delete(`/vendor/buses/${busId}`);
    return response.data;
  },
  getSettings: async () => {
    const { data } = await api.get('/vendor/settings');
    return data;
  },
  updateSettings: async (settingsData: any) => {
    const { data } = await api.put('/vendor/settings', settingsData);
    return data;
  },
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
  markNotificationAsRead: async (id: string | number) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  markAllNotificationsAsRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
  deleteNotification: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  }
};

export const routes = {
  getAll: async () => {
    const { data } = await api.get('/routes');
    return data;
  },
  getActive: async () => {
    const { data } = await api.get('/routes/active');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/routes/${id}`);
    return data;
  },
  create: async (routeData: any) => {
    const { data } = await api.post('/routes', routeData);
    return data;
  },
  update: async (id: number, routeData: any) => {
    const { data } = await api.patch(`/routes/${id}`, routeData);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/routes/${id}`);
    return data;
  },
  getWithReservations: async (travelDate?: string) => {
    let url = '/routes/with-reservations';
    if (travelDate) {
      url += `?travelDate=${encodeURIComponent(travelDate)}`;
    }
    const { data } = await api.get(url);
    return data;
  },
  getCompleted: async () => {
    const { data } = await api.get('/vendor/routes/completed');
    return data;
  },
  getSeatReservations: async (routeId: number, travelDate?: string) => {
    let url = `/routes/${routeId}/seats`;
    if (travelDate) {
      url += `?travelDate=${encodeURIComponent(travelDate)}`;
    }
    const { data } = await api.get(url);
    return data;
  },
  getDashboardStats: async () => {
    const { data } = await api.get('/routes/dashboard-stats');
    return data;
  },
  getRecentBookings: async () => {
    const { data } = await api.get('/routes/recent-bookings');
    return data;
  },
  getUpcomingTrips: async () => {
    const { data } = await api.get('/routes/upcoming-trips');
    return data;
  },
  reserveSeat: async (routeId: number, seatData: any) => {
    const { data } = await api.post(`/routes/${routeId}/seats`, seatData);
    return data;
  },
  cancelReservation: async (routeId: number, seatId: number) => {
    const { data } = await api.delete(`/routes/${routeId}/seats/${seatId}`);
    return data;
  },
  quickBookNextAvailableSeat: async (routeId: number, bookingData: any) => {
    const { data } = await api.post(`/routes/${routeId}/quick-book`, bookingData);
    return data;
  }
};

export const tickets = {
  getAll: async () => {
    const { data } = await api.get('/tickets');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },
  getByRoute: async (routeId: number) => {
    const { data } = await api.get(`/tickets?routeId=${routeId}`);
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status });
    return data;
  },
  getHistory: async () => {
    const { data } = await api.get('/vendor/tickets/history');
    return data;
  },
  getRouteHistory: async () => {
    const { data } = await api.get('/vendor/routes/history');
    return data;
  },
  getActivities: async () => {
    const { data } = await api.get('/vendor/activities');
    return data;
  },
  create: async (ticketData: any) => {
    const { data } = await api.post('/tickets', ticketData);
    return data;
  },
  update: async (id: number, ticketData: any) => {
    const { data } = await api.put(`/tickets/${id}`, ticketData);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/tickets/${id}`);
    return data;
  },
  createWalkIn: async (ticketData: any) => {
    const { data } = await api.post('/tickets/walk-in', ticketData);
    return data;
  }
};

export const customers = {
  getAll: async () => {
    const { data } = await api.get('/customers');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/customers/stats');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },
  update: async (id: number, customerData: any) => {
    const { data } = await api.patch(`/customers/${id}`, customerData);
    return data;
  },
  deactivate: async (id: number) => {
    const { data } = await api.patch(`/customers/${id}/deactivate`);
    return data;
  },
  getBookings: async (customerId: number) => {
    const { data } = await api.get(`/customers/${customerId}/bookings`);
    return data;
  }
};

interface AnalyticsData {
  revenue: number;
  averageDailyRevenue: number;
  totalBookings: number;
  averageDailyBookings: number;
  activeRoutes: number;
  totalCustomers: number;
  averageRating: number;
  revenueData: Array<{ name: string; revenue: number }>;
  bookingsData: Array<{ name: string; bookings: number }>;
  routesData: Array<{ name: string; value: number }>;
  customerData: Array<{ name: string; customers: number }>;
  previousRevenue: number;
  previousBookings: number;
}

export const reports = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const { data } = await api.get('/vendor/analytics');
    return data;
  },

  downloadReport: async (type: string, startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.get(`/vendor/reports/excel/${type}`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  },

  getRevenueChart: async (startDate: string, endDate: string, type: string): Promise<Array<{ name: string; revenue: number }>> => {
    const { data } = await api.get('/vendor/reports/revenue-chart', { params: { startDate, endDate, type } });
    return data;
  },

  getBookingsChart: async (startDate: string, endDate: string, type: string): Promise<Array<{ name: string; bookings: number }>> => {
    const { data } = await api.get('/vendor/reports/bookings-chart', { params: { startDate, endDate, type } });
    return data;
  },

  getRoutesChart: async (startDate: string, endDate: string): Promise<Array<{ name: string; value: number }>> => {
    const { data } = await api.get('/vendor/reports/routes-chart', { params: { startDate, endDate } });
    return data;
  },

  getCustomerChart: async (startDate: string, endDate: string, type: string): Promise<Array<{ name: string; customers: number }>> => {
    const { data } = await api.get('/vendor/reports/customer-chart', { params: { startDate, endDate, type } });
    return data;
  }
};

export default api;