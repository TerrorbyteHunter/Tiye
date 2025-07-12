export type VendorStatus = 'active' | 'inactive' | 'pending';
export type RouteStatus = 'active' | 'inactive';
export type TicketStatus = 'confirmed' | 'pending' | 'refunded' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'credit_card' | 'cash' | 'bank_transfer';

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
  };
  token: string;
}

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  logo?: string;
}

export interface Route {
  id: number;
  vendorId: number;
  departure: string;
  destination: string;
  departureTime: string;
  fare: number;
  capacity: number;
  status: 'active' | 'cancelled' | 'completed';
}

export interface Ticket {
  id: number;
  routeId: number;
  userId: number;
  seatNumber: number;
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: string;
  bookingSource: 'vendor' | 'online' | 'mobile';
  passengerName: string;
  phone: string;
  email?: string;
  amount: number;
  route: Route;
}

export interface VendorLoginData {
  email: string;
  password: string;
}

export interface VendorAuthResponse {
  vendor: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
} 