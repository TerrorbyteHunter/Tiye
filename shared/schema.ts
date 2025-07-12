import { pgTable, serial, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Enums and Types
export const SeatStatus = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  RESERVED: 'reserved'
} as const;

export const TicketStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const RouteStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const VendorStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
} as const;

export type SeatStatusType = typeof SeatStatus[keyof typeof SeatStatus];
export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus];
export type RouteStatusType = typeof RouteStatus[keyof typeof RouteStatus];
export type VendorStatusType = typeof VendorStatus[keyof typeof VendorStatus];

// Zod schemas
export const ticketStatusEnum = z.enum(['pending', 'confirmed', 'cancelled', 'refunded']);
export const routeStatusEnum = z.enum(['active', 'inactive', 'completed', 'cancelled']);
export const vendorStatusEnum = z.enum(['active', 'inactive', 'pending']);

// Interfaces
export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: VendorStatusType;
  logo?: string;
  createdAt: Date;
}

export interface Seat {
  number: number;
  status: SeatStatusType;
  passengerName?: string;
}

export interface Ticket {
  id: number;
  routeId: number;
  vendorId: number;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  seatNumber: number;
  amount: number;
  status: TicketStatusType;
  travelDate: Date;
  createdAt: Date;
}

export interface Route {
  id: number;
  vendorId: number;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedArrival: string;
  fare: number;
  capacity: number;
  status: RouteStatusType;
  daysOfWeek: string[];
  kilometers: number;
  stops: string[];
  createdAt?: Date;
}

// Database tables
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  contactPerson: text('contact_person').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  departure: text('departure').notNull(),
  destination: text('destination').notNull(),
  departureTime: text('departure_time').notNull(),
  estimatedArrival: text('estimated_arrival').notNull(),
  fare: decimal('fare').notNull(),
  capacity: integer('capacity').notNull(),
  status: text('status').notNull(),
  daysOfWeek: text('days_of_week').array(),
  kilometers: decimal('kilometers').notNull(),
  stops: text('stops').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id).notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  bookingReference: text('booking_reference').notNull(),
  passengerName: text('passenger_name').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  seatNumber: integer('seat_number').notNull(),
  amount: decimal('amount').notNull(),
  status: text('status').notNull(),
  travelDate: timestamp('travel_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const completedTrips = pgTable('completed_trips', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id).notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  departure: text('departure').notNull(),
  destination: text('destination').notNull(),
  departureTime: timestamp('departure_time').notNull(),
  arrivalTime: timestamp('arrival_time').notNull(),
  passengerCount: integer('passenger_count').notNull(),
  revenue: decimal('revenue').notNull(),
  rating: decimal('rating'),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
}); 