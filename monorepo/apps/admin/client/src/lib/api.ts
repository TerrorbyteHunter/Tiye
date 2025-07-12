import { format } from 'date-fns';

// Utility functions for consistent field mapping
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const convertObjectKeys = (obj: any, converter: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectKeys(item, converter));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = converter(key);
      result[newKey] = convertObjectKeys(obj[key], converter);
      return result;
    }, {} as any);
  }
  return obj;
};

export const toCamelCaseObject = (obj: any): any => convertObjectKeys(obj, toCamelCase);
export const toSnakeCaseObject = (obj: any): any => convertObjectKeys(obj, toSnakeCase);

// Helper to ensure full ISO date-time strings
export function toFullDateTime(timeStr: any): string | null {
  if (!timeStr) return null;
  // If already a valid ISO string, return as is
  const d = new Date(timeStr);
  if (!isNaN(d.getTime()) && typeof timeStr === 'string' && timeStr.includes('T')) return d.toISOString();
  // If time-only (e.g., "06:00"), combine with today
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');
    today.setHours(Number(hours), Number(minutes), 0, 0);
    return today.toISOString();
  }
  // If it's a valid date but not ISO, return ISO
  if (!isNaN(d.getTime())) return d.toISOString();
  return null;
}

// Format date for display
export function formatDateTime(date: string | Date | null): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return format(d, 'MMM d, yyyy h:mm a');
  } catch (err) {
    return 'Invalid Date';
  }
}

// API base URL
const API_BASE = '/api';

// API endpoints
export const API = {
  // Auth
  login: `${API_BASE}/login`,
  vendorLogin: `${API_BASE}/vendor/login`,
  logout: `${API_BASE}/logout`,
  refreshToken: `${API_BASE}/refresh-token`,

  // Routes
  routes: `${API_BASE}/routes`,
  routeById: (id: number) => `${API_BASE}/routes/${id}`,
  routeSeats: (id: number) => `${API_BASE}/routes/${id}/seats`,
  routeSeatById: (routeId: number, seatId: number) => 
    `${API_BASE}/routes/${routeId}/seats/${seatId}`,

  // Tickets
  tickets: `${API_BASE}/tickets`,
  ticketById: (id: number) => `${API_BASE}/tickets/${id}`,
  ticketByReference: (reference: string) => 
    `${API_BASE}/tickets/reference/${reference}`,
  walkInTicket: `${API_BASE}/tickets/walk-in`,

  // Vendors
  vendors: `${API_BASE}/vendors`,
  vendorById: (id: number) => `${API_BASE}/vendors/${id}`,

  // Buses
  buses: `${API_BASE}/buses`,
  busById: (id: number) => `${API_BASE}/buses/${id}`,
  busesByVendor: (vendorId: number) => 
    `${API_BASE}/buses/vendor/${vendorId}`,
  assignBus: `${API_BASE}/buses/assign`,
  updateBusLocation: `${API_BASE}/buses/location`,

  // Analytics
  dashboardStats: `${API_BASE}/analytics/dashboard`,
  exportData: `${API_BASE}/analytics/export`,
} as const;

// API request wrapper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return toCamelCaseObject(data) as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API request with snake_case conversion for request body
export async function apiRequestWithSnakeCase<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const snakeCaseOptions = {
    ...options,
    body: options.body ? JSON.stringify(toSnakeCaseObject(JSON.parse(options.body as string))) : undefined,
  };
  return apiRequest<T>(endpoint, snakeCaseOptions);
} 