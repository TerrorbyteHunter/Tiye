import { 
  admins, type Admin, type InsertAdmin, 
  vendors, type Vendor, type InsertVendor,
  routes, type Route, type InsertRoute,
  tickets, type Ticket, type InsertTicket,
  settings, type Setting, type InsertSetting,
  activities, type Activity, type InsertActivity,
  roles, type Role, type InsertRole,
  type UserPermissionOverride, type AuditLog
} from "@shared/schema";
import pkg from 'pg';
const { Pool } = pkg;
import type { Pool as PoolType } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

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

const toCamelCaseObject = (obj: any): any => convertObjectKeys(obj, toCamelCase);
const toSnakeCaseObject = (obj: any): any => convertObjectKeys(obj, toSnakeCase);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<Admin | undefined>;
  getUserByUsername(username: string): Promise<Admin | undefined>;
  createUser(user: InsertAdmin): Promise<Admin>;
  updateUser(id: number, user: Partial<InsertAdmin>): Promise<Admin | undefined>;
  listAdmins(): Promise<Admin[]>;
  deleteUser(id: number): Promise<boolean>;
  setUserToken(id: number, token: string): Promise<boolean>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  listVendors(): Promise<Vendor[]>;
  deleteVendor(id: number): Promise<boolean>;
  
  // Route operations
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  listRoutes(): Promise<Route[]>;
  getRoutesByVendor(vendorId: number): Promise<Route[]>;
  deleteRoute(id: number): Promise<boolean>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByReference(reference: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  listTickets(): Promise<Ticket[]>;
  getTicketsByRoute(routeId: number): Promise<Ticket[]>;
  getTicketsByVendor(vendorId: number): Promise<Ticket[]>;
  
  // Settings operations
  getSetting(name: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(name: string, value: string): Promise<Setting | undefined>;
  listSettings(): Promise<Setting[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(limit?: number): Promise<Activity[]>;
  
  // Role operations
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  listRoles(): Promise<Role[]>;
  deleteRole(id: number): Promise<boolean>;
  
  // Analytics operations
  getDashboardStats(): Promise<DashboardStats & { revenueData: { date: string, revenue: number }[], bookingDistribution: { name: string, value: number }[], revenueDistribution: { name: string, value: number }[], bookingsData: { date: string, bookings: number }[] }>;

  // Bus-related functions
  getBusesByVendorId(vendorId: number): Promise<any[]>;
  createBus(data: {
    vendorId: number;
    plateNumber: string;
    name: string;
    capacity: number;
    status: string;
  }): Promise<any>;
  assignBusRoute(busId: number, routeId: number, vendorId: number): Promise<any>;
  updateBusLocation(busId: number, vendorId: number, location: { lat: number; lng: number }): Promise<any>;
  deleteBus(busId: number, vendorId: number): Promise<any>;

  // User Permission Overrides
  getUserPermissionOverrides(adminId: string): Promise<UserPermissionOverride[]>;
  addUserPermissionOverride(override: Omit<UserPermissionOverride, 'id' | 'created_at'>): Promise<UserPermissionOverride>;
  removeUserPermissionOverride(adminId: string, permission: string): Promise<void>;
  getUserEffectivePermissions(adminId: string): Promise<string[]>;
  updateUserPermissionOverride(adminId: string, permission: string, granted: boolean): Promise<UserPermissionOverride | null>;

  // Audit Logging
  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog>;
  getAuditLogs(filters: {
    adminId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]>;
  getAuditLogsCount(filters: {
    adminId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number>;

  // New function
  getUsersByVendorId(vendorId: number): Promise<Admin[]>;

  // Review operations
  createReview(review: {
    adminId: string;
    routeId: number;
    vendorId: number;
    ticketId: number;
    rating: number;
    review: string;
  }): Promise<any>;
  getReviewsByRoute(routeId: number): Promise<any[]>;
  getReviewsByVendor(vendorId: number): Promise<any[]>;
  getReviewsByTicket(ticketId: number): Promise<any[]>;
  getReviewsByUser(adminId: string): Promise<any[]>;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVendors: number;
  activeRoutes: number;
  recentBookings: Ticket[];
  recentActivities: Activity[];
}

class DbStorage implements IStorage {
  pool: PoolType;
  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  // User operations
  async getUser(id: number): Promise<Admin | undefined> {
    const result = await this.pool.query('SELECT * FROM admins WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserByUsername(username: string): Promise<Admin | undefined> {
    const result = await this.pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    return result.rows[0];
  }

  async createUser(user: InsertAdmin): Promise<Admin> {
    const result = await this.pool.query(
      'INSERT INTO admins (username, password, email, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.username, user.password, user.email, user.fullName, user.role]
    );
    return result.rows[0];
  }

  async updateUser(id: number, user: Partial<InsertAdmin>): Promise<Admin | undefined> {
    // Map camelCase keys to snake_case for DB columns
    const updates = Object.entries(user).map(([key, value], index) => `${toSnakeCase(key)} = $${index + 2}`);
    const values = Object.values(user);
    const result = await this.pool.query(
      `UPDATE admins SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async listAdmins(): Promise<Admin[]> {
    const result = await this.pool.query('SELECT * FROM admins');
    return result.rows;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM admins WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async setUserToken(id: number, token: string): Promise<boolean> {
    const result = await this.pool.query(
      'UPDATE admins SET token = $1 WHERE id = $2',
      [token, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    const result = await this.pool.query('SELECT * FROM vendors WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const result = await this.pool.query('SELECT * FROM vendors WHERE email = $1', [email]);
    return result.rows[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await this.pool.query(
      'INSERT INTO vendors (name, email, contact_person, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [vendor.name, vendor.email, vendor.contactPerson, vendor.phone]
    );
    return result.rows[0];
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const updates = Object.entries(vendor).map(([key, value], index) => `${key} = $${index + 2}`);
    const values = Object.values(vendor);
    const result = await this.pool.query(
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async listVendors(): Promise<Vendor[]> {
    const result = await this.pool.query('SELECT * FROM vendors');
    return result.rows;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM vendors WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Route operations
  async getRoute(id: number): Promise<Route | undefined> {
    const result = await this.pool.query(
      `SELECT * FROM routes WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toCamelCaseObject(result.rows[0]) : undefined;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const snakeCaseRoute = toSnakeCaseObject(route);
    const result = await this.pool.query(
      `INSERT INTO routes (
        vendorid, departure, destination, departure_time, 
        estimated_arrival, fare, capacity, status, 
        days_of_week, kilometers, stops
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        snakeCaseRoute.vendorid,
        snakeCaseRoute.departure,
        snakeCaseRoute.destination,
        snakeCaseRoute.departure_time,
        snakeCaseRoute.estimated_arrival,
        snakeCaseRoute.fare,
        snakeCaseRoute.capacity,
        snakeCaseRoute.status,
        snakeCaseRoute.days_of_week,
        snakeCaseRoute.kilometers,
        snakeCaseRoute.stops
      ]
    );
    return toCamelCaseObject(result.rows[0]);
  }

  async updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined> {
    const snakeCaseRoute = toSnakeCaseObject(route);
    const updates = Object.entries(snakeCaseRoute)
      .map(([key, value], index) => `${key} = $${index + 2}`);
    const values = Object.values(snakeCaseRoute);
    
    const result = await this.pool.query(
      `UPDATE routes SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] ? toCamelCaseObject(result.rows[0]) : undefined;
  }

  async listRoutes(): Promise<Route[]> {
    const result = await this.pool.query(
      `SELECT r.*, v.name as vendor_name, v.id as vendor_id
       FROM routes r
       LEFT JOIN vendors v ON r.vendorid = v.id`
    );
    return result.rows.map(toCamelCaseObject);
  }

  async getRoutesByVendor(vendorId: number): Promise<Route[]> {
    const result = await this.pool.query(
      `SELECT * FROM routes WHERE vendorid = $1`,
      [vendorId]
    );
    return result.rows.map(toCamelCaseObject);
  }

  async deleteRoute(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM routes WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    const result = await this.pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getTicketByReference(reference: string): Promise<Ticket | undefined> {
    const result = await this.pool.query('SELECT * FROM tickets WHERE reference = $1', [reference]);
    return result.rows[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const snakeCaseTicket = toSnakeCaseObject(ticket);
    const result = await this.pool.query(
      `INSERT INTO tickets (
        route_id, vendor_id, customer_name, customer_phone, customer_email,
        seat_number, status, amount, travel_date, booking_reference, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        snakeCaseTicket.route_id,
        snakeCaseTicket.vendor_id,
        snakeCaseTicket.customer_name,
        snakeCaseTicket.customer_phone,
        snakeCaseTicket.customer_email,
        snakeCaseTicket.seat_number,
        snakeCaseTicket.status,
        snakeCaseTicket.amount,
        snakeCaseTicket.travel_date,
        snakeCaseTicket.booking_reference,
        snakeCaseTicket.created_at || new Date().toISOString()
      ]
    );
    return toCamelCaseObject(result.rows[0]);
  }

  async updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const updates = Object.entries(ticket).map(([key, value], index) => `${key} = $${index + 2}`);
    const values = Object.values(ticket);
    const result = await this.pool.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async listTickets(): Promise<Ticket[]> {
    const result = await this.pool.query('SELECT * FROM tickets');
    return result.rows;
  }

  async getTicketsByRoute(routeId: number): Promise<Ticket[]> {
    const result = await this.pool.query('SELECT * FROM tickets WHERE route_id = $1', [routeId]);
    return result.rows;
  }

  async getTicketsByVendor(vendorId: number): Promise<Ticket[]> {
    const result = await this.pool.query('SELECT * FROM tickets WHERE vendor_id = $1', [vendorId]);
    return result.rows;
  }

  // Settings operations
  async getSetting(name: string): Promise<Setting | undefined> {
    const result = await this.pool.query('SELECT * FROM settings WHERE name = $1', [name]);
    return result.rows[0];
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const result = await this.pool.query(
      'INSERT INTO settings (name, value, updated_at) VALUES ($1, $2, NOW()) RETURNING *',
      [setting.name, setting.value]
    );
    return result.rows[0];
  }

  async updateSetting(name: string, value: string): Promise<Setting | undefined> {
    const result = await this.pool.query(
      `INSERT INTO settings (name, value, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (name) 
       DO UPDATE SET value = $2, updated_at = NOW() 
       RETURNING *`,
      [name, value]
    );
    return result.rows[0];
  }

  async listSettings(): Promise<Setting[]> {
    const result = await this.pool.query('SELECT * FROM settings');
    return result.rows;
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await this.pool.query(
      'INSERT INTO activities (admin_id, action, details) VALUES ($1, $2, $3) RETURNING *',
      [activity.adminId, activity.action, activity.details]
    );
    return result.rows[0];
  }

  async listActivities(limit?: number): Promise<Activity[]> {
    const query = limit 
      ? 'SELECT * FROM activities ORDER BY timestamp DESC LIMIT $1'
      : 'SELECT * FROM activities ORDER BY timestamp DESC';
    const result = await this.pool.query(query, limit ? [limit] : []);
    return result.rows;
  }

  // Role operations
  async getRole(id: number): Promise<Role | undefined> {
    const result = await this.pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRole(role: InsertRole): Promise<Role> {
    const result = await this.pool.query(
      'INSERT INTO roles (name, description, permissions, color, created_by_admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [role.name, role.description, role.permissions, role.color, role.createdBy]
    );
    return result.rows[0];
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined> {
    const updates = Object.entries(role).map(([key, value], index) => `${toSnakeCase(key)} = $${index + 2}`);
    const values = Object.values(role);
    const result = await this.pool.query(
      `UPDATE roles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async listRoles(): Promise<Role[]> {
    const result = await this.pool.query('SELECT * FROM roles');
    return result.rows;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async getDashboardStats(): Promise<DashboardStats & { revenueData: { date: string, revenue: number }[], bookingDistribution: { name: string, value: number }[], revenueDistribution: { name: string, value: number }[], bookingsData: { date: string, bookings: number }[] }> {
    const [bookings, revenue, vendors, routes, recentBookings, recentActivities, revenueByDay, bookingByVendor, revenueByVendor, bookingsByDay] = await Promise.all([
      this.pool.query('SELECT COUNT(*) FROM tickets'),
      this.pool.query('SELECT COALESCE(SUM(amount), 0) FROM tickets'),
      this.pool.query('SELECT COUNT(*) FROM vendors WHERE status = $1', ['active']),
      this.pool.query('SELECT COUNT(*) FROM routes'),
      this.pool.query('SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5'),
      this.pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 5'),
      this.pool.query(`
        SELECT to_char(created_at::date, 'YYYY-MM-DD') as date, COALESCE(SUM(amount), 0) as revenue
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY date
        ORDER BY date ASC
      `),
      this.pool.query(`
        SELECT v.name as vendor_name, COUNT(t.id) as booking_count
        FROM tickets t
        JOIN routes r ON t.route_id = r.id
        JOIN vendors v ON r.vendorid = v.id
        WHERE t.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY v.name
        ORDER BY booking_count DESC
      `),
      this.pool.query(`
        SELECT v.name as vendor_name, COALESCE(SUM(t.amount), 0) as revenue
        FROM tickets t
        JOIN routes r ON t.route_id = r.id
        JOIN vendors v ON r.vendorid = v.id
        WHERE t.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY v.name
        ORDER BY revenue DESC
      `),
      this.pool.query(`
        SELECT to_char(created_at::date, 'YYYY-MM-DD') as date, COUNT(*) as bookings
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY date
        ORDER BY date ASC
      `)
    ]);

    // Map revenueByDay to array of { date, revenue }
    const revenueData = revenueByDay.rows.map((row: any) => ({
      date: row.date,
      revenue: parseFloat(row.revenue)
    }));

    // Map bookingsByDay to array of { date, bookings }
    const bookingsData = bookingsByDay.rows.map((row: any) => ({
      date: row.date,
      bookings: parseInt(row.bookings)
    }));

    // Map bookingByVendor to array of { name, value }, format name as 'First L.'
    const bookingDistribution = bookingByVendor.rows.map((row: any) => {
      const parts = row.vendor_name.split(' ');
      let shortName = parts[0];
      if (parts.length > 1 && parts[1].length > 0) {
        shortName += ' ' + parts[1][0] + '.';
      }
      return {
        name: shortName,
        value: parseInt(row.booking_count)
      };
    });

    // Map revenueByVendor to array of { name, value }, format name as 'First L.'
    const revenueDistribution = revenueByVendor.rows.map((row: any) => {
      const parts = row.vendor_name.split(' ');
      let shortName = parts[0];
      if (parts.length > 1 && parts[1].length > 0) {
        shortName += ' ' + parts[1][0] + '.';
      }
      return {
        name: shortName,
        value: parseFloat(row.revenue)
      };
    });

    return {
      totalBookings: parseInt(bookings.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].coalesce),
      activeVendors: parseInt(vendors.rows[0].count),
      activeRoutes: parseInt(routes.rows[0].count),
      recentBookings: recentBookings.rows.map(toCamelCaseObject),
      recentActivities: recentActivities.rows,
      revenueData,
      bookingDistribution,
      revenueDistribution,
      bookingsData
    };
  }

  async getBusesByVendorId(vendorId: number) {
    const result = await this.pool.query(
      `SELECT b.*, r.departure || ' → ' || r.destination as route_name
       FROM buses b
       LEFT JOIN routes r ON b.assigned_route_id = r.id
       WHERE b.vendor_id = $1 AND b.status = 'active'
       ORDER BY b.created_at DESC`,
      [vendorId]
    );
    return result.rows;
  }

  async createBus(data: { vendorId: number; plateNumber: string; name: string; capacity: number; status: string; }) {
    const result = await this.pool.query(
      `INSERT INTO buses (vendor_id, plate_number, name, capacity, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [data.vendorId, data.plateNumber, data.name, data.capacity, data.status]
    );
    return result.rows[0];
  }

  async assignBusRoute(busId: number, routeId: number, vendorId: number) {
    const result = await this.pool.query(
      `UPDATE buses SET assigned_route_id = $1, updated_at = NOW()
       WHERE id = $2 AND vendor_id = $3 RETURNING *`,
      [routeId, busId, vendorId]
    );
    return result.rows[0];
  }

  async updateBusLocation(busId: number, vendorId: number, location: { lat: number; lng: number }) {
    const result = await this.pool.query(
      `UPDATE buses SET current_location_lat = $1, current_location_lng = $2, updated_at = NOW()
       WHERE id = $3 AND vendor_id = $4 RETURNING *`,
      [location.lat, location.lng, busId, vendorId]
    );
    return result.rows[0];
  }

  async deleteBus(busId: number, vendorId: number) {
    const result = await this.pool.query(
      `UPDATE buses SET status = 'inactive', updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2 RETURNING *`,
      [busId, vendorId]
    );
    return result.rows[0];
  }

  // User Permission Overrides
  async getUserPermissionOverrides(adminId: string): Promise<UserPermissionOverride[]> {
    const result = await this.pool.query('SELECT * FROM admin_permission_overrides WHERE admin_id = $1 ORDER BY created_at DESC', [parseInt(adminId)]);
    return result.rows;
  }

  async addUserPermissionOverride(override: Omit<UserPermissionOverride, 'id' | 'created_at'>): Promise<UserPermissionOverride> {
    const id = `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.pool.query(
      'INSERT INTO admin_permission_overrides (id, admin_id, permission, granted, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, parseInt(override.user_id), override.permission, override.granted, parseInt(override.created_by), new Date().toISOString()]
    );
    return result.rows[0];
  }

  async removeUserPermissionOverride(adminId: string, permission: string): Promise<void> {
    await this.pool.query('DELETE FROM admin_permission_overrides WHERE admin_id = $1 AND permission = $2', [parseInt(adminId), permission]);
  }

  async getUserEffectivePermissions(adminId: string): Promise<string[]> {
    console.log('🔍 Getting effective permissions for user:', adminId);
    
    // Get base permissions from user's role
    const user = await this.getUser(parseInt(adminId));
    console.log('   User found:', user);
    
    if (!user) {
      console.log('   No user found, returning empty permissions');
      return [];
    }

    let permissions: string[] = [];

    // Handle user role (enum: 'admin', 'staff')
    if (user.role) {
      console.log('   User role:', user.role, 'Type:', typeof user.role);
      
      // Check if it's a numeric role ID (custom role)
      const roleId = parseInt(user.role);
      console.log('   Parsed roleId:', roleId, 'IsNaN:', isNaN(roleId));
      
      if (!isNaN(roleId)) {
        // It's a custom role ID
        console.log('   Fetching custom role with ID:', roleId);
        const role = await this.getRole(roleId);
        console.log('   Custom role found:', role);
        if (role) {
          permissions = [...role.permissions];
        }
      } else {
        // It's a system role enum ('admin', 'staff')
        console.log('   Using system role permissions for:', user.role);
        // Define default permissions for system roles
        if (user.role === 'admin') {
          permissions = [
            'dashboard_view',
            'routes_view', 'routes_create', 'routes_edit', 'routes_delete',
            'tickets_view', 'tickets_create', 'tickets_edit', 'tickets_delete', 'tickets_refund',
            'buses_view', 'buses_create', 'buses_edit', 'buses_delete',
            'schedule_view', 'schedule_create', 'schedule_edit', 'schedule_delete',
            'history_view',
            'reports_view', 'reports_export',
            'settings_view', 'settings_edit',
            'users_view', 'users_create', 'users_edit', 'users_delete',
            'profile_view', 'profile_edit',
            'support_access'
          ];
        } else if (user.role === 'staff') {
          permissions = [
            'dashboard_view',
            'routes_view',
            'tickets_view', 'tickets_create', 'tickets_edit',
            'buses_view',
            'schedule_view',
            'history_view',
            'reports_view',
            'profile_view', 'profile_edit'
          ];
        }
      }
    }

    console.log('   Base permissions:', permissions);

    // Apply permission overrides
    const overrides = await this.getUserPermissionOverrides(adminId);
    console.log('   Permission overrides:', overrides);
    
    for (const override of overrides) {
      if (override.granted) {
        if (!permissions.includes(override.permission)) {
          permissions.push(override.permission);
        }
      } else {
        permissions = permissions.filter(p => p !== override.permission);
      }
    }

    console.log('   Final effective permissions:', permissions);
    return permissions;
  }

  // Audit Logging
  async addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const result = await this.pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [log.user_id, log.action, log.resource_type, log.resource_id, JSON.stringify(log.details), log.ip_address, log.user_agent, new Date().toISOString()]
    );
    return result.rows[0];
  }

  async getAuditLogs(filters: {
    adminId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.adminId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(parseInt(filters.adminId));
      paramIndex++;
    }

    if (filters.action) {
      query += ` AND action = $${paramIndex}`;
      params.push(filters.action);
      paramIndex++;
    }

    if (filters.resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(filters.resourceType);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await this.pool.query(query, params);
    
    return result.rows.map(log => ({
      ...log,
      details: typeof log.details === "string" ? JSON.parse(log.details) : log.details
    }));
  }

  async getAuditLogsCount(filters: {
    adminId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.adminId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(parseInt(filters.adminId));
      paramIndex++;
    }

    if (filters.action) {
      query += ` AND action = $${paramIndex}`;
      params.push(filters.action);
      paramIndex++;
    }

    if (filters.resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(filters.resourceType);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.endDate);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // New function
  async getUsersByVendorId(vendorId: number): Promise<Admin[]> {
    const result = await this.pool.query('SELECT * FROM admins WHERE vendor_id = $1', [vendorId]);
    return result.rows;
  }

  // Review operations
  async createReview(review: {
    adminId: string;
    routeId: number;
    vendorId: number;
    ticketId: number;
    rating: number;
    review: string;
  }): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO reviews (user_id, route_id, vendor_id, ticket_id, rating, review, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [review.adminId, review.routeId, review.vendorId, review.ticketId, review.rating, review.review]
    );
    return result.rows[0];
  }

  async getReviewsByRoute(routeId: number): Promise<any[]> {
    const result = await this.pool.query('SELECT * FROM reviews WHERE route_id = $1 ORDER BY created_at DESC', [routeId]);
    return result.rows;
  }

  async getReviewsByVendor(vendorId: number): Promise<any[]> {
    const result = await this.pool.query('SELECT * FROM reviews WHERE vendor_id = $1 ORDER BY created_at DESC', [vendorId]);
    return result.rows;
  }

  async getReviewsByTicket(ticketId: number): Promise<any[]> {
    const result = await this.pool.query('SELECT * FROM reviews WHERE ticket_id = $1 ORDER BY created_at DESC', [ticketId]);
    return result.rows;
  }

  async getReviewsByUser(adminId: string): Promise<any[]> {
    const result = await this.pool.query('SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC', [adminId]);
    return result.rows;
  }

  async updateUserPermissionOverride(adminId: string, permission: string, granted: boolean): Promise<UserPermissionOverride | null> {
    const result = await this.pool.query(
      'UPDATE admin_permission_overrides SET granted = $1 WHERE admin_id = $2 AND permission = $3 RETURNING *',
      [granted, parseInt(adminId), permission]
    );
    return result.rows[0] || null;
  }
}

export const storage = new DbStorage();
