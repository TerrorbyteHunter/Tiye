import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from 'jsonwebtoken';
import { createSession, validateSession, endSession, refreshSession } from './session';
import {
  loginSchema, insertAdminSchema, insertVendorSchema, 
  insertRouteSchema, insertTicketSchema, insertActivitySchema,
  insertRoleSchema,
  type Route, type Ticket,
  routeStatusEnum, ticketStatusEnum
} from "../shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  createDatabaseBackup, 
  listBackups, 
  createAnalyticsBackup, 
  createAuditBackup, 
  createOperationalBackup, 
  createUsersBackup, 
  getBackupTypes 
} from './backup';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility functions for consistent field mapping and date handling
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

// Helper to ensure full ISO date-time strings
function toFullDateTime(timeStr: any): string | null {
  if (!timeStr) return null;
  
  // If already a valid ISO string, return as is
  const d = new Date(timeStr);
  if (!isNaN(d.getTime()) && typeof timeStr === 'string' && timeStr.includes('T')) {
    // If it's a datetime-local format (YYYY-MM-DDTHH:mm), ensure it has timezone info
    if (timeStr.length === 16) { // YYYY-MM-DDTHH:mm format
      return new Date(timeStr + ':00.000Z').toISOString();
    }
    return d.toISOString();
  }
  
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

// Constants for status values
const ROUTE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

const TICKET_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Define seat status type
type SeatStatus = 'available' | 'booked' | 'reserved';

const SEAT_STATUS = {
  AVAILABLE: 'available' as SeatStatus,
  BOOKED: 'booked' as SeatStatus,
  RESERVED: 'reserved' as SeatStatus
};

interface SeatInfo {
  number: number;
  status: SeatStatus;
  passengerName?: string;
}

interface RouteWithSeats extends Route {
  seats: SeatInfo[];
  bookedSeats: number;
  totalSeats: number;
}

// JWT Secret (in production, this would be an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "tiyende-super-secret-key";
const JWT_EXPIRES_IN = "24h";

// Middleware to validate JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  console.log('Authenticating token...');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Verified token payload:', user);
    (req as any).user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Admin privileges required" });
  }

  next();
};

// Middleware to check vendor permissions
const requireVendorPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const user = (req as any).user;
      
      if (user.role === 'admin') {
        // Admins have all permissions
        return next();
      }
      
      if (user.role !== 'vendor') {
        return res.status(403).json({ message: "Vendor access required" });
      }
      
      // Get vendor permissions
      const vendor = await storage.getVendor(user.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      const vendorPermissions = vendor.permissions || [];
      
      if (!vendorPermissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: `Permission '${requiredPermission}' required`,
          requiredPermission,
          availablePermissions: vendorPermissions
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Middleware to check vendor user permissions
const requireVendorUserPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'vendor_user') {
        return res.status(403).json({ message: 'Vendor user access required' });
      }
      const { rows } = await storage.pool.query(
        'SELECT granted FROM vendor_user_permissions WHERE vendor_user_id = $1 AND permission = $2',
        [user.id, requiredPermission]
      );
      if (rows.length === 0 || !rows[0].granted) {
        return res.status(403).json({ message: `Permission '${requiredPermission}' required` });
      }
      next();
    } catch (error) {
      console.error('Vendor user permission check error:', error);
      res.status(500).json({ message: 'Error checking vendor user permissions' });
    }
  };
};

// Audit logging middleware
const auditLog = (action: string, resourceType: string, getResourceId: (req: Request) => string, getDetails?: (req: Request) => Record<string, any>) => {
  return async (req: Request, res: Response, next: Function) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after the response is sent
      try {
        const user = (req as any).user;
        if (user) {
          const resourceId = getResourceId(req);
          const details = getDetails ? getDetails(req) : {};
          
          storage.addAuditLog({
            user_id: user.id?.toString() || 'unknown',
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            details,
            ip_address: req.ip || req.connection.remoteAddress || 'unknown',
            user_agent: req.get('User-Agent') || 'unknown'
          }).catch(err => {
            console.error('Failed to log audit event:', err);
          });
        }
      } catch (error) {
        console.error('Audit logging error:', error);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Configure multer for avatar uploads
const avatarUpload = multer({
  dest: path.join(__dirname, '../../../public/avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const api = "/api";

  // Test endpoint to verify backend is working
  app.get(`${api}/test`, (req, res) => {
    console.log("Test endpoint called");
    res.json({ message: "Admin backend is working!", timestamp: new Date().toISOString() });
  });

  // Handle validation errors
  const handleValidationError = (err: unknown) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      console.error("Zod validation error details:", validationError);
      return validationError.message;
    }
    return err instanceof Error ? err.message : "Validation error";
  };

  // Auth routes
  app.post(`${api}/login`, async (req, res) => {
    try {
      console.log("=== LOGIN REQUEST RECEIVED ===");
      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Request method:", req.method);
      console.log("Request URL:", req.url);

      // Get username and password from request body
      const { username, password } = req.body || {};
      console.log("Extracted credentials:", { username, password: password ? '[HIDDEN]' : 'undefined' });

      if (!username || !password) {
        console.log("Login failed: Missing username or password");
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user exists in the system
      console.log("Checking if user exists:", username);
      let user = await storage.getUserByUsername(username);
      console.log("User lookup result:", user ? "Found" : "Not found");

      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password using bcrypt
      console.log("Checking password...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password validation result:", isValidPassword ? "Valid" : "Invalid");

      if (!isValidPassword) {
        console.log("Login failed: Invalid password");
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create a new session
      console.log("Creating session for user:", user.id);
      const forwarded = req.headers['x-forwarded-for'];
      const ipAddress = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const token = await createSession(user.id, ipAddress, userAgent);
      console.log("Session created, token generated");

      const responseData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        token
      };

      // Log successful login
      await storage.addAuditLog({
        user_id: user.id.toString(),
        action: 'login',
        resource_type: 'auth',
        resource_id: user.id.toString(),
        details: { success: true, username: user.username },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      console.log("Login successful for user:", user.username);
      console.log("=== LOGIN REQUEST COMPLETED ===");
      res.json(responseData);
    } catch (err) {
      console.error("Login error:", err);
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.post(`${api}/logout`, authenticateToken, async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await endSession(token);
    }

    res.json({ message: "Logged out successfully" });
  });

  app.post(`${api}/refresh-token`, async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const newToken = await refreshSession(token);
    if (!newToken) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    res.json({ token: newToken });
  });

  // User routes
  app.get(`${api}/admins`, authenticateToken, requireAdmin, async (req, res) => {
    const admins = await storage.listAdmins();
    // Don't send passwords to client
    res.json(admins.map(({ password, token, ...rest }) => rest));
  });

  app.post(`${api}/admins`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const adminData = insertAdminSchema.parse(req.body);
      const user = await storage.createUser(adminData);

      // Don't send password to client
      const { password, token, ...safeUser } = user;

      res.status(201).json(safeUser);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/admins/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password to client
    const { password, token, ...safeUser } = user;

    res.json(safeUser);
  });

  app.patch(`${api}/admins/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      // Allow partial updates
      const userData = insertAdminSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password to client
      const { password, token, ...safeUser } = user;

      res.json(safeUser);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/admins/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(204).send();
  });

  // Vendor routes
  app.get(`${api}/vendors`, authenticateToken, async (req, res) => {
    const vendors = await storage.listVendors();
    res.json(vendors);
  });

  app.post(`${api}/vendors`, authenticateToken, async (req, res) => {
    try {
      console.log('🔍 Vendor creation request received');
      console.log('   Request body:', JSON.stringify(req.body, null, 2));
      console.log('   Request body keys:', Object.keys(req.body));
      console.log('   contactPerson value:', req.body.contactPerson);
      console.log('   contactPerson type:', typeof req.body.contactPerson);
      
      // Convert camelCase to snake_case and validate
      console.log('   About to validate with insertVendorSchema...');
      const snakeCaseData = toSnakeCaseObject(req.body);
      const vendorData = insertVendorSchema.parse(snakeCaseData);
      console.log('   ✅ Validation passed, vendorData:', vendorData);
      
      const vendor = await storage.createVendor(vendorData);
      console.log('   ✅ Vendor created in storage:', vendor);
      
      // Log vendor creation
      const user = (req as any).user;
      await storage.addAuditLog({
        user_id: user.id?.toString() || 'unknown',
        action: 'create',
        resource_type: 'vendor',
        resource_id: vendor.id.toString(),
        details: { name: vendor.name, email: vendor.email },
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown'
      });
      
      res.status(201).json(vendor);
    } catch (err) {
      console.error('❌ Vendor creation error:', err);
      console.error('   Error type:', typeof err);
      console.error('   Error constructor:', (err as any).constructor?.name);
      if (err instanceof ZodError) {
        console.error('   ZodError details:', err.errors);
      }
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await storage.getVendor(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  });

  app.patch(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    try {
      // Debug: log incoming body
      console.log('PATCH /api/vendors/:id called');
      console.log('  Incoming req.body:', JSON.stringify(req.body, null, 2));
      const snakeCaseData = toSnakeCaseObject(req.body);
      console.log('  snakeCaseData:', JSON.stringify(snakeCaseData, null, 2));
      // Allow partial updates with snake_case keys
      const vendorData = insertVendorSchema.partial().parse(snakeCaseData);
      const vendor = await storage.updateVendor(id, vendorData);

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (err) {
      console.error('❌ Vendor update error:', err);
      if (err instanceof ZodError) {
        console.error('   ZodError details:', err.errors);
      }
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const deleted = await storage.deleteVendor(id);
    if (!deleted) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(204).send();
  });

  // Get vendor permissions endpoint
  app.get(`${api}/vendors/:id/permissions`, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }

      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      // Return vendor permissions
      res.json({
        vendorId: vendor.id,
        permissions: vendor.permissions || []
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching vendor permissions" });
    }
  });

  // Vendor login route
  app.post(`${api}/vendor/login`, async (req, res) => {
    try {
      console.log("Vendor login request received. Body:", req.body);

      // Get email and password from request body
      const { email, password } = req.body || {};
      console.log("Extracted credentials:", { email, password });

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if vendor exists in the system
      const vendor = await storage.getVendorByEmail(email);
      console.log("Found vendor:", vendor);

      if (!vendor) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token with vendor information
      const tokenPayload = {
        id: vendor.id,
        email: vendor.email,
        role: 'vendor',
        name: vendor.name
      };
      console.log("Token payload:", tokenPayload);

      const token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store token in storage
      await storage.setUserToken(vendor.id, token);

      const response = {
        user: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          role: 'vendor'
        },
        token
      };
      console.log("Login response:", response);

      res.json(response);
    } catch (err) {
      console.error('Vendor login error:', err);
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  // Vendor routes
  app.get(`${api}/vendor/routes`, authenticateToken, requireVendorPermission('routes_view'), async (req, res) => {
    try {
      // Get vendor ID from token
      const vendorId = (req as any).user.id;
      
      // Get all routes for this vendor
      const routes = await storage.getRoutesByVendor(vendorId);
      res.json(routes);
    } catch (err) {
      res.status(500).json({ message: "Error fetching vendor routes" });
    }
  });

  app.post(`${api}/vendor/routes`, authenticateToken, requireVendorPermission('routes_create'), async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const routeData = { ...req.body, vendorId };
      
      const snakeCaseData = toSnakeCaseObject(routeData);
      const validatedData = insertRouteSchema.parse(snakeCaseData);
      const route = await storage.createRoute(validatedData);
      
      res.status(201).json(route);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.put(`${api}/vendor/routes/:id`, authenticateToken, requireVendorPermission('routes_edit'), async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const vendorId = (req as any).user.id;
      
      // Verify the route belongs to this vendor
      const existingRoute = await storage.getRoute(routeId);
      if (!existingRoute || existingRoute.vendorId !== vendorId) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const snakeCaseData = toSnakeCaseObject(req.body);
      const routeData = insertRouteSchema.partial().parse(snakeCaseData);
      const route = await storage.updateRoute(routeId, routeData);
      
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      res.json(route);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/vendor/routes/:id`, authenticateToken, requireVendorPermission('routes_delete'), async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const vendorId = (req as any).user.id;
      
      // Verify the route belongs to this vendor
      const existingRoute = await storage.getRoute(routeId);
      if (!existingRoute || existingRoute.vendorId !== vendorId) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      const deleted = await storage.deleteRoute(routeId);
      if (!deleted) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting route" });
    }
  });

  app.get(`${api}/vendor/profile`, authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const vendor = await storage.getVendor(user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  });

  // Get vendor permissions
  app.get(`${api}/vendor/permissions`, authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const vendor = await storage.getVendor(user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ permissions: vendor.permissions || [] });
  });

  app.get(`${api}/vendor/tickets`, authenticateToken, async (req, res) => {
    try {
      // Get vendor ID from token
      const vendorId = (req as any).user.id;
      
      // Get all tickets for this vendor's routes
      const tickets = await storage.getTicketsByVendor(vendorId);
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: "Error fetching vendor tickets" });
    }
  });

  // Route routes
  app.get(`${api}/routes/with-reservations`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { dateFilter } = req.query; // Add date filter parameter
      
      if (!user || !user.id) {
        console.error('No user ID found in token payload:', user);
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get all routes
      let routes = await storage.listRoutes();
      console.log('All routes:', routes);

      if (!routes) {
        console.error('Failed to fetch routes');
        return res.status(500).json({ message: "Failed to fetch routes" });
      }

      // Apply date filtering if specified
      if (dateFilter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        routes = routes.filter(route => {
          const departureDate = new Date(route.departureTime);
          const filterStr = typeof dateFilter === 'string' ? dateFilter : Array.isArray(dateFilter) && typeof dateFilter[0] === 'string' ? dateFilter[0] : '';
          switch (filterStr) {
            case 'today':
              return departureDate >= today && departureDate < tomorrow;
            case 'tomorrow':
              const dayAfterTomorrow = new Date(tomorrow);
              dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
              return departureDate >= tomorrow && departureDate < dayAfterTomorrow;
            case 'week':
              return departureDate >= today && departureDate < nextWeek;
            default:
              return true;
          }
        });
      }

      // Defensive: coerce IDs to numbers and filter out invalid ones
      routes = routes.filter(r => {
        const id = Number(r.id);
        if (isNaN(id)) {
          console.warn('with-reservations: Skipping route with invalid ID:', r);
          return false;
        }
        r.id = id; // Ensure ID is a number
        return true;
      });

      // Map all snake_case fields to camelCase for compatibility and add assigned bus plate number
      const mappedRoutes = await Promise.all(routes.map(async route => {
        try {
          // Find the assigned bus for this route - using assigned_route_id
          const busResult = await storage.pool.query(
            'SELECT plate_number FROM buses WHERE assigned_route_id = $1 AND status = \'active\' LIMIT 1',
            [route.id]
          );
          const plateNumber = busResult.rows.length > 0 ? busResult.rows[0].plate_number : null;

          return {
            ...route,
            vendorId: Number(route.vendorId), // Ensure vendorId is a number
            departureTime: toFullDateTime(route.departureTime),
            arrivalTime: toFullDateTime(route.estimatedArrival),
            daysOfWeek: route.daysOfWeek,
            plateNumber,
          };
        } catch (err) {
          console.error(`Error processing route ${route.id}:`, err);
          return null;
        }
      }));

      // Filter out any null routes from errors
      const validRoutes = mappedRoutes.filter(route => route !== null);

      // Filter routes based on user role
      let filteredRoutes;
      if (user.role === 'admin') {
        filteredRoutes = validRoutes.filter(route => route.status === 'active');
      } else if (user.role === 'vendor') {
        filteredRoutes = validRoutes.filter(route => 
          route.vendorId === Number(user.id) && 
          route.status === 'active'
        );
      } else {
        return res.status(403).json({ message: "Invalid user role" });
      }

      console.log('Filtered routes:', filteredRoutes);

      // Add seat information to each route
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const routesWithSeats = await Promise.all(filteredRoutes.map(async route => {
        try {
          const tickets = await storage.getTicketsByRoute(route.id);
          // Only consider tickets for today
          const todaysTickets = tickets.filter(t => {
            if (!t.travelDate) return false;
            const ticketDate = new Date(t.travelDate);
            ticketDate.setHours(0, 0, 0, 0);
            return ticketDate.getTime() === today.getTime();
          });
          const bookedSeats = todaysTickets.filter(t => t.status === 'confirmed').length;
          // Create seat array
          const seats = Array.from({ length: route.capacity }, (_, i) => {
            const seatNumber = i + 1;
            const ticket = todaysTickets.find(t => t.seatNumber === seatNumber);
            return {
              number: seatNumber,
              status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
              passengerName: ticket?.customerName
            };
          });
          return {
            ...route,
            seats,
            bookedSeats,
            totalSeats: route.capacity,
            availableSeats: route.capacity - bookedSeats
          };
        } catch (err) {
          console.error(`Error processing seats for route ${route.id}:`, err);
          return null;
        }
      }));

      // Filter out any null routes from errors
      const validRoutesWithSeats = routesWithSeats.filter(route => route !== null);

      console.log('Final response:', validRoutesWithSeats);
      res.json(validRoutesWithSeats);
    } catch (err) {
      console.error('Error in /routes/with-reservations:', err);
      res.status(500).json({ 
        message: "Error fetching routes",
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });

  app.get(`${api}/routes`, authenticateToken, async (req, res) => {
    try {
      console.log("Fetching all routes...");
      const routes = await storage.listRoutes();
      console.log("Routes fetched:", routes);

      // Date filter: only return routes for the requested date
      const { date } = req.query;
      let filteredRoutes = routes;
      if (date) {
        // Only include routes that match the requested date (YYYY-MM-DD)
        // You may need to join with schedule or tickets for more complex logic
        // Here, we assume each route is for a specific date
        const filterDate = new Date(date as string);
        filteredRoutes = routes.filter(route => {
          // If route has a departureTime as a date string
          const dateStr = route.departureTime;
          if (dateStr) {
            const routeDate = new Date(dateStr);
            return (
              routeDate.getFullYear() === filterDate.getFullYear() &&
              routeDate.getMonth() === filterDate.getMonth() &&
              routeDate.getDate() === filterDate.getDate()
            );
          }
          // If not, include all (fallback)
          return true;
        });
      }

      // Convert to camelCase and ensure proper date formatting
      const formattedRoutes = filteredRoutes.map(route => {
        const camel = toCamelCaseObject(route);
        return {
          ...camel,
          departureTime: camel.departuretime || '',
          departureTimeRaw: camel.departuretime || '',
          estimatedArrival: camel.estimatedArrival || null
        };
      });

      res.json(formattedRoutes);
    } catch (err) {
      console.error("Error fetching routes:", err);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post(`${api}/routes`, authenticateToken, requireVendorPermission('routes_create'), async (req, res) => {
    try {
      console.log("Creating new route. Body:", req.body);
      
      // Extract vendor ID from token
      const vendorId = (req as any).user.id;
      if (!vendorId) {
        return res.status(400).json({ message: "Vendor ID is required" });
      }

      // Add vendor ID to the request body
      const routeData = {
        ...req.body,
        vendorId
      };
      
      // Validate the data with the schema
      const validatedData = insertRouteSchema.parse(routeData);
      console.log('Validated data:', validatedData);

      // Create the route in the database
      const newRoute = await storage.createRoute(validatedData);
      
      // Format the response
      const formattedRoute = {
        ...newRoute,
        departureTime: toFullDateTime(newRoute.departureTime),
        estimatedArrival: toFullDateTime(newRoute.estimatedArrival)
      };

      res.status(201).json(formattedRoute);
    } catch (err) {
      console.error("Error creating route:", err);
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      if (isNaN(routeId)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      console.log("Fetching route:", routeId);
      const route = await storage.getRoute(routeId);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Convert to camelCase and ensure proper date formatting
      const formattedRoute = {
        ...toCamelCaseObject(route),
        departureTime: toFullDateTime(route.departureTime),
        estimatedArrival: toFullDateTime(route.estimatedArrival)
      };

      res.json(formattedRoute);
    } catch (err) {
      console.error("Error fetching route:", err);
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  app.patch(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }
    try {
      console.log("Updating route. Body:", req.body);
      const validatedData = insertRouteSchema.partial().parse(req.body);
      const snakeCaseData = toSnakeCaseObject(validatedData);
      console.log("Converted to snake_case for DB:", snakeCaseData);
      if (validatedData.vendorId) {
        const vendor = await storage.getVendor(validatedData.vendorId);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor not found" });
        }
      }
      const route = await storage.updateRoute(id, snakeCaseData);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      res.json(route);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    const deleted = await storage.deleteRoute(id);
    if (!deleted) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(204).send();
  });

  // Ticket routes
  app.get(`${api}/tickets`, authenticateToken, async (req, res) => {
    const routeId = req.query.routeId ? parseInt(req.query.routeId as string) : null;
    const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : null;
    const { dateFilter } = req.query; // Add date filter parameter

    let tickets;
    if (routeId && !isNaN(routeId)) {
      tickets = await storage.getTicketsByRoute(routeId);
    } else if (vendorId && !isNaN(vendorId)) {
      tickets = await storage.getTicketsByVendor(vendorId);
    } else {
      tickets = await storage.listTickets();
    }

    // Apply date filtering if specified
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      tickets = tickets.filter(ticket => {
        const travelDate = new Date(ticket.travelDate);
        
        // Support custom date string (YYYY-MM-DD)
        const filterStr = typeof dateFilter === 'string' ? dateFilter : Array.isArray(dateFilter) && typeof dateFilter[0] === 'string' ? dateFilter[0] : '';
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(filterStr)) {
          const filterDate = new Date(filterStr);
          // Compare only the date part (ignore time)
          return travelDate.getFullYear() === filterDate.getFullYear() &&
            travelDate.getMonth() === filterDate.getMonth() &&
            travelDate.getDate() === filterDate.getDate();
        }
        
        switch (filterStr) {
          case 'today':
            return travelDate >= today && travelDate < tomorrow;
          case 'tomorrow':
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            return travelDate >= tomorrow && travelDate < dayAfterTomorrow;
          case 'week':
            return travelDate >= today && travelDate < nextWeek;
          default:
            return true;
        }
      });
    }

    res.json(tickets);
  });

  app.post(`${api}/tickets`, authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body) as import("../shared/schema").InsertTicket;
      if (!ticketData || typeof ticketData !== 'object' || typeof ticketData.routeId !== 'number' || isNaN(ticketData.routeId)) {
        return res.status(400).json({ message: "Missing or invalid routeId in ticket data" });
      }
      const route = await storage.getRoute(ticketData.routeId);
      if (!route) {
        return res.status(400).json({ message: "Route not found" });
      }
      if (typeof ticketData.vendorId !== 'number' || isNaN(ticketData.vendorId)) {
        return res.status(400).json({ message: "Missing or invalid vendorId in ticket data" });
      }
      const vendor = await storage.getVendor(ticketData.vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Vendor not found" });
      }
      // --- Booking validation ---
      console.log('Received travelDate:', ticketData.travelDate);
      const now = new Date();
      console.log('Current server date/time:', now.toISOString());
      // Convert both dates to UTC midnight for comparison
      const travelDate = new Date(ticketData.travelDate);
      const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const travelDateUTC = new Date(Date.UTC(travelDate.getUTCFullYear(), travelDate.getUTCMonth(), travelDate.getUTCDate()));
      // 1. Prevent booking for past dates (in UTC)
      if (travelDateUTC < nowUTC) {
        return res.status(400).json({ message: "Cannot book trips in the past" });
      }
      // 2. Prevent booking for today if time has passed (in UTC)
      if (
        travelDateUTC.getTime() === nowUTC.getTime()
      ) {
        // route.departureTime may be a string like '14:00' or a full ISO string
        let depTime = route.departureTime;
        let depHour = 0, depMin = 0;
        if (typeof depTime === 'string') {
          const match = depTime.match(/(\d{2}):(\d{2})/);
          if (match) {
            depHour = parseInt(match[1], 10);
            depMin = parseInt(match[2], 10);
          } else {
            // Try parsing as ISO string
            const depDate = new Date(depTime);
            if (!isNaN(depDate.getTime())) {
              depHour = depDate.getUTCHours();
              depMin = depDate.getUTCMinutes();
            }
          }
        }
        if (
          now.getUTCHours() > depHour ||
          (now.getUTCHours() === depHour && now.getUTCMinutes() >= depMin)
        ) {
          return res.status(400).json({ message: "Cannot book trips after departure time" });
        }
      }
      // --- End booking validation ---
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/tickets/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicket(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  });

  app.patch(`${api}/tickets/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    try {
      // Allow partial updates
      const ticketData = insertTicketSchema.partial().parse(req.body);

      // If routeId is provided, validate route exists
      if (ticketData && typeof ticketData === 'object' && 'routeId' in ticketData) {
        if (typeof ticketData.routeId !== 'number' || isNaN(ticketData.routeId)) {
          console.warn('Skipping update: invalid routeId in ticketData:', ticketData);
        } else {
          const route = await storage.getRoute(ticketData.routeId);
          if (!route) {
            return res.status(400).json({ message: "Route not found" });
          }
        }
      }

      // If vendorId is provided, validate vendor exists
      if (ticketData && typeof ticketData === 'object' && 'vendorId' in ticketData) {
        if (typeof ticketData.vendorId !== 'number' || isNaN(ticketData.vendorId)) {
          console.warn('Skipping update: invalid vendorId in ticketData:', ticketData);
        } else {
          const vendor = await storage.getVendor(ticketData.vendorId);
          if (!vendor) {
            return res.status(400).json({ message: "Vendor not found" });
          }
        }
      }

      const ticket = await storage.updateTicket(id, ticketData);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  // Settings routes
  app.get(`${api}/settings`, authenticateToken, async (req, res) => {
    const settings = await storage.listSettings();
    res.json(settings);
  });

  app.post(`${api}/settings/:name`, authenticateToken, requireAdmin, async (req, res) => {
    const { name } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }

    try {
      // First check if the setting exists
      const existingSetting = await storage.getSetting(name);
      
      let setting;
      if (existingSetting) {
        // Update existing setting
        setting = await storage.updateSetting(name, value);
      } else {
        // Create new setting
        setting = await storage.createSetting({
          name,
          value,
          description: `Setting for ${name}`
        });
      }

      if (!setting) {
        return res.status(500).json({ message: "Failed to save setting" });
      }

      // Handle special settings
      if (name === "automatic_backups" || name === "backup_scheduled") {
        try {
          const { scheduleBackups } = require('./backup');
          await scheduleBackups(value === "true" || value === true);
        } catch (error) {
          console.error("Failed to update backup schedule:", error);
        }
      }

      // Handle security settings
      if (name === "security_session_timeout") {
        // Update session timeout configuration
        console.log(`Updated session timeout to ${value} minutes`);
      }

      if (name === "security_password_min_length") {
        // Update password policy
        console.log(`Updated minimum password length to ${value} characters`);
      }

      if (name === "security_two_factor_enabled") {
        // Update 2FA configuration
        console.log(`Updated 2FA setting to ${value}`);
      }

      // Handle notification settings
      if (name.startsWith("notification_")) {
        // Update notification configuration
        console.log(`Updated notification setting ${name} to ${value}`);
      }

      // Handle system settings
      if (name === "system_timezone") {
        // Update timezone configuration
        console.log(`Updated system timezone to ${value}`);
      }

      if (name === "system_language") {
        // Update language configuration
        console.log(`Updated system language to ${value}`);
      }

      res.json(setting);
    } catch (error) {
      console.error('Error saving setting:', error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  // Backup management routes
  app.post(`${api}/backups`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { type = "full" } = req.body;
      let backupPath: string | null = null;
      
      switch (type) {
        case "analytics":
          backupPath = await createAnalyticsBackup();
          break;
        case "audit":
          backupPath = await createAuditBackup();
          break;
        case "operational":
          backupPath = await createOperationalBackup();
          break;
        case "users":
          backupPath = await createUsersBackup();
          break;
        case "settings":
          backupPath = await createDatabaseBackup("settings");
          break;
        default:
          backupPath = await createDatabaseBackup("full");
      }
      
      if (backupPath) {
        await storage.createActivity({
          adminId: (req as any).user.id,
          action: `Created ${type} backup`,
          details: { path: backupPath, type }
        });
        res.status(201).json({ message: `${type} backup created successfully`, path: backupPath, type });
      } else {
        res.status(500).json({ message: "Failed to create backup" });
      }
    } catch (error) {
      res.status(500).json({ message: `Backup error: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.get(`${api}/backups/types`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backupTypes = await getBackupTypes();
      res.json(backupTypes);
    } catch (error) {
      res.status(500).json({ message: `Error getting backup types: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.get(`${api}/backups`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backups = await listBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ message: `Error listing backups: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.get(`${api}/backups/:filename/download`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const backupPath = path.join(process.cwd(), "backups", filename);
      
      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ message: "Backup file not found" });
      }
      
      res.download(backupPath, filename);
    } catch (error) {
      res.status(500).json({ message: `Error downloading backup: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.delete(`${api}/backups/:filename`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const backupPath = path.join(process.cwd(), "backups", filename);
      
      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ message: "Backup file not found" });
      }
      
      fs.unlinkSync(backupPath);
      
      await storage.createActivity({
        adminId: (req as any).user.id,
        action: "Deleted database backup",
        details: { filename }
      });
      
      res.json({ message: "Backup deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error deleting backup: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  // Dashboard stats
  app.get(`${api}/dashboard`, authenticateToken, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Activities
  app.get(`${api}/activities`, authenticateToken, async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const activities = await storage.listActivities(limit);
    res.json(activities);
  });

  app.post(`${api}/activities`, authenticateToken, async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      // Ensure adminId is set from the authenticated user
      activityData.adminId = (req as any).user?.id;
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vendor routes
  app.get(`${api}/routes/dashboard-stats`, authenticateToken, async (req, res) => {
    console.log('dashboard-stats endpoint hit');
    const user = (req as any).user;
    const vendorId = user.id;
    try {
      let routes = await storage.getRoutesByVendor(vendorId);
      let tickets = await storage.getTicketsByVendor(vendorId);

      // Log all IDs before filtering
      console.log('dashboard-stats: Raw route IDs:', routes.map(r => r.id));
      console.log('dashboard-stats: Raw ticket routeIds:', tickets.map(t => t.routeId));

      // Defensive: coerce IDs to numbers and filter out invalid ones
      routes = routes.filter(r => {
        const id = Number(r.id);
        if (isNaN(id)) {
          console.warn('dashboard-stats: Skipping route with invalid ID:', r);
          return false;
        }
        r.id = id; // Ensure ID is a number
        return true;
      });

      tickets = tickets.filter(t => {
        const routeId = Number(t.routeId);
        if (isNaN(routeId)) {
          console.warn('dashboard-stats: Skipping ticket with invalid routeId:', t);
          return false;
        }
        t.routeId = routeId; // Ensure routeId is a number
        return true;
      });

      const stats = {
        totalRoutes: routes.length,
        activeRoutes: routes.filter(r => r.status === 'active').length,
        totalBookings: tickets.length,
        totalRevenue: tickets
          .filter(ticket => ticket.status === 'confirmed')
          .reduce((sum, ticket) => sum + (ticket.amount ? Number(ticket.amount) : 0), 0),
        recentBookings: tickets.slice(-5).reverse(),
        upcomingTrips: routes.filter(r => r.status === 'active').slice(0, 5)
      };

      res.json(stats);
    } catch (err) {
      console.error('Error in dashboard-stats:', err);
      if (err instanceof Error && err.stack) {
        console.error('Stack trace:', err.stack);
      }
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  app.get(`${api}/routes/recent-bookings`, authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const vendorId = user.id;
    try {
      let tickets = await storage.getTicketsByVendor(vendorId);
      tickets = tickets.filter(t => t && !isNaN(Number(t.routeId)));
      const recentBookings = tickets.slice(-10).reverse();
      res.json(recentBookings);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/routes/upcoming-trips`, authenticateToken, async (req, res) => {
    const user = (req as any).user;
    const vendorId = user.id;
    try {
      let routes = await storage.getRoutesByVendor(vendorId);
      routes = routes.filter(r => r && !isNaN(Number(r.id)));
      const upcomingTrips = routes.filter(r => r.status === 'active').slice(0, 10);
      res.json(upcomingTrips);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/routes/active`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      console.log('User from token:', user);
      
      if (!user || !user.id) {
        console.error('No user ID found in token payload:', user);
        return res.status(401).json({ error: 'Unauthorized - No user ID' });
      }

      // Get all routes from storage
      let allRoutes = await storage.listRoutes();
      console.log(`Found ${allRoutes.length} total routes`);

      // Defensive: coerce IDs to numbers and filter out invalid ones
      allRoutes = allRoutes.filter(route => {
        const id = Number(route.id);
        const vendorId = Number(route.vendorId);
        if (isNaN(id) || isNaN(vendorId)) {
          console.warn('active-routes: Skipping route with invalid ID or vendorId:', route);
          return false;
        }
        route.id = id; // Ensure ID is a number
        route.vendorId = vendorId; // Ensure vendorId is a number
        return true;
      });

      // Filter active routes based on role
      let activeRoutes;
      if (user.role === 'admin') {
        // Admin can see all active routes
        activeRoutes = allRoutes.filter(route => route.status === 'active');
      } else {
        // Vendors can only see their routes
        activeRoutes = allRoutes.filter(route => 
          route.vendorId === Number(user.id) && 
          route.status === 'active'
        );
      }

      console.log(`Found ${activeRoutes.length} active routes for user ${user.id} (${user.role})`);

      // Add seat availability info
      const routesWithSeats = await Promise.all(activeRoutes.map(async route => {
        const tickets = await storage.getTicketsByRoute(route.id);
        const bookedSeats = tickets.filter(t => t.status === 'confirmed').length;
        return {
          ...route,
          bookedSeats,
          availableSeats: route.capacity - bookedSeats
        };
      }));

      return res.json(routesWithSeats);
    } catch (error) {
      console.error('Error fetching active routes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get(`${api}/routes/:routeId/seats`, authenticateToken, async (req, res) => {
    try {
      const routeId = Number(req.params.routeId);
      const vendorId = (req as any).user.id;

      // Get route to verify ownership
      const route = await storage.getRoute(routeId);
      if (!route || route.vendorId !== vendorId) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Get all tickets for this route
      const tickets = await storage.listTickets();
      const routeTickets = tickets.filter(t => t.routeId === routeId);

      // Create seat array with status
      const seats = Array.from({ length: route.capacity }, (_, i) => {
        const seatNumber = i + 1;
        const ticket = routeTickets.find(t => t.seatNumber === seatNumber);
        return {
          number: seatNumber,
          status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available'
        };
      });

      res.json(seats);
    } catch (err) {
      console.error('Error getting seat reservations:', err);
      res.status(500).json({ message: "Failed to get seat reservations" });
    }
  });

  app.post(`${api}/tickets/walk-in`, authenticateToken, async (req, res) => {
    console.log('walk-in ticket endpoint hit');
    console.log('walk-in ticket request body:', req.body);
    try {
      const vendorId = (req as any).user.id;
      // Support both frontend and backend field names
      const routeId = req.body.routeId;
      const customerName = req.body.customerName || req.body.passengerName;
      const customerPhone = req.body.customerPhone || req.body.phone;
      const customerEmail = req.body.customerEmail || req.body.email;
      const seatNumber = req.body.seatNumber;
      const amount = req.body.amount;
      const travelDate = req.body.travelDate;
      const status = req.body.status;
      const bookingReference = req.body.bookingReference;

      // Validate required fields (except travelDate for fallback)
      if (!routeId || !customerName || seatNumber === undefined || seatNumber === null || amount === undefined || amount === null) {
        console.error('walk-in: Missing required fields:', { routeId, customerName, seatNumber, amount, travelDate });
        return res.status(400).json({ message: "Missing required fields. Please ensure you provide route, passenger name, seat number, and amount." });
      }

      // Get route to verify ownership and get fare
      const route = await storage.getRoute(routeId);
      if (!route || route.vendorId !== vendorId) {
        console.error('walk-in: Route not found or vendor mismatch:', { routeId, vendorId });
        return res.status(404).json({ message: "Route not found" });
      }

      // Handle travelDate
      let finalTravelDate: Date;
      if (travelDate) {
        // If travelDate is provided, try to parse it
        try {
          // If it's a datetime-local format (YYYY-MM-DDTHH:mm)
          if (travelDate.length === 16) {
            finalTravelDate = new Date(travelDate + ':00.000Z');
          }
          // If it's a time-only string (HH:mm)
          else if (/^\d{2}:\d{2}$/.test(travelDate)) {
            const [hours, minutes] = travelDate.split(':');
            const baseDate = new Date();
            baseDate.setHours(Number(hours), Number(minutes), 0, 0);
            finalTravelDate = baseDate;
          }
          // If it's already an ISO string or other valid date format
          else {
            finalTravelDate = new Date(travelDate);
          }
          if (isNaN(finalTravelDate.getTime())) {
            throw new Error('Invalid travel date format');
          }
        } catch (err) {
          console.error('walk-in: Error parsing travelDate:', err);
          return res.status(400).json({ message: "Invalid travel date format" });
        }
      } else {
        // Fallback to route's departure time
        try {
          console.log('Using route departure time:', route.departureTime);
          
          // Get today's date
          const today = new Date();
          const [year, month, day] = [today.getFullYear(), today.getMonth(), today.getDate()];
          
          // Parse the departure time
          let hours: number, minutes: number;
          
          // If it's a time-only string (HH:mm)
          if (/^\d{2}:\d{2}$/.test(route.departureTime)) {
            [hours, minutes] = route.departureTime.split(':').map(Number);
          }
          // If it's a datetime-local format (YYYY-MM-DDTHH:mm)
          else if (route.departureTime.length === 16) {
            const [datePart, timePart] = route.departureTime.split('T');
            [hours, minutes] = timePart.split(':').map(Number);
          }
          // If it's an ISO string
          else if (route.departureTime.includes('T')) {
            const date = new Date(route.departureTime);
            hours = date.getHours();
            minutes = date.getMinutes();
          }
          // If none of the above, try to parse as a date
          else {
            const date = new Date(route.departureTime);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid departure time format');
            }
            hours = date.getHours();
            minutes = date.getMinutes();
          }
          
          // Create the final date using today's date and the parsed time
          finalTravelDate = new Date(year, month, day, hours, minutes, 0, 0);
          
          // If the time has already passed today, set it for tomorrow
          if (finalTravelDate < today) {
            finalTravelDate.setDate(finalTravelDate.getDate() + 1);
          }
          
          console.log('Created final travel date:', finalTravelDate);
        } catch (err) {
          console.error('walk-in: Error parsing route.departureTime:', err);
          return res.status(400).json({ message: "Invalid route departure time format" });
        }
      }

      // Check if seat is available
      const tickets = await storage.getTicketsByRoute(routeId);
      const seatTaken = tickets.some(t => 
        t.seatNumber === seatNumber && t.status !== 'cancelled'
      );

      if (seatTaken) {
        console.error('walk-in: Seat is already booked:', { routeId, seatNumber });
        return res.status(400).json({ message: "Seat is already booked" });
      }

      // Create ticket
      const ticket = await storage.createTicket({
        routeId,
        vendorId,
        customerName,
        customerPhone: customerPhone || 'N/A',
        customerEmail: customerEmail || 'N/A',
        seatNumber,
        status: status || 'pending',
        amount,
        travelDate: finalTravelDate,
        bookingReference: bookingReference || `WI-${Date.now()}`,
        createdAt: new Date()
      });

      // Convert to camelCase for response
      const formattedTicket = toCamelCaseObject(ticket);
      console.log('walk-in: Ticket created:', formattedTicket);
      res.status(201).json(formattedTicket);
    } catch (err) {
      console.error('walk-in: Error creating walk-in ticket:', err);
      if (err instanceof Error && err.stack) {
        console.error('walk-in: Stack trace:', err.stack);
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Excel report download endpoint
  app.get(`${api}/vendor/reports/excel/:type`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const { type } = req.params;
      const { startDate, endDate } = req.query;
      
      // Get all routes for this vendor
      const routes = await storage.listRoutes();
      const vendorRoutes = routes.filter(route => route.vendorId === vendorId);
      
      // Get all tickets for this vendor's routes
      const allTickets = await Promise.all(
        vendorRoutes.map(route => storage.getTicketsByRoute(route.id))
      );
      const tickets = allTickets.flat();

      let data = [];
      let filename = '';

      switch (type) {
        case 'routes':
          data = vendorRoutes.map(route => ({
            'Route ID': route.id,
            'Departure': route.departure,
            'Destination': route.destination,
            'Departure Time': route.departureTime,
            'Fare': route.fare,
            'Capacity': route.capacity,
            'Status': route.status,
            'Operating Days': route.daysOfWeek.join(', '),
            'Stops': route.stops.join(', ')
          }));
          filename = 'routes-report.xlsx';
          break;

        case 'bookings':
          data = tickets.map(ticket => ({
            'Booking Reference': ticket.bookingReference,
            'Customer Name': ticket.customerName,
            'Phone': ticket.customerPhone,
            'Email': ticket.customerEmail,
            'Seat Number': ticket.seatNumber,
            'Amount': ticket.amount,
            'Status': ticket.status,
            'Travel Date': new Date(ticket.travelDate).toLocaleDateString(),
            'Booking Date': new Date(ticket.createdAt).toLocaleDateString()
          }));
          filename = 'bookings-report.xlsx';
          break;

        case 'revenue':
          // Group tickets by date
          const revenueByDate = tickets.reduce((acc: { [date: string]: { total: number; count: number } }, ticket) => {
            const date = new Date(ticket.createdAt).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = { total: 0, count: 0 };
            }
            if (ticket.status === 'confirmed') {
              acc[date].total += Number(ticket.amount);
              acc[date].count++;
            }
            return acc;
          }, {} as { [date: string]: { total: number; count: number } });

          data = Object.entries(revenueByDate).map(([date, stats]: [string, any]) => ({
            'Date': date,
            'Total Revenue': stats.total,
            'Number of Bookings': stats.count,
            'Average Revenue': stats.count > 0 ? (stats.total / stats.count).toFixed(2) : 0
          }));
          filename = 'revenue-report.xlsx';
          break;

        default:
          return res.status(400).json({ message: 'Invalid report type' });
      }

      // Convert data to Excel buffer
      const workbook = {
        SheetNames: ['Report'],
        Sheets: {
          'Report': XLSX.utils.json_to_sheet(data)
        }
      };
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      res.send(excelBuffer);
    } catch (err) {
      console.error('Error generating Excel report:', err);
      res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  // Bus routes
  app.get(`${api}/vendor/buses`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const buses = await storage.getBusesByVendorId(vendorId);
      res.json(buses);
    } catch (err) {
      console.error("Error fetching buses:", err);
      res.status(500).json({ message: "Error fetching buses" });
    }
  });

  app.post(`${api}/vendor/buses`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const { plateNumber, name, capacity } = req.body;

      if (!plateNumber || !name || !capacity) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const bus = await storage.createBus({
        vendorId,
        plateNumber,
        name,
        capacity: parseInt(capacity),
        status: 'active'
      });

      res.status(201).json(bus);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.post(`${api}/vendor/buses/:busId/assign-route`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const busId = parseInt(req.params.busId);
      const { routeId } = req.body;

      if (isNaN(busId) || !routeId) {
        return res.status(400).json({ message: "Invalid bus ID or route ID" });
      }

      const bus = await storage.assignBusRoute(busId, parseInt(routeId), vendorId);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json(bus);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.post(`${api}/vendor/buses/:busId/location`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const busId = parseInt(req.params.busId);
      const { lat, lng } = req.body;

      if (isNaN(busId) || !lat || !lng) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const bus = await storage.updateBusLocation(busId, vendorId, { lat, lng });
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json(bus);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/vendor/buses/:busId`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const busId = parseInt(req.params.busId);

      if (isNaN(busId)) {
        return res.status(400).json({ message: "Invalid bus ID" });
      }

      await storage.deleteBus(busId, vendorId);
      res.json({ message: "Bus deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.post(`${api}/routes/:routeId/seats`, authenticateToken, async (req, res) => {
    try {
      const routeId = Number(req.params.routeId);
      if (!routeId || isNaN(routeId)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      const vendorId = (req as any).user.id;
      const { seatNumber, passengerName } = req.body;

      // Validate required fields
      if (!routeId || !seatNumber || !passengerName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get route to verify ownership and get fare
      const route = await storage.getRoute(routeId);
      if (!route || route.vendorId !== vendorId) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Check if seat is available
      const tickets = await storage.getTicketsByRoute(routeId);
      const seatTaken = tickets.some(t =>
        t.seatNumber === seatNumber && t.status !== 'cancelled'
      );
      if (seatTaken) {
        return res.status(400).json({ message: "Seat is already booked" });
      }

      // Create ticket (adjust fields as per your schema)
      const ticket = await storage.createTicket({
        routeId,
        vendorId,
        customerName: passengerName,
        customerPhone: '',
        customerEmail: '',
        seatNumber: seatNumber,
        status: 'confirmed',
        amount: route.fare.toString(),
        travelDate: new Date(),
        bookingReference: `WALKIN-${Date.now()}`,
        paymentMethod: 'cash',
        paymentReference: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json(ticket);
    } catch (err) {
      console.error('Error reserving seat:', err);
      res.status(500).json({ message: "Failed to reserve seat" });
    }
  });

  app.post(`${api}/routes/:routeId/quick-book`, authenticateToken, async (req, res) => {
    console.log("Quick book endpoint hit", req.method, req.originalUrl, req.body);
    try {
      const routeId = Number(req.params.routeId);
      if (!routeId || isNaN(routeId)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      const vendorId = (req as any).user.id;
      const { customerName, customerPhone, customerEmail, amount, travelDate } = req.body;

      // Validate required fields
      if (!routeId || !customerName || amount === undefined || amount === null || !travelDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get route to verify ownership and get capacity
      const route = await storage.getRoute(routeId);
      if (!route || route.vendorId !== vendorId) {
        return res.status(404).json({ message: "Route not found" });
      }

      // Get all tickets for this route
      const tickets = await storage.getTicketsByRoute(routeId);

      // Find the lowest available seat number
      const takenSeats = tickets.filter(t => t.status !== 'cancelled').map(t => t.seatNumber);
      let nextSeat = null;
      for (let i = 1; i <= route.capacity; i++) {
        if (!takenSeats.includes(i)) {
          nextSeat = i;
          break;
        }
      }

      if (!nextSeat) {
        return res.status(400).json({ message: "No available seats" });
      }

      // Create ticket
      const ticket = await storage.createTicket({
        routeId,
        vendorId,
        customerName,
        customerPhone: customerPhone || 'N/A',
        customerEmail: customerEmail || 'N/A',
        seatNumber: nextSeat,
        status: 'confirmed',
        amount,
        travelDate,
        bookingReference: `QB-${Date.now()}`,
        createdAt: new Date()
      });

      res.status(201).json(ticket);
    } catch (err) {
      console.error('Error in quick book:', err);
      res.status(500).json({ message: "Failed to quick book seat" });
    }
  });

  app.post(`${api}/tickets/bulk-update-status`, authenticateToken, async (req, res) => {
    try {
      const vendorId = (req as any).user.id;
      const { status } = req.body;

      if (!status || !['confirmed', 'pending', 'cancelled', 'refunded'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Update all tickets for this vendor
      const result = await storage.pool.query(
        `UPDATE tickets 
         SET status = $1, updated_at = NOW() 
         WHERE vendorid = $2 AND status != 'cancelled' AND status != 'refunded' 
         RETURNING *`,
        [status, vendorId]
      );

      // Invalidate queries to refresh the UI
      res.json({
        message: `Updated ${result.rowCount} tickets to ${status}`,
        updatedTickets: toCamelCaseObject(result.rows)
      });
    } catch (err) {
      console.error('Error updating ticket statuses:', err);
      res.status(500).json({ message: "Failed to update ticket statuses" });
    }
  });

  // Analytics endpoints
  app.get(`${api}/analytics/dashboard/revenue`, authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, period } = req.query;
      let whereClause = "status = 'confirmed'";
      let params: any[] = [];
      if (startDate && endDate) {
        whereClause += ` AND created_at >= $1 AND created_at <= $2`;
        params = [startDate, endDate];
      } else {
        const days = parseInt(period as string) || 30;
        whereClause += ` AND created_at >= NOW() - INTERVAL '${days} days'`;
      }
      const result = await storage.pool.query(
        `SELECT DATE(created_at) as date, SUM(CAST(amount AS DECIMAL)) as revenue FROM tickets WHERE ${whereClause} GROUP BY DATE(created_at) ORDER BY date`,
        params
      );
      console.log('Revenue data:', result.rows);
      res.json(result.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue || 0)
      })));
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  app.get(`${api}/analytics/dashboard/vendors`, authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, period } = req.query;
      let whereClause = "t.status = 'confirmed'";
      let params: any[] = [];
      if (startDate && endDate) {
        whereClause += ` AND t.created_at >= $1 AND t.created_at <= $2`;
        params = [startDate, endDate];
      } else {
        const days = parseInt(period as string) || 30;
        whereClause += ` AND t.created_at >= NOW() - INTERVAL '${days} days'`;
      }
      const result = await storage.pool.query(
        `SELECT v.name as vendor_name, SUM(CAST(t.amount AS DECIMAL)) as revenue FROM tickets t JOIN vendors v ON t.vendorid = v.id WHERE ${whereClause} GROUP BY v.id, v.name ORDER BY revenue DESC`,
        params
      );
      console.log('Vendor revenue data:', result.rows);
      res.json(result.rows.map(row => ({
        name: row.vendor_name,
        value: parseFloat(row.revenue || 0)
      })));
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      res.status(500).json({ message: "Failed to fetch vendor data" });
    }
  });

  app.get(`${api}/analytics/dashboard/bookings`, authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, period } = req.query;
      let whereClause = "status = 'confirmed'";
      let params: any[] = [];
      if (startDate && endDate) {
        whereClause += ` AND created_at >= $1 AND created_at <= $2`;
        params = [startDate, endDate];
      } else {
        const days = parseInt(period as string) || 30;
        whereClause += ` AND created_at >= NOW() - INTERVAL '${days} days'`;
      }
      const result = await storage.pool.query(
        `SELECT DATE(created_at) as date, COUNT(*) as bookings FROM tickets WHERE ${whereClause} GROUP BY DATE(created_at) ORDER BY date`,
        params
      );
      console.log('Bookings data:', result.rows);
      res.json(result.rows.map(row => ({
        date: row.date,
        bookings: parseInt(row.bookings || 0)
      })));
    } catch (err) {
      console.error('Error fetching bookings data:', err);
      res.status(500).json({ message: "Failed to fetch bookings data" });
    }
  });

  app.get(`${api}/analytics/dashboard/routes`, authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, period } = req.query;
      let whereClause = "t.status = 'confirmed'";
      let params: any[] = [];
      if (startDate && endDate) {
        whereClause += ` AND t.created_at >= $1 AND t.created_at <= $2`;
        params = [startDate, endDate];
      } else {
        const days = parseInt(period as string) || 30;
        whereClause += ` AND t.created_at >= NOW() - INTERVAL '${days} days'`;
      }
      const result = await storage.pool.query(
        `SELECT CONCAT(r.departure, ' → ', r.destination) as route_name, COUNT(t.id) as bookings FROM tickets t JOIN routes r ON t.route_id = r.id JOIN vendors v ON t.vendorid = v.id WHERE ${whereClause} GROUP BY r.id, r.departure, r.destination ORDER BY bookings DESC`,
        params
      );
      console.log('Route bookings data:', result.rows);
      res.json(result.rows.map(row => ({
        name: row.route_name,
        value: parseInt(row.bookings || 0)
      })));
    } catch (err) {
      console.error('Error fetching route data:', err);
      res.status(500).json({ message: "Failed to fetch route data" });
    }
  });

  app.get(`${api}/analytics/export`, authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, period } = req.query;
      let whereClause = "1=1";
      let params: any[] = [];
      if (startDate && endDate) {
        whereClause += ` AND t.created_at >= $1 AND t.created_at <= $2`;
        params = [startDate, endDate];
      } else {
        const days = parseInt(period as string) || 30;
        whereClause += ` AND t.created_at >= NOW() - INTERVAL '${days} days'`;
      }
      const result = await storage.pool.query(
        `SELECT t.id, t.booking_reference, t.customer_name, t.customer_phone, t.amount, t.status, t.created_at, CONCAT(r.departure, ' → ', r.destination) as route, v.name as vendor_name FROM tickets t JOIN routes r ON t.route_id = r.id JOIN vendors v ON t.vendorid = v.id WHERE ${whereClause} ORDER BY t.created_at DESC`,
        params
      );
      // Convert to CSV format
      const csvHeader = 'ID,Booking Reference,Customer Name,Customer Phone,Amount,Status,Created At,Route,Vendor\n';
      const csvRows = result.rows.map(row => 
        `${row.id},"${row.booking_reference || ''}","${row.customer_name || ''}","${row.customer_phone || ''}",${row.amount},"${row.status}","${row.created_at}","${row.route}","${row.vendor_name}"`
      ).join('\n');
      const csvContent = csvHeader + csvRows;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } catch (err) {
      console.error('Error exporting analytics data:', err);
      res.status(500).json({ message: "Failed to export analytics data" });
    }
  });

  // Role management routes
  app.get(`${api}/roles`, authenticateToken, async (req, res) => {
    try {
      const roles = await storage.listRoles();
      res.json(roles);
    } catch (err) {
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.post(`${api}/roles`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const user = (req as any).user;
      const roleData = {
        ...req.body,
        createdBy: user.id,
      };
      
      const snakeCaseData = toSnakeCaseObject(roleData);
      const validatedData = insertRoleSchema.parse(snakeCaseData);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/roles/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const role = await storage.getRole(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  });

  app.put(`${api}/roles/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    try {
      const snakeCaseData = toSnakeCaseObject(req.body);
      const roleData = insertRoleSchema.partial().parse(snakeCaseData);
      const role = await storage.updateRole(id, roleData);

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json(role);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/roles/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const deleted = await storage.deleteRole(id);
    if (!deleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(204).send();
  });

  // User Permission Overrides
  app.get(`${api}/admin-permission-overrides/:adminId`, authenticateToken, async (req, res) => {
    try {
      const { adminId } = req.params;
      const overrides = await storage.getUserPermissionOverrides(adminId);
      res.json(overrides);
    } catch (error) {
      console.error('Error fetching admin permission overrides:', error);
      res.status(500).json({ error: 'Failed to fetch admin permission overrides' });
    }
  });

  app.post(`${api}/admin-permission-overrides`, authenticateToken, async (req, res) => {
    try {
      const { admin_id, permission, granted } = req.body;
      const created_by = (req as any).user?.id?.toString() || 'system';
      const override = await storage.addUserPermissionOverride({
        user_id: admin_id, // still using user_id in the function signature, but it's admin_id in the table
        permission,
        granted,
        created_by
      });
      res.json(override);
    } catch (error) {
      console.error('Error creating admin permission override:', error);
      res.status(500).json({ error: 'Failed to create admin permission override' });
    }
  });

  app.delete(`${api}/admin-permission-overrides/:adminId/:permission`, authenticateToken, async (req, res) => {
    try {
      const { adminId, permission } = req.params;
      await storage.removeUserPermissionOverride(adminId, permission);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing admin permission override:', error);
      res.status(500).json({ error: 'Failed to remove admin permission override' });
    }
  });

  app.patch(`${api}/admin-permission-overrides/:adminId/:permission`, authenticateToken, async (req, res) => {
    try {
      const { adminId, permission } = req.params;
      const { granted } = req.body;
      if (typeof granted !== 'boolean') {
        return res.status(400).json({ error: 'Missing or invalid granted value' });
      }
      const updated = await storage.updateUserPermissionOverride(adminId, permission, granted);
      if (!updated) {
        return res.status(404).json({ error: 'Permission override not found' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error updating admin permission override:', error);
      res.status(500).json({ error: 'Failed to update admin permission override' });
    }
  });

  // Audit Logging
  app.get(`${api}/audit-logs`, authenticateToken, async (req, res) => {
    try {
      const { userId, action, resourceType, startDate, endDate, limit, offset } = req.query;
      const filters = {
        adminId: userId as string,
        action: action as string,
        resourceType: resourceType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  app.get(`${api}/audit-logs/count`, authenticateToken, async (req, res) => {
    try {
      const { userId, action, resourceType, startDate, endDate } = req.query;
      const filters = {
        adminId: userId as string,
        action: action as string,
        resourceType: resourceType as string,
        startDate: startDate as string,
        endDate: endDate as string
      };
      
      const count = await storage.getAuditLogsCount(filters);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching audit logs count:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs count' });
    }
  });

  // Vendor users endpoint
  app.get(`${api}/vendor-users`, authenticateToken, requireAdmin, async (req, res) => {
    const vendorId = parseInt(req.query.vendorId as string);
    if (!vendorId) {
      return res.status(400).json({ message: 'vendorId is required' });
    }
    try {
      const users = await storage.getUsersByVendorId(vendorId);
      // Don't send passwords or tokens to client
      const safeUsers = users.map(({ password, token, ...user }) => user);
      res.json(safeUsers);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching vendor users' });
    }
  });

  // User self-service profile endpoints
  app.get(`${api}/user/me`, authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { password, token, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  });
  app.patch(`${api}/user/me`, authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      let userData = insertAdminSchema.partial().parse(req.body);
      // Remove any 'name' property from userData, as InsertUser does not allow it
      if ('name' in userData) {
        delete userData.name;
      }
      const user = await storage.updateUser(userId, userData);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { password, token, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(400).json({ message: 'Error updating user profile' });
    }
  });

  // Review endpoints
  app.post(`${api}/reviews`, authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { routeId, vendorId, ticketId, rating, review } = req.body;
      if (!routeId || !vendorId || !ticketId || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const newReview = await storage.createReview({
        adminId: userId,
        routeId,
        vendorId,
        ticketId,
        rating,
        review: review || ''
      });
      res.status(201).json(newReview);
    } catch (err) {
      res.status(400).json({ message: 'Error creating review' });
    }
  });

  app.get(`${api}/reviews/route/:routeId`, async (req, res) => {
    try {
      const routeId = parseInt(req.params.routeId);
      if (isNaN(routeId)) return res.status(400).json({ message: 'Invalid route ID' });
      const reviews = await storage.getReviewsByRoute(routeId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  app.get(`${api}/reviews/vendor/:vendorId`, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) return res.status(400).json({ message: 'Invalid vendor ID' });
      const reviews = await storage.getReviewsByVendor(vendorId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  app.get(`${api}/reviews/ticket/:ticketId`, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ticket ID' });
      const reviews = await storage.getReviewsByTicket(ticketId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  app.get(`${api}/reviews/user/:userId`, authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  // ===================== Notifications Endpoints =====================

  // Get all notifications for the authenticated user
  app.get(`${api}/notifications`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      
      // Create notifications table if it doesn't exist
      await storage.pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(20) NOT NULL,
          recipient_type VARCHAR(20) NOT NULL DEFAULT 'customer',
          type VARCHAR(20) NOT NULL DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);
      
      const result = await storage.pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all notifications (notification history) for admin dashboard
  app.get(`${api}/notifications/history`, authenticateToken, async (req, res) => {
    try {
      const { recipient_type, status, type, search, page = '1', limit = '50' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Debug logging
      console.log('Notification history request:', {
        recipient_type,
        status,
        type,
        search,
        page: pageNum,
        limit: limitNum
      });
      
      // Create separate notification tables
      await storage.pool.query(`
        CREATE TABLE IF NOT EXISTS customer_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);
      
      await storage.pool.query(`
        CREATE TABLE IF NOT EXISTS vendor_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);
      
      // Build the query based on recipient type
      let query, countQuery;
      const params: any[] = [];
      let paramIndex = 1;
      
      if (recipient_type === 'vendor') {
        query = `
          SELECT 
            n.id,
            n.user_id,
            'vendor' as recipient_type,
            n.type,
            n.title,
            n.message,
            n.status,
            n.created_at,
            n.read_at,
            v.name as vendor_name,
            v.phone as vendor_phone,
            v.email as vendor_email,
            NULL as customer_name,
            NULL as customer_mobile,
            NULL as customer_email
          FROM vendor_notifications n
          LEFT JOIN vendors v ON n.user_id = v.id
          WHERE 1=1
        `;
        
        countQuery = `
          SELECT COUNT(*) as total
          FROM vendor_notifications n
          WHERE 1=1
        `;
      } else {
        query = `
          SELECT 
            n.id,
            n.user_id,
            'customer' as recipient_type,
            n.type,
            n.title,
            n.message,
            n.status,
            n.created_at,
            n.read_at,
            c.name as customer_name,
            c.mobile as customer_mobile,
            c.email as customer_email,
            NULL as vendor_name,
            NULL as vendor_mobile,
            NULL as vendor_email
          FROM customer_notifications n
          LEFT JOIN customers c ON n.user_id = c.id
          WHERE 1=1
        `;
        
        countQuery = `
          SELECT COUNT(*) as total
          FROM customer_notifications n
          WHERE 1=1
        `;
      }
      
      // Add filters
      if (status && status !== 'all') {
        query += ` AND n.status = $${paramIndex}`;
        countQuery += ` AND n.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      if (type && type !== 'all') {
        query += ` AND n.type = $${paramIndex}`;
        countQuery += ` AND n.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }
      
      if (search) {
        query += ` AND (n.title ILIKE $${paramIndex} OR n.message ILIKE $${paramIndex})`;
        countQuery += ` AND (n.title ILIKE $${paramIndex} OR n.message ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limitNum, offset);
      
      // Debug logging for queries
      console.log('Generated queries:', {
        countQuery,
        query,
        params: params.slice(0, -2),
        allParams: params,
        paramIndex,
        limitNum,
        offset
      });
      
      // Get total count
      console.log('Executing count query:', countQuery);
      console.log('Count params:', params.slice(0, -2));
      const countResult = await storage.pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);
      console.log('Total count result:', total);
      
      // Get notifications
      console.log('Executing main query:', query);
      console.log('Main query params:', params);
      const result = await storage.pool.query(query, params);
      console.log('Query result rows:', result.rows.length);
      
      res.json({
        notifications: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get notification history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new notification
  app.post(`${api}/notifications`, authenticateToken, async (req, res) => {
    try {
      const { type, title, message, user_id, broadcast, recipient_type = 'customer' } = req.body;
      
      // Debug logging
      console.log('Creating notification:', {
        type,
        title,
        message,
        user_id,
        broadcast,
        recipient_type
      });
      
      // Create separate notification tables
      await storage.pool.query(`
        CREATE TABLE IF NOT EXISTS customer_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);
      
      await storage.pool.query(`
        CREATE TABLE IF NOT EXISTS vendor_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL
        )
      `);
      
      if (broadcast) {
        // Send to all recipients based on type
        let query, tableName;
        if (recipient_type === 'vendor') {
          query = 'SELECT id FROM vendors';
          tableName = 'vendor_notifications';
        } else {
          query = 'SELECT id FROM customers';
          tableName = 'customer_notifications';
        }
        
        console.log(`Broadcasting to ${recipient_type}s using table: ${tableName}`);
        const recipientsResult = await storage.pool.query(query);
        const recipientIds = recipientsResult.rows.map(row => row.id);
        console.log(`Found ${recipientIds.length} ${recipient_type}s to notify`);
        
        if (recipientIds.length === 0) {
          return res.status(400).json({ error: `No ${recipient_type}s found to notify.` });
        }
        
        const values = recipientIds.map(id => `(${id}, '${type}', '${title.replace(/'/g, "''")}', '${message.replace(/'/g, "''")}', 'unread')`).join(',');
        const insertQuery = `INSERT INTO ${tableName} (user_id, type, title, message, status) VALUES ${values} RETURNING *`;
        console.log('Insert query:', insertQuery);
        
        const result = await storage.pool.query(insertQuery);
        console.log(`Created ${result.rows.length} notifications`);
        return res.status(201).json({ broadcast: true, count: result.rows.length, recipient_type });
      } else if (user_id) {
        // Send to a specific user
        const tableName = recipient_type === 'vendor' ? 'vendor_notifications' : 'customer_notifications';
        console.log(`Creating notification for specific ${recipient_type} in table: ${tableName}`);
        
        const result = await storage.pool.query(
          `INSERT INTO ${tableName} (user_id, type, title, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [user_id, type, title, message, 'unread']
        );
        console.log('Created notification:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      } else {
        return res.status(400).json({ error: 'user_id or broadcast required' });
      }
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Mark a notification as read
  app.patch(`${api}/notifications/:id/read`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const notificationId = parseInt(req.params.id);
      const result = await storage.pool.query(
        'UPDATE notifications SET status = $1, read_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
        ['read', notificationId, userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a notification
  app.delete(`${api}/notifications/:id`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const notificationId = parseInt(req.params.id);
      const result = await storage.pool.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
        [notificationId, userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Mark all notifications as read
  app.patch(`${api}/notifications/mark-all-read`, authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.id;
      const result = await storage.pool.query(
        'UPDATE notifications SET status = $1, read_at = NOW() WHERE user_id = $2 AND status = $3 RETURNING *',
        ['read', userId, 'unread']
      );
      res.json({ success: true, updatedCount: result.rows.length });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Serve avatars as static files
  app.use('/avatars', express.static(path.join(__dirname, '../../../public/avatars')));

  // Avatar upload endpoint
  app.post('/api/user/avatar', authenticateToken, avatarUpload.single('avatar'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const userId = req.user.id;
      const ext = path.extname(req.file.originalname);
      const newFilename = `user_${userId}${ext}`;
      const newPath = path.join(req.file.destination, newFilename);
      // Move/rename the file
      fs.renameSync(req.file.path, newPath);
      // Construct the public URL
      const avatarUrl = `/avatars/${newFilename}`;
      // Update the user's avatarUrl in the database (camelCase for storage layer)
      await storage.updateUser(userId, {});
      res.json({ avatarUrl });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });

  // Customers endpoint for admin
  app.get(`${api}/customers`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      // Query all customers and their booking counts
      const result = await storage.pool.query(`
        SELECT 
          c.id,
          c.name,
          c.mobile,
          c.email,
          c.created_at,
          c.last_login,
          COUNT(t.id) as booking_count
        FROM customers c
        LEFT JOIN tickets t ON c.mobile = t.customer_phone
        GROUP BY c.id, c.name, c.mobile, c.email, c.created_at, c.last_login
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Admin get customers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin-permission-overrides/:adminId', authenticateToken, requireAdmin, async (req, res) => {
    const adminId = req.params.adminId;
    try {
      const result = await storage.pool.query(
        'SELECT * FROM admin_permission_overrides WHERE admin_id = $1',
        [adminId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load permission overrides' });
    }
  });

  app.patch(`${api}/admin-permission-overrides/:adminId/:permission`, authenticateToken, async (req, res) => {
    try {
      const { adminId, permission } = req.params;
      const { granted } = req.body;
      if (typeof granted !== 'boolean') {
        return res.status(400).json({ error: 'Missing or invalid granted value' });
      }
      const updated = await storage.updateUserPermissionOverride(adminId, permission, granted);
      if (!updated) {
        return res.status(404).json({ error: 'Permission override not found' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error updating admin permission override:', error);
      res.status(500).json({ error: 'Failed to update admin permission override' });
    }
  });

  // Vendor User Permission Overrides
  app.get('/api/vendor-user-permissions/:vendorUserId', authenticateToken, async (req, res) => {
    try {
      const { vendorUserId } = req.params;
      const result = await storage.pool.query('SELECT * FROM vendor_user_permissions WHERE vendor_user_id = $1', [vendorUserId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching vendor user permissions:', error);
      res.status(500).json({ error: 'Failed to fetch vendor user permissions' });
    }
  });

  app.post('/api/vendor-user-permissions', authenticateToken, async (req, res) => {
    try {
      const { vendor_user_id, permission, granted } = req.body;
      const result = await storage.pool.query(
        `INSERT INTO vendor_user_permissions (vendor_user_id, permission, granted)
         VALUES ($1, $2, $3)
         ON CONFLICT (vendor_user_id, permission)
         DO UPDATE SET granted = $3
         RETURNING *`,
        [vendor_user_id, permission, granted]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error upserting vendor user permission:', error);
      res.status(500).json({ error: 'Failed to upsert vendor user permission' });
    }
  });

  app.delete('/api/vendor-user-permissions/:vendorUserId/:permission', authenticateToken, async (req, res) => {
    try {
      const { vendorUserId, permission } = req.params;
      await storage.pool.query('DELETE FROM vendor_user_permissions WHERE vendor_user_id = $1 AND permission = $2', [vendorUserId, permission]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting vendor user permission:', error);
      res.status(500).json({ error: 'Failed to delete vendor user permission' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}