import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);
export const vendorStatusEnum = pgEnum('vendor_status', ['active', 'inactive', 'pending']);
export const routeStatusEnum = pgEnum('route_status', ['active', 'inactive']);
export const ticketStatusEnum = pgEnum('ticket_status', ['pending', 'confirmed', 'cancelled', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['mobile_money', 'credit_card', 'cash', 'bank_transfer']);
export const vendorUserRoleEnum = pgEnum('vendor_user_role', ['owner', 'manager', 'operator', 'viewer']);
export const permissionEnum = pgEnum('permission', [
  'dashboard_view',
  'routes_view',
  'routes_create',
  'routes_edit',
  'routes_delete',
  'tickets_view',
  'tickets_create',
  'tickets_edit',
  'tickets_delete',
  'tickets_refund',
  'buses_view',
  'buses_create',
  'buses_edit',
  'buses_delete',
  'schedule_view',
  'schedule_create',
  'schedule_edit',
  'schedule_delete',
  'history_view',
  'reports_view',
  'reports_export',
  'settings_view',
  'settings_edit',
  'users_view',
  'users_create',
  'users_edit',
  'users_delete',
  'profile_view',
  'profile_edit',
  'support_access'
]);

// Admins table (renamed from users)
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('staff').notNull(),
  active: boolean("active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  token: text("token"),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  status: vendorStatusEnum("status").default('active').notNull(),
  logo: text("logo"),
  permissions: text("permissions").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor Users table
export const vendorUsers = pgTable("vendor_users", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: vendorUserRoleEnum("role").default('operator').notNull(),
  active: boolean("active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  token: text("token"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor User Permissions table
export const vendorUserPermissions = pgTable("vendor_user_permissions", {
  id: serial("id").primaryKey(),
  vendorUserId: integer("vendor_user_id").notNull().references(() => vendorUsers.id),
  permission: permissionEnum("permission").notNull(),
  granted: boolean("granted").default(true).notNull(),
  grantedBy: integer("granted_by").references(() => vendorUsers.id),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Routes table
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  departure: text("departure").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  estimatedArrival: text("estimated_arrival"),
  fare: integer("fare").notNull(),
  capacity: integer("capacity").default(44).notNull(),
  status: routeStatusEnum("status").default('active').notNull(),
  daysOfWeek: text("days_of_week").array().notNull(),
  kilometers: integer("kilometers").notNull(),
  stops: text("stops").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Completed trips table
export const completedTrips = pgTable("completed_trips", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  departure: text("departure").notNull(),
  destination: text("destination").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  revenue: integer("revenue").notNull(),
  rating: integer("rating"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').notNull().references(() => routes.id),
  vendorId: integer('vendor_id').notNull().references(() => vendors.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  seatNumber: integer('seat_number').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled', 'refunded'] }).notNull().default('pending'),
  amount: numeric('amount').notNull(),
  travelDate: timestamp('travel_date').notNull(),
  bookingReference: text('booking_reference').notNull(),
  paymentMethod: text('payment_method', { enum: ['mobile_money', 'cash', 'card'] }),
  paymentReference: text('payment_reference'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"),
  action: text("action").notNull(),
  details: json("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Roles table for custom role templates
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").array().notNull(),
  color: text("color").default('bg-blue-500').notNull(),
  isSystem: boolean("is_system").default(false).notNull(), // Built-in vs custom roles
  createdBy: integer("created_by_admin_id").references(() => admins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  routeId: integer('route_id').notNull(),
  vendorId: integer('vendor_id').notNull(),
  ticketId: integer('ticket_id').notNull(),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  lastLogin: true,
  token: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertVendorUserSchema = createInsertSchema(vendorUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  token: true,
  ipAddress: true,
});

export const insertVendorUserPermissionSchema = createInsertSchema(vendorUserPermissions).omit({
  id: true,
  createdAt: true,
  grantedAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertCompletedTripSchema = createInsertSchema(completedTrips).omit({
  id: true,
  completedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Types
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertVendorUser = z.infer<typeof insertVendorUserSchema>;
export type VendorUser = typeof vendorUsers.$inferSelect;

export type InsertVendorUserPermission = z.infer<typeof insertVendorUserPermissionSchema>;
export type VendorUserPermission = typeof vendorUserPermissions.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

export type InsertCompletedTrip = z.infer<typeof insertCompletedTripSchema>;
export type CompletedTrip = typeof completedTrips.$inferSelect;

export type InsertTicket = typeof tickets.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = Omit<typeof activities.$inferSelect, 'details'> & { details?: Record<string, unknown> };

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission: string;
  granted: boolean;
  created_at: string;
  created_by: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}
