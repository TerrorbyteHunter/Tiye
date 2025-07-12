export type RouteStatus = 'active' | 'inactive';
export type TicketStatus = 'paid' | 'pending' | 'refunded' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'credit_card' | 'cash' | 'bank_transfer';
export type VendorStatus = 'active' | 'inactive' | 'pending';

export interface Route {
  id: number;
  vendorId: number;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedArrival?: string;
  fare: number;
  capacity: number;
  status: RouteStatus;
  daysOfWeek: string[];
  kilometers: number;
  stops: string[];
  createdAt: Date;
}

export interface Ticket {
  id: number;
  bookingReference: string;
  routeId: number;
  vendorId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  seatNumber: number;
  status: TicketStatus;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  bookingDate: Date;
  travelDate: Date;
}

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: VendorStatus;
  logo?: string;
  createdAt: Date;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  active?: boolean;
  avatarUrl?: string;
}

export interface InsertAdmin {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff';
  active?: boolean;
  avatarUrl?: string;
} 