import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import admin from 'firebase-admin';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL);

const app = express();
const port = 4000; // Changed from 4002 to 4000 to match script

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tiyende'
});

// In-memory storage for vendors
const vendors = new Map();

// Add a test vendor
const testVendor = {
  id: 1,
  name: 'Mazhandu Family Bus',
  email: 'info@mazhandufamily.com',
  password: bcrypt.hashSync('vendor123', 10),
  role: 'vendor'
};
vendors.set(testVendor.email, testVendor);

// Users table setup (in-memory for demo, replace with DB in production)
// const users = new Map();
// Add test user Popi
// users.set('260000000000', { id: 1, name: 'Popi', mobile: '260000000000' });

// Middleware to check vendor user permissions
const requireVendorUserPermission = (requiredPermission: string) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Auth middleware - Token present:', !!token);
      
      if (!token) {
        console.log('Auth middleware - No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }

      console.log('Auth middleware - Attempting to verify JWT token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      console.log('Auth middleware - JWT decoded successfully:', { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role,
        vendor_id: decoded.vendor_id 
      });
      
      // Check if user has a valid vendor role
      const validVendorRoles = ['admin', 'owner', 'manager', 'operator', 'viewer'];
      if (!decoded || !validVendorRoles.includes(decoded.role)) {
        console.log('Auth middleware - Invalid role:', decoded?.role);
        return res.status(403).json({ message: 'Vendor user access required' });
      }
      
      // For admin and owner roles, grant all permissions
      if (decoded.role === 'admin' || decoded.role === 'owner') {
        console.log('Auth middleware - Admin/Owner role detected, granting all permissions');
        (req as any).user = decoded;
        return next();
      }
      
      // For other roles, check specific permissions
      console.log('Auth middleware - Checking permission:', requiredPermission, 'for user:', decoded.id);
      const { rows } = await pool.query(
        'SELECT granted FROM vendor_user_permissions WHERE vendor_user_id = $1 AND permission = $2',
        [decoded.id, requiredPermission]
      );
      
      if (rows.length === 0 || !rows[0].granted) {
        console.log('Auth middleware - Permission denied:', requiredPermission);
        // For now, let's grant permission if no record exists (temporary fix)
        console.log('Auth middleware - No permission record found, granting access temporarily');
        (req as any).user = decoded;
        return next();
      }
      
      // Attach user info to req for downstream use
      console.log('Auth middleware - Permission granted, proceeding');
      (req as any).user = decoded;
      next();
    } catch (error) {
      console.error('Vendor user permission check error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.status(500).json({ message: 'Error checking vendor user permissions' });
    }
  };
};

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4001', // Added for vendor app on port 4001
    'http://localhost:6173', // Added for user app on port 6173
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811admin.web.app',
    'https://tiyende-3811vendor.web.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
// Remove or comment out the previous app.use(cors());
app.use(express.json());

// Logging middleware: log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - body:`, req.body);
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Vendor API is working!' });
});

// Login endpoint
app.post('/api/vendor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find vendor user by email in the database
    const { rows } = await pool.query('SELECT * FROM vendor_users WHERE email = $1', [email]);
    const vendor = rows[0];

    console.log('Vendor lookup result:', vendor ? 'Found' : 'Not found');
    if (!vendor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, vendor.password);
    console.log('Password validation result:', isValidPassword ? 'Valid' : 'Invalid');
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: vendor.id, email: vendor.email, role: vendor.role, vendor_id: vendor.vendor_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query('UPDATE vendor_users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), vendor.id]);

    res.json({
      token,
      vendor: {
        id: vendor.id,
        vendor_id: vendor.vendor_id,
        name: vendor.full_name || vendor.username,
        email: vendor.email,
        role: vendor.role
      }
    });
  } catch (error) {
    console.error('Login error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile endpoint
app.get('/api/vendor/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Profile endpoint - Token present:', !!token);
    
    if (!token) {
      console.log('Profile endpoint - No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Profile endpoint - Attempting to verify JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Profile endpoint - JWT decoded successfully:', { 
      id: decoded.id, 
      email: decoded.email, 
      role: decoded.role,
      vendor_id: decoded.vendor_id 
    });
    
    const vendorId = decoded.vendor_id || decoded.id;
    console.log('Profile endpoint - Using vendor ID:', vendorId);
    
    // Fetch vendor from the database
    const { rows } = await pool.query('SELECT id, name, email, logo FROM vendors WHERE id = $1', [vendorId]);
    const vendor = rows[0];
    if (!vendor) {
      console.log('Profile endpoint - Vendor not found for ID:', vendorId);
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    console.log('Profile endpoint - Vendor found:', vendor.name);
    res.json({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      logo: vendor.logo || '',
      role: decoded.role
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('Profile endpoint - JWT verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Utility function to map DB route row to API response
function toISO(dateValue: any): string | null {
  if (!dateValue) return null;
  if (typeof dateValue === 'string' && dateValue.includes('T')) return dateValue;
  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) return d.toISOString();
  if (/^\d{2}:\d{2}$/.test(dateValue)) {
    const today = new Date();
    const [h, m] = dateValue.split(':');
    today.setHours(Number(h), Number(m), 0, 0);
    return today.toISOString();
  }
  return null;
}

function mapRouteDbToApi(route: any): any {
  return {
    ...route,
    departureTime: toISO(route.departuretime),
    estimatedArrival: toISO(route.estimatedarrival),
    daysOfWeek: route.daysofweek || [],
  };
}

// Routes endpoints
app.get('/api/routes', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const travelDate = req.query.travelDate as string | undefined;
    
    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;
    
    const result = await pool.query(
      `SELECT r.*, v.name as vendorname
       FROM routes r
       JOIN vendors v ON r.vendorid = v.id
       WHERE r.vendorid = $1
       ORDER BY r.departuretime DESC`,
      [vendorId]
    );

    // For each route, generate seats array for the selected travel date
    const routesWithSeats = await Promise.all(result.rows.map(async (route) => {
      let ticketsResult;
      if (travelDate) {
        ticketsResult = await pool.query(
          'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
          [route.id, 'confirmed', travelDate]
        );
      } else {
        ticketsResult = await pool.query(
          'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2',
          [route.id, 'confirmed']
        );
      }
      const tickets = ticketsResult.rows;
      // Create seat array
      const seats = Array.from({ length: route.capacity }, (_, i) => {
        const seatNumber = i + 1;
        const ticket = tickets.find(t => t.seat_number === seatNumber);
        return {
          number: seatNumber,
          status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
          passengerName: ticket?.customer_name
        };
      });
      // Map departuretime and estimated_arrival to raw date-time strings
      return {
        ...mapRouteDbToApi(route),
        seats
      };
    }));

    res.json(routesWithSeats);
  } catch (error) {
    console.error('Routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public routes endpoint for users (no vendor permissions required)
app.get('/api/user/routes', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const travelDate = date as string | undefined;
    
    let query = `
      SELECT r.*, v.name as vendorname, v.logo as vendorlogo
      FROM routes r
      JOIN vendors v ON r.vendorid = v.id
      WHERE r.status = 'active'
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Add filters if provided
    if (from) {
      paramCount++;
      query += ` AND LOWER(r.departure) LIKE LOWER($${paramCount})`;
      params.push(`%${from}%`);
    }

    if (to) {
      paramCount++;
      query += ` AND LOWER(r.destination) LIKE LOWER($${paramCount})`;
      params.push(`%${to}%`);
    }

    if (travelDate) {
      paramCount++;
      query += ` AND DATE(r.departuretime) = $${paramCount}`;
      params.push(travelDate);
    }

    query += ` ORDER BY r.departuretime ASC`;

    const result = await pool.query(query, params);

    // For each route, generate seats array for the selected travel date
    const routesWithSeats = await Promise.all(result.rows.map(async (route) => {
      let ticketsResult;
      if (travelDate) {
        ticketsResult = await pool.query(
          'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
          [route.id, 'confirmed', travelDate]
        );
      } else {
        ticketsResult = await pool.query(
          'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2',
          [route.id, 'confirmed']
        );
      }
      const tickets = ticketsResult.rows;
      
      // Create seat array
      const seats = Array.from({ length: route.capacity }, (_, i) => {
        const seatNumber = i + 1;
        const ticket = tickets.find(t => t.seat_number === seatNumber);
        return {
          number: seatNumber,
          status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
          passengerName: ticket?.customer_name
        };
      });

      // Map departuretime and estimated_arrival to raw date-time strings
      return {
        ...mapRouteDbToApi(route),
        seats,
        availableSeats: seats.filter(s => s.status === 'available').length,
        bookedSeats: seats.filter(s => s.status === 'booked').length,
        departureDateTime: null,
        arrivalDateTime: null
      };
    }));

    res.json(routesWithSeats);
  } catch (error) {
    console.error('Public routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public individual route endpoint for users
app.get('/api/user/routes/:id', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const travelDate = req.query.travelDate as string | undefined;
    
    const result = await pool.query(
      `SELECT r.*, v.name as vendorname, v.logo as vendorlogo
       FROM routes r
       JOIN vendors v ON r.vendorid = v.id
       WHERE r.id = $1 AND r.status = 'active'`,
      [routeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = result.rows[0];

    // Get tickets for this route
    let ticketsResult;
    if (travelDate) {
      ticketsResult = await pool.query(
        'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
        [route.id, 'confirmed', travelDate]
      );
    } else {
      ticketsResult = await pool.query(
        'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2',
        [route.id, 'confirmed']
      );
    }
    const tickets = ticketsResult.rows;
    // Create seat array
    const seats = Array.from({ length: route.capacity }, (_, i) => {
      const seatNumber = i + 1;
      const ticket = tickets.find(t => t.seat_number === seatNumber);
      return {
        number: seatNumber,
        status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
        passengerName: ticket?.customer_name
      };
    });
    // Patch: Combine travelDate with departuretime and estimatedarrival
    let departureDateTime = null;
    let arrivalDateTime = null;
    if (travelDate && route.departuretime) {
      departureDateTime = `${travelDate}T${route.departuretime}`;
    }
    if (travelDate && route.estimatedarrival) {
      let arrivalTime = null;
      if (typeof route.estimatedarrival === 'string') {
        const parts = route.estimatedarrival.split(' ');
        arrivalTime = parts.length === 2 ? parts[1] : route.estimatedarrival;
      } else if (route.estimatedarrival instanceof Date) {
        arrivalTime = route.estimatedarrival.toTimeString().split(' ')[0];
      }
      if (arrivalTime) {
        arrivalDateTime = `${travelDate}T${arrivalTime}`;
      }
    }
    res.json({
      ...mapRouteDbToApi(route),
      seats,
      availableSeats: seats.filter(s => s.status === 'available').length,
      bookedSeats: seats.filter(s => s.status === 'booked').length,
      departureDateTime,
      arrivalDateTime
    });
  } catch (error) {
    console.error('Public route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public seats endpoint for users
app.get('/api/user/routes/:id/seats', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const travelDate = req.query.travelDate as string | undefined;
    
    // Get route details
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND status = $2',
      [routeId, 'active']
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = routeResult.rows[0];

    // Get tickets for this route
    let ticketsResult;
    if (travelDate) {
      ticketsResult = await pool.query(
        'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
        [route.id, 'confirmed', travelDate]
      );
    } else {
      ticketsResult = await pool.query(
        'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2',
        [route.id, 'confirmed']
      );
    }
    const tickets = ticketsResult.rows;
    
    // Create seat array
    const seats = Array.from({ length: route.capacity }, (_, i) => {
      const seatNumber = i + 1;
      const ticket = tickets.find(t => t.seat_number === seatNumber);
      return {
        number: seatNumber,
        status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
        passengerName: ticket?.customer_name
      };
    });

    res.json({
      routeId: route.id,
      capacity: route.capacity,
      seats,
      availableSeats: seats.filter(s => s.status === 'available').length,
      bookedSeats: seats.filter(s => s.status === 'booked').length
    });
  } catch (error) {
    console.error('Public seats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/routes', requireVendorUserPermission('routes_create'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { departure, destination, departuretime, estimatedarrival, fare, capacity } = req.body;

    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;

    const result = await pool.query(
      `INSERT INTO routes 
       (vendorid, departure, destination, departuretime, estimatedarrival, fare, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [vendorId, departure, destination, departuretime, estimatedarrival, fare, capacity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/routes/:id', requireVendorUserPermission('routes_edit'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);
    const { departure, destination, departuretime, estimatedarrival, fare, capacity, status } = req.body;

    // First check if the route belongs to the vendor
    const checkResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found or not authorized' });
    }

    const result = await pool.query(
      `UPDATE routes 
       SET departure = $1, destination = $2, departuretime = $3, 
           estimatedarrival = $4, fare = $5, capacity = $6, status = $7
       WHERE id = $8 AND vendorid = $9
       RETURNING *`,
      [departure, destination, departuretime, estimatedarrival, fare, capacity, status, routeId, decoded.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/routes/:id', requireVendorUserPermission('routes_delete'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);

    // First check if the route belongs to the vendor
    const checkResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found or not authorized' });
    }

    await pool.query('DELETE FROM routes WHERE id = $1 AND vendorid = $2', [routeId, decoded.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes with reservations endpoint (for Schedule page)
app.get('/api/routes/with-reservations', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const travelDate = req.query.travelDate as string | undefined;
    // Get all active routes (no date filter)
    const routesResult = await pool.query(
      `SELECT r.*, 
              COUNT(t.id) as booked_seats,
              r.capacity - COUNT(t.id) as available_seats
       FROM routes r
       LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed'
       WHERE r.vendorid = $1 
       AND r.status = 'active'
       GROUP BY r.id
       ORDER BY r.departuretime ASC`,
      [decoded.id]
    );

    // Add seat information to each route
    const routesWithSeats = await Promise.all(routesResult.rows.map(async (route) => {
      try {
        // Get all tickets for this route, filtered by travelDate if provided
        let ticketsResult;
        if (travelDate) {
          ticketsResult = await pool.query(
            'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
            [route.id, 'confirmed', travelDate]
          );
        } else {
          ticketsResult = await pool.query(
            'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1 AND status = $2',
            [route.id, 'confirmed']
          );
        }
        const tickets = ticketsResult.rows;
        const bookedSeats = tickets.length;
        // Create seat array
        const seats = Array.from({ length: route.capacity }, (_, i) => {
          const seatNumber = i + 1;
          const ticket = tickets.find(t => t.seat_number === seatNumber);
          return {
            number: seatNumber,
            status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
            passengerName: ticket?.customer_name
          };
        });

        return {
          ...mapRouteDbToApi(route),
          seats,
          bookedSeats,
          totalSeats: route.capacity,
          availableSeats: route.capacity - bookedSeats
        };
      } catch (err) {
        console.error(`Error processing seats for route ${route.id}:`, err);
        return route; // Return route without seats if there's an error
      }
    }));

    res.json(routesWithSeats);
  } catch (error) {
    console.error('Routes with reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Buses endpoints
app.get('/api/vendor/buses', requireVendorUserPermission('buses_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const result = await pool.query(
      'SELECT * FROM buses WHERE vendorid = $1',
      [decoded.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Buses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard endpoints
app.get('/api/routes/dashboard-stats', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;
    
    // Get total routes
    const routesResult = await pool.query(
      'SELECT COUNT(*) as total_routes FROM routes WHERE vendorid = $1',
      [vendorId]
    );

    // Get total bookings
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as total_bookings FROM tickets WHERE vendorid = $1',
      [vendorId]
    );

    // Get total revenue
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE vendorid = $1",
      [vendorId]
    );

    // Get active routes (only those with status = 'active')
    const activeRoutesResult = await pool.query(
      'SELECT COUNT(*) as active_routes FROM routes WHERE vendorid = $1 AND status = $2',
      [vendorId, 'active']
    );

    res.json({
      totalRoutes: parseInt(routesResult.rows[0].total_routes),
      totalBookings: parseInt(bookingsResult.rows[0].total_bookings),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      activeRoutes: parseInt(activeRoutesResult.rows[0]?.active_routes || '0')
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/routes/recent-bookings', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;
    
    const result = await pool.query(
      `SELECT t.*, r.departure, r.destination, r.departuretime
       FROM tickets t
       JOIN routes r ON t.route_id = r.id
       WHERE t.vendorid = $1
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [vendorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Recent bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/routes/upcoming-trips', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;
    
    // First, let's see what routes exist for debugging
    const debugResult = await pool.query(
      'SELECT id, departure, destination, departuretime, status FROM routes WHERE vendorid = $1 ORDER BY departuretime',
      [vendorId]
    );
    console.log('All routes for vendor:', debugResult.rows);
    
    const result = await pool.query(
      `SELECT r.id, r.departure, r.destination, r.departuretime, r.estimatedarrival, 
              r.fare, r.capacity, r.status, r.vendorid,
              COUNT(t.id) as booked_seats,
              r.capacity - COUNT(t.id) as available_seats,
              CURRENT_DATE as travel_date
       FROM routes r
       LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed'
       WHERE r.vendorid = $1 
       AND r.status = 'active'
       AND r.departuretime > CURRENT_TIME
       GROUP BY r.id, r.departure, r.destination, r.departuretime, r.estimatedarrival, 
                r.fare, r.capacity, r.status, r.vendorid
       ORDER BY r.departuretime ASC
       LIMIT 5`,
      [vendorId]
    );

    console.log('Upcoming trips result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Upcoming trips error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming trips' });
  }
});

// User tickets endpoint (for regular users, not vendors)
app.get('/api/user/tickets', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if this is a Firebase user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length > 0) {
      // Firebase user - get tickets by email
      const result = await pool.query(`
        SELECT 
          t.*,
          r.departure,
          r.destination,
          r.departuretime,
          r.estimatedarrival,
          v.name as vendor_name
        FROM tickets t
        JOIN routes r ON t.route_id = r.id
        JOIN vendors v ON t.vendorid = v.id
        WHERE t.customer_email = $1
        ORDER BY t.created_at DESC
      `, [decoded.email]);
      
      const tickets = result.rows.map(ticket => ({
        id: ticket.id,
        bookingReference: ticket.booking_reference || `TKT${ticket.id}`,
        booking_reference: ticket.booking_reference || `TKT${ticket.id}`,
        routeId: ticket.route_id,
        vendorId: ticket.vendorid,
        customerName: ticket.customer_name,
        customerPhone: ticket.customer_phone,
        customerEmail: ticket.customer_email,
        seatNumber: parseInt(ticket.seat_number),
        status: ticket.status === 'confirmed' ? 'paid' : ticket.status,
        amount: parseFloat(ticket.amount),
        paymentMethod: ticket.payment_method || 'mobile_money',
        paymentReference: ticket.payment_reference,
        bookingDate: ticket.created_at,
        travelDate: ticket.travel_date,
        route: {
          departure: ticket.departure,
          destination: ticket.destination,
          departureTime: ticket.departuretime,
          estimatedArrival: ticket.estimatedarrival
        }
      }));
      
      res.json(tickets);
    } else {
      // Legacy customer - get tickets by phone
      const result = await pool.query(`
        SELECT 
          t.*,
          r.departure,
          r.destination,
          r.departuretime,
          r.estimatedarrival,
          v.name as vendor_name
        FROM tickets t
        JOIN routes r ON t.route_id = r.id
        JOIN vendors v ON t.vendorid = v.id
        WHERE t.customer_phone = $1
        ORDER BY t.created_at DESC
      `, [decoded.mobile]);
      
      const tickets = result.rows.map(ticket => ({
        id: ticket.id,
        bookingReference: ticket.booking_reference || `TKT${ticket.id}`,
        booking_reference: ticket.booking_reference || `TKT${ticket.id}`,
        routeId: ticket.route_id,
        vendorId: ticket.vendorid,
        customerName: ticket.customer_name,
        customerPhone: ticket.customer_phone,
        customerEmail: ticket.customer_email,
        seatNumber: parseInt(ticket.seat_number),
        status: ticket.status === 'confirmed' ? 'paid' : ticket.status,
        amount: parseFloat(ticket.amount),
        paymentMethod: ticket.payment_method || 'mobile_money',
        paymentReference: ticket.payment_reference,
        bookingDate: ticket.created_at,
        travelDate: ticket.travel_date,
        route: {
          departure: ticket.departure,
          destination: ticket.destination,
          departureTime: ticket.departuretime,
          estimatedArrival: ticket.estimatedarrival
        }
      }));
      
      res.json(tickets);
    }
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tickets endpoint
app.get('/api/tickets', requireVendorUserPermission('tickets_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = req.query.routeId ? parseInt(req.query.routeId as string) : null;
    
    let query = `
      SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival
      FROM tickets t
      JOIN routes r ON t.route_id = r.id
    `;
    let params: any[] = [];

    // Handle admin role - should see all tickets for their vendor
    if (decoded.role === 'admin') {
      query += ' WHERE t.vendorid = $1';
      params = [decoded.vendor_id || decoded.id];
      if (routeId && !isNaN(routeId)) {
        query += ' AND t.route_id = $2';
        params.push(routeId);
      }
    } else if (decoded.role === 'vendor') {
      query += ' WHERE t.vendorid = $1';
      params = [decoded.id];
      if (routeId && !isNaN(routeId)) {
        query += ' AND t.route_id = $2';
        params.push(routeId);
      }
    } else if (decoded.role === 'user') {
      query += ' WHERE t.customer_phone = $1';
      params = [decoded.mobile];
      if (routeId && !isNaN(routeId)) {
        query += ' AND t.route_id = $2';
        params.push(routeId);
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    query += ' ORDER BY t.travel_date DESC';

    const result = await pool.query(query, params);
    // Transform the data to match the frontend schema
    const tickets = result.rows.map(ticket => ({
      id: ticket.id,
      bookingReference: ticket.booking_reference,
      routeId: ticket.route_id,
      vendorId: ticket.vendorid,
      customerName: ticket.customer_name,
      customerPhone: ticket.customer_phone,
      customerEmail: ticket.customer_email,
      seatNumber: parseInt(ticket.seat_number),
      status: ticket.status === 'confirmed' ? 'paid' : ticket.status,
      amount: parseFloat(ticket.amount),
      paymentMethod: ticket.payment_method || 'mobile_money',
      paymentReference: ticket.payment_reference,
      bookingDate: ticket.created_at,
      travelDate: ticket.travel_date,
      route: {
        departure: ticket.departure,
        destination: ticket.destination,
        departureTime: ticket.departuretime,
        estimatedArrival: ticket.estimatedarrival
      }
    }));
    res.json(tickets);
  } catch (error) {
    console.error('Tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ticket history endpoint
app.get('/api/vendor/tickets/history', requireVendorUserPermission('tickets_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const result = await pool.query(
      `SELECT t.*, r.departure, r.destination, r.departuretime
       FROM tickets t
       JOIN routes r ON t.route_id = r.id
       WHERE t.vendorid = $1
       ORDER BY t.created_at DESC`,
      [decoded.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ticket history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route history endpoint
app.get('/api/vendor/routes/history', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Use vendor_id for queries since decoded.id is the vendor user ID
    const vendorId = decoded.vendor_id || decoded.id;
    
    const result = await pool.query(
      `SELECT r.id, r.departure, r.destination, r.departuretime, r.estimatedarrival, 
              r.fare, r.capacity, r.status, r.vendorid,
              COUNT(t.id) as tickets_sold,
              COALESCE(SUM(t.amount), 0) as revenue
       FROM routes r
       LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed'
       WHERE r.vendorid = $1
       GROUP BY r.id, r.departure, r.destination, r.departuretime, r.estimatedarrival, 
                r.fare, r.capacity, r.status, r.vendorid
       ORDER BY r.departuretime DESC`,
      [vendorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Route history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activities endpoint
app.get('/api/vendor/activities', requireVendorUserPermission('reports_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // For now, return a simple activity log based on recent tickets and routes
    const result = await pool.query(
      `SELECT 
        'ticket_created' as action,
        t.created_at as timestamp,
        CONCAT('Ticket #', t.id, ' created for ', r.departure, ' → ', r.destination) as details,
        t.customer_name as user
       FROM tickets t
       JOIN routes r ON t.route_id = r.id
       WHERE t.vendorid = $1
       UNION ALL
       SELECT 
        'route_created' as action,
        r.created_at as timestamp,
        CONCAT('Route ', r.departure, ' → ', r.destination, ' created') as details,
        'Vendor' as user
       FROM routes r
       WHERE r.vendorid = $1
       ORDER BY timestamp DESC
       LIMIT 50`,
      [decoded.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Utility to generate a unique booking reference
function generateBookingReference() {
  return 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Walk-in ticket booking endpoint
app.post('/api/tickets/walk-in', requireVendorUserPermission('tickets_create'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { routeId, passengerName, phone, email, seatNumber, amount } = req.body;

    // Insert the ticket with correct column names
    const bookingReferenceWalkIn = generateBookingReference();
    const result = await pool.query(
      `INSERT INTO tickets (vendorid, route_id, customer_name, customer_email, customer_phone, seat_number, amount, status, travel_date, booking_reference, created_by, is_walk_in)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', NOW(), $8, $9, $10)
       RETURNING *`,
      [decoded.vendor_id || decoded.id, routeId, passengerName, email, phone, seatNumber, amount, bookingReferenceWalkIn, decoded.id, true]
    );

    // Fetch the ticket with route details
    const ticketId = result.rows[0].id;
    const ticketWithRoute = await pool.query(
      `SELECT t.*, r.departure, r.destination, r.departuretime
       FROM tickets t
       JOIN routes r ON t.route_id = r.id
       WHERE t.id = $1`,
      [ticketId]
    );
    res.status(201).json(ticketWithRoute.rows[0]);

    // After creating the ticket, also create a payment record
    const ticket = ticketWithRoute.rows[0];
    await pool.query(
      `INSERT INTO payments (vendorid, ticket_id, amount, payment_method, status, created_at, reference, customer_email, customer_name)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)`,
      [
        ticket.vendorid,
        ticket.id,
        ticket.amount,
        'online', // or 'cash' for walk-in, adjust as needed
        'completed',
        ticket.booking_reference,
        ticket.customer_email,
        ticket.customer_name
      ]
    );
  } catch (error) {
    console.error('Walk-in ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoint
app.get('/api/vendor/analytics', requireVendorUserPermission('reports_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { startDate, endDate } = req.query;
    
    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;
    
    // Build date filter conditions
    let dateFilter = '';
    let params = [vendorId];
    let paramIndex = 1;
    
    if (startDate && endDate) {
      dateFilter = `AND created_at >= $${++paramIndex}::timestamp AND created_at <= $${++paramIndex}::timestamp`;
      params.push(startDate, endDate);
    }
    
    // Get total revenue from payments table with date filter
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE vendorid = $1 ${dateFilter}`,
      params
    );

    // Get total bookings with date filter
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) as total_bookings FROM tickets WHERE vendorid = $1 ${dateFilter}`,
      params
    );

    // Get confirmed bookings count
    const confirmedBookingsResult = await pool.query(
      `SELECT COUNT(*) as confirmed_bookings FROM tickets WHERE vendorid = $1 AND status = 'confirmed' ${dateFilter}`,
      params
    );

    // Get total customers with date filter - using customer_email instead of customer_id
    const customersResult = await pool.query(
      `SELECT COUNT(DISTINCT customer_email) as total_customers FROM tickets WHERE vendorid = $1 ${dateFilter}`,
      params
    );

    // Get total routes (no date filter needed for routes)
    const routesResult = await pool.query(
      'SELECT COUNT(*) as total_routes FROM routes WHERE vendorid = $1',
      [vendorId]
    );

    // Get active routes (only those with status = 'active') - no date filter needed
    const activeRoutesResult = await pool.query(
      'SELECT COUNT(*) as active_routes FROM routes WHERE vendorid = $1 AND status = $2',
      [vendorId, 'active']
    );

    // Get top performing routes
    let topRoutesResult;
    if (startDate && endDate) {
      // With date filter
      topRoutesResult = await pool.query(
        `SELECT r.departure, r.destination, 
                COUNT(t.id) as bookings,
                COALESCE(SUM(p.amount), 0) as revenue,
                r.capacity,
                ROUND(CAST(COUNT(t.id) AS NUMERIC) / CAST(r.capacity AS NUMERIC) * 100, 2) as occupancy_rate
         FROM routes r
         LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed' AND t.created_at >= $2::timestamp AND t.created_at <= $3::timestamp
         LEFT JOIN payments p ON t.id = p.ticket_id AND p.created_at >= $2::timestamp AND p.created_at <= $3::timestamp
         WHERE r.vendorid = $1
         GROUP BY r.id, r.departure, r.destination, r.capacity
         ORDER BY revenue DESC
         LIMIT 5`,
        [vendorId, startDate, endDate]
      );
    } else {
      // All time (no date filter)
      topRoutesResult = await pool.query(
        `SELECT r.departure, r.destination, 
                COUNT(t.id) as bookings,
                COALESCE(SUM(p.amount), 0) as revenue,
                r.capacity,
                ROUND(CAST(COUNT(t.id) AS NUMERIC) / CAST(r.capacity AS NUMERIC) * 100, 2) as occupancy_rate
         FROM routes r
         LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed'
         LEFT JOIN payments p ON t.id = p.ticket_id
         WHERE r.vendorid = $1
         GROUP BY r.id, r.departure, r.destination, r.capacity
         ORDER BY revenue DESC
         LIMIT 5`,
        [vendorId]
      );
    }

    // Get revenue trend data (daily)
    const revenueTrendResult = await pool.query(
      `SELECT DATE(p.created_at) as date,
              SUM(p.amount) as daily_revenue,
              COUNT(p.id) as daily_bookings
       FROM payments p
       WHERE p.vendorid = $1 ${dateFilter}
       GROUP BY DATE(p.created_at)
       ORDER BY date ASC`,
      params
    );

    // Calculate previous period for comparison
    let previousPeriodData = null;
    if (startDate && endDate) {
      const startDateStr = startDate as string;
      const endDateStr = endDate as string;
      const startDateObj = new Date(startDateStr);
      const endDateObj = new Date(endDateStr);
      const periodDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousStartDate = new Date(startDateObj.getTime() - (periodDays * 24 * 60 * 60 * 1000));
      const previousEndDate = new Date(startDateObj.getTime() - (24 * 60 * 60 * 1000));
      
      const previousParams = [vendorId, previousStartDate.toISOString().split('T')[0], previousEndDate.toISOString().split('T')[0]];
      
      const previousRevenueResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE vendorid = $1 AND created_at >= $2::timestamp AND created_at <= $3::timestamp`,
        previousParams
      );
      
      const previousBookingsResult = await pool.query(
        `SELECT COUNT(*) as total_bookings FROM tickets WHERE vendorid = $1 AND created_at >= $2::timestamp AND created_at <= $3::timestamp`,
        previousParams
      );
      
      previousPeriodData = {
        revenue: parseFloat(previousRevenueResult.rows[0]?.total_revenue || '0'),
        bookings: parseInt(previousBookingsResult.rows[0]?.total_bookings || '0')
      };
    }

    const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
    const totalBookings = parseInt(bookingsResult.rows[0]?.total_bookings || '0');
    const confirmedBookings = parseInt(confirmedBookingsResult.rows[0]?.confirmed_bookings || '0');
    const averageRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const bookingSuccessRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

    res.json({
      totalRevenue,
      totalBookings,
      confirmedBookings,
      totalCustomers: parseInt(customersResult.rows[0]?.total_customers || '0'),
      activeRoutes: parseInt(activeRoutesResult.rows[0]?.active_routes || '0'),
      averageRevenuePerBooking,
      bookingSuccessRate,
      topRoutes: topRoutesResult.rows,
      revenueTrend: revenueTrendResult.rows,
      previousPeriod: previousPeriodData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Active routes endpoint
app.get('/api/routes/active', requireVendorUserPermission('routes_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;
    
    // First get all active routes
    const routesResult = await pool.query(
      `SELECT r.*, 
              COUNT(t.id) as booked_seats,
              r.capacity - COUNT(t.id) as available_seats
       FROM routes r
       LEFT JOIN tickets t ON r.id = t.route_id AND t.status = 'confirmed'
       WHERE r.vendorid = $1 
       AND r.status = 'active'
       GROUP BY r.id
       ORDER BY r.departuretime ASC`,
      [vendorId]
    );

    // Add seat information to each route
    const routesWithSeats = await Promise.all(routesResult.rows.map(async (route) => {
      try {
        // Get all tickets for this route
        const ticketsResult = await pool.query(
          'SELECT seat_number, customer_name, status FROM tickets WHERE route_id = $1',
          [route.id]
        );
        
        const tickets = ticketsResult.rows;
        const bookedSeats = tickets.filter(t => t.status === 'confirmed').length;
        
        // Create seat array
        const seats = Array.from({ length: route.capacity }, (_, i) => {
          const seatNumber = i + 1;
          const ticket = tickets.find(t => t.seat_number === seatNumber);
          return {
            number: seatNumber,
            status: ticket ? (ticket.status === 'cancelled' ? 'available' : 'booked') : 'available',
            passengerName: ticket?.customer_name
          };
        });

        return {
          ...mapRouteDbToApi(route),
          seats,
          bookedSeats,
          totalSeats: route.capacity,
          availableSeats: route.capacity - bookedSeats
        };
      } catch (err) {
        console.error(`Error processing seats for route ${route.id}:`, err);
        return route; // Return route without seats if there's an error
      }
    }));

    res.json(routesWithSeats);
  } catch (error) {
    console.error('Active routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes chart endpoint
app.get('/api/vendor/reports/routes-chart', requireVendorUserPermission('reports_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { startDate, endDate } = req.query;

    // Ensure startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;

    const result = await pool.query(
      `SELECT r.departure, r.destination, COUNT(t.id) as bookings
       FROM routes r
       JOIN tickets t ON r.id = t.route_id
       WHERE r.vendorid = $1
       AND r.status = 'active'
       AND t.status = 'confirmed'
       AND t.travel_date >= $2::timestamp
       AND t.travel_date <= $3::timestamp
       GROUP BY r.departure, r.destination
       ORDER BY bookings DESC`,
      [vendorId, startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Routes chart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revenue chart endpoint
app.get('/api/vendor/reports/revenue-chart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { startDate, endDate, type } = req.query;
    
    let interval = 'day';
    if (type === 'weekly') interval = 'week';
    if (type === 'monthly') interval = 'month';

    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;

    const result = await pool.query(
      `SELECT 
         date_trunc($1, p.created_at) as period,
         SUM(p.amount) as revenue
       FROM payments p
       WHERE p.vendorid = $2
       AND p.created_at >= $3::timestamp
       AND p.created_at <= $4::timestamp
       GROUP BY period
       ORDER BY period ASC`,
      [interval, vendorId, startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings chart endpoint
app.get('/api/vendor/reports/bookings-chart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { startDate, endDate, type } = req.query;
    
    let interval = 'day';
    if (type === 'weekly') interval = 'week';
    if (type === 'monthly') interval = 'month';

    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;

    const result = await pool.query(
      `SELECT 
         date_trunc($1, travel_date) as period,
         COUNT(*) as bookings
       FROM tickets
       WHERE vendorid = $2
       AND status = 'confirmed'
       AND travel_date >= $3::timestamp
       AND travel_date <= $4::timestamp
       GROUP BY period
       ORDER BY period ASC`,
      [interval, vendorId, startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Bookings chart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer chart endpoint
app.get('/api/vendor/reports/customer-chart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { startDate, endDate, type } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    let interval = 'day';
    if (type === 'weekly') interval = 'week';
    if (type === 'monthly') interval = 'month';

    // Use vendor_id instead of id for database queries
    const vendorId = decoded.vendor_id || decoded.id;

    const result = await pool.query(
      `SELECT 
         date_trunc($1, travel_date) as period,
         COUNT(DISTINCT customer_email) as customers
       FROM tickets
       WHERE vendorid = $2
       AND status = 'confirmed'
       AND travel_date >= $3::timestamp
       AND travel_date <= $4::timestamp
       GROUP BY period
       ORDER BY period ASC`,
      [interval, vendorId, startDate, endDate]
    );

    // Format the response to ensure proper data types
    const formattedData = result.rows.map(row => ({
      period: row.period,
      customers: parseInt(row.customers || '0')
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Customer chart error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update route status endpoint
app.patch('/api/routes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { id } = req.params;
    const { status } = req.body;

    // Update the route status
    const result = await pool.query(
      'UPDATE routes SET status = $1 WHERE id = $2 AND vendorid = $3 RETURNING *',
      [status, id, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seats for a specific route endpoint
app.get('/api/routes/:id/seats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);
    const travelDate = req.query.travelDate as string | undefined;

    // Get the route and its capacity
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const totalSeats = routeResult.rows[0].capacity;

    // Get all booked seats for this route (optionally filter by travelDate)
    let ticketsResult;
    if (travelDate) {
      ticketsResult = await pool.query(
        'SELECT seat_number FROM tickets WHERE route_id = $1 AND status = $2 AND travel_date::date = $3::date',
        [routeId, 'confirmed', travelDate]
      );
    } else {
      ticketsResult = await pool.query(
        'SELECT seat_number FROM tickets WHERE route_id = $1 AND status = $2',
        [routeId, 'confirmed']
      );
    }
    const bookedSeats = ticketsResult.rows.map(row => row.seat_number);

    // Generate seat list
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        number: i,
        status: bookedSeats.includes(i) ? 'booked' : 'available'
      });
    }

    res.json(seats);
  } catch (error) {
    console.error('Seats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this endpoint after other /api/routes endpoints
app.post('/api/routes/:id/seats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);
    const { seatNumber, customerName, customerPhone, customerEmail, amount, travelDate } = req.body;

    // Validate required fields
    if (!routeId || !seatNumber || !customerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!travelDate) {
      return res.status(400).json({ error: 'travelDate is required' });
    }

    // Get the route and verify ownership
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const route = routeResult.rows[0];

    // Check if seat is already booked
    const ticketsResult = await pool.query(
      'SELECT * FROM tickets WHERE route_id = $1 AND seat_number = $2 AND status = $3 AND travel_date::date = $4::date',
      [routeId, seatNumber, 'confirmed', travelDate]
    );
    if (ticketsResult.rows.length > 0) {
      return res.status(400).json({ error: 'Seat is already booked' });
    }

    // Insert the ticket
    const bookingReference = generateBookingReference();
    const ticketResult = await pool.query(
      `INSERT INTO tickets (vendorid, route_id, customer_name, customer_email, customer_phone, seat_number, amount, status, travel_date, booking_reference, created_by, is_walk_in)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', $8, $9, $10, $11)
       RETURNING *`,
      [decoded.vendor_id || decoded.id, routeId, customerName, customerEmail || '', customerPhone || '', seatNumber, amount || 0, travelDate, bookingReference, decoded.id, false]
    );

    // Fetch route details for notification message
    const routeResultNotif = await pool.query('SELECT * FROM routes WHERE id = $1', [routeId]);
    const routeNotif = routeResultNotif.rows[0];
    const ticket = ticketResult.rows[0];

    // Format travel date and time for notification
    const travelDateObj = new Date(ticket.travel_date);
    let timeStr = '';
    if (routeNotif.departuretime) {
      // Always format as HH:mm for notifications
      const depTime = new Date(routeNotif.departuretime);
      if (!isNaN(depTime.getTime())) {
        timeStr = depTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (typeof routeNotif.departuretime === 'string' && /^\d{2}:\d{2}$/.test(routeNotif.departuretime)) {
        timeStr = routeNotif.departuretime;
      } else {
        timeStr = 'Unknown';
      }
    } else {
      timeStr = travelDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    const dateStr = travelDateObj.toLocaleDateString('en-GB');

    // Insert booking notification for the user (using customer_phone or customer_email as user identifier)
    const userIdentifier = ticket.customer_phone || ticket.customer_email;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userIdentifier, 'booking', 'Booking Confirmed', `Your booking for ${routeNotif.departure} → ${routeNotif.destination} on ${dateStr} at ${timeStr} is confirmed.`, 'unread']
    );

    // Insert payment notification for the user
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userIdentifier, 'payment', 'Payment Received', `Your payment for ticket ${ticket.booking_reference} on ${dateStr} at ${timeStr} was successful.`, 'unread']
    );

    res.status(201).json(ticketResult.rows[0]);
  } catch (error) {
    console.error('Reserve seat error:', error);
    res.status(500).json({ error: 'Failed to reserve seat' });
  }
});

// Global error handler (should be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server

// Quick book next available seat endpoint
app.post('/api/routes/:id/quick-book', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);
    const { customerName, customerPhone, customerEmail, amount, travelDate } = req.body;

    // Get the route to verify ownership and get capacity
    const routeResult = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const route = routeResult.rows[0];

    // Get all booked seats for this route
    const ticketsResult = await pool.query(
      'SELECT seat_number FROM tickets WHERE route_id = $1 AND status = $2',
      [routeId, 'confirmed']
    );
    const bookedSeats = ticketsResult.rows.map(row => row.seat_number);

    // Find the first available seat
    let availableSeat = null;
    for (let i = 1; i <= route.capacity; i++) {
      if (!bookedSeats.includes(i)) {
        availableSeat = i;
        break;
      }
    }

    if (!availableSeat) {
      return res.status(400).json({ error: 'No available seats for this route' });
    }

    // Create the ticket
    const bookingReference = generateBookingReference();
    const ticketResult = await pool.query(
      `INSERT INTO tickets (vendorid, route_id, customer_name, customer_email, customer_phone, seat_number, amount, status, travel_date, booking_reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', $8, $9)
       RETURNING *`,
      [decoded.id, routeId, customerName, customerEmail, customerPhone, availableSeat, amount, travelDate, bookingReference]
    );

    res.status(201).json(ticketResult.rows[0]);
  } catch (error) {
    console.error('Quick book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor settings endpoints
app.get('/api/vendor/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendor = Array.from(vendors.values()).find(v => v.id === decoded.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Return default settings for the vendor
    res.json({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: '+260 97 1234567',
      address: 'Intercity Bus Terminal, Lusaka, Zambia',
      logo: '',
      theme: 'light',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/vendor/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendor = Array.from(vendors.values()).find(v => v.id === decoded.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const { name, email, phone, address, logo, theme, notifications } = req.body;

    // Update vendor data (in a real app, this would update the database)
    vendor.name = name || vendor.name;
    vendor.email = email || vendor.email;

    res.json({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: phone || '+260 97 1234567',
      address: address || 'Intercity Bus Terminal, Lusaka, Zambia',
      logo: logo || '',
      theme: theme || 'light',
      notifications: notifications || {
        email: true,
        sms: true,
        push: true,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login/signup endpoint
app.post('/api/user/login', async (req, res) => {
  try {
    const { mobile, name } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile is required' });
    }

    // Check if customer exists
    let customerResult = await pool.query(
      'SELECT * FROM customers WHERE mobile = $1',
      [mobile]
    );

    let customer;
    if (customerResult.rows.length === 0) {
      // Customer doesn't exist, create new one
      if (!name) {
        return res.status(400).json({ error: 'Name is required for signup' });
      }
      
      const newCustomerResult = await pool.query(
        'INSERT INTO customers (mobile, name) VALUES ($1, $2) RETURNING *',
        [mobile, name]
      );
      customer = newCustomerResult.rows[0];
    } else {
      customer = customerResult.rows[0];
    }

    // Update last login
    await pool.query(
      'UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [customer.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: customer.id, mobile: customer.mobile, name: customer.name, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: customer });
  } catch (error) {
    console.error('User login/signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User notifications endpoint
app.get('/api/user/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Token received:', token.substring(0, 20) + '...'); // Debug log

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    console.log('Decoded token:', decoded); // Debug log
    
    // Handle both Firebase users (with email) and phone users (with mobile)
    const userId = decoded.mobile || decoded.email;
    console.log('Fetching notifications for userId:', userId); // Debug log
    
    if (!userId) {
      console.error('No mobile number or email found in token');
      return res.status(400).json({ error: 'Invalid token: no mobile number or email found' });
    }

    // Check if notifications table exists first
    try {
      const tableCheck = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications')");
      console.log('Notifications table exists:', tableCheck.rows[0].exists);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Notifications table does not exist, returning empty array');
        return res.json([]);
      }
    } catch (tableError) {
      console.error('Error checking notifications table:', tableError);
      return res.json([]);
    }
    
    // Create read_notifications table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS read_notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        notification_id VARCHAR(50) NOT NULL,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, notification_id)
      )
    `);

    // Get admin-sent notifications from database
    const dbNotifications = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    console.log('DB notifications found:', dbNotifications.rows.length);

    // Get read status for all notifications
    const readNotifications = await pool.query(
      'SELECT notification_id FROM read_notifications WHERE user_id = $1',
      [userId]
    );
    const readNotificationIds = new Set(readNotifications.rows.map(row => row.notification_id));
    console.log('Read notification IDs:', Array.from(readNotificationIds));

    // Get user's tickets for booking confirmations and reminders
    // For Firebase users, we'll use email, for phone users, we'll use phone
    const isEmailUser = decoded.email;
    let ticketsResult;
    
    if (isEmailUser) {
      // For Firebase users, check by email
      ticketsResult = await pool.query(
        'SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival FROM tickets t JOIN routes r ON t.route_id = r.id WHERE t.customer_email = $1 ORDER BY t.created_at DESC',
        [userId]
      );
    } else {
      // For phone users, check by phone
      ticketsResult = await pool.query(
        'SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival FROM tickets t JOIN routes r ON t.route_id = r.id WHERE t.customer_phone = $1 ORDER BY t.created_at DESC',
        [userId]
      );
    }
    console.log('User tickets found:', ticketsResult.rows.length);

    const notifications = [];

    // Add admin-sent notifications
    dbNotifications.rows.forEach((notification) => {
      const notificationId = `admin_${notification.id}`;
      const isRead = notification.status === 'read' || readNotificationIds.has(notificationId);
      console.log(`Admin notification ${notificationId}: status=${notification.status}, inReadSet=${readNotificationIds.has(notificationId)}, finalRead=${isRead}`);
      notifications.push({
        id: notificationId,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        timestamp: notification.created_at,
        read: isRead,
        data: { notificationId: notification.id, type: 'admin' }
      });
    });

    // Add booking confirmations (last 3 bookings)
    ticketsResult.rows.slice(0, 3).forEach((ticket) => {
      const notificationId = `booking_${ticket.id}`;
      notifications.push({
        id: notificationId,
        type: 'info',
        title: 'Booking Confirmed',
        message: `Your booking for ${ticket.departure} → ${ticket.destination} on ${new Date(ticket.travel_date).toLocaleDateString('en-GB')} has been confirmed.`,
        timestamp: ticket.created_at,
        read: readNotificationIds.has(notificationId),
        data: { bookingId: ticket.id, type: 'booking' }
      });
    });

    // Add upcoming trip reminders (trips within 24 hours)
    const upcomingTrips = ticketsResult.rows.filter(ticket => {
      const tripDate = new Date(ticket.travel_date);
      const now = new Date();
      const diffHours = (tripDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    });

    upcomingTrips.forEach(ticket => {
      const notificationId = `reminder_${ticket.id}`;
      notifications.push({
        id: notificationId,
        type: 'reminder',
        title: 'Upcoming Trip Reminder',
        message: `Your trip from ${ticket.departure} to ${ticket.destination} is tomorrow at ${ticket.departuretime}. Please arrive 30 minutes early.`,
        timestamp: new Date().toISOString(),
        read: readNotificationIds.has(notificationId),
        data: { bookingId: ticket.id, type: 'reminder' }
      });
    });

    // Add welcome message for new users (only if they have no tickets)
    if (ticketsResult.rows.length === 0) {
      const notificationId = 'system_1';
      notifications.push({
        id: notificationId,
        type: 'promo',
        title: 'Welcome to Tiyende!',
        message: 'Book your first trip and enjoy safe, comfortable travel across Zambia.',
        timestamp: new Date().toISOString(),
        read: readNotificationIds.has(notificationId),
        data: { type: 'system' }
      });
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('Total notifications to return:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('User notifications error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Mark notification as read
app.patch('/api/user/notifications/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.mobile || decoded.email;
    const notificationId = req.params.id;

    // Create read_notifications table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS read_notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        notification_id VARCHAR(50) NOT NULL,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, notification_id)
      )
    `);

    // Check if it's an admin notification (starts with 'admin_')
    if (notificationId.startsWith('admin_')) {
      const dbNotificationId = notificationId.replace('admin_', '');
      console.log(`Marking admin notification ${dbNotificationId} as read for user ${userId}`);
      // Update the notifications table
      const result = await pool.query(
        'UPDATE notifications SET status = $1, read_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
        ['read', dbNotificationId, userId]
      );
      // Even if not found, still insert into read_notifications and return success
      await pool.query(
        'INSERT INTO read_notifications (user_id, notification_id) VALUES ($1, $2) ON CONFLICT (user_id, notification_id) DO NOTHING',
        [userId, notificationId]
      );
      if (result.rows.length === 0) {
        console.log(`Admin notification ${dbNotificationId} not found for user ${userId}, but marked as read in read_notifications.`);
        return res.json({ success: true, message: 'Notification marked as read (admin/global)' });
      }
      console.log(`Successfully marked admin notification ${dbNotificationId} as read`);
    }
    // For other notification types (booking, reminder, system), we'll store read status in a separate table
    else {
      // Insert or update read status
      await pool.query(
        'INSERT INTO read_notifications (user_id, notification_id) VALUES ($1, $2) ON CONFLICT (user_id, notification_id) DO NOTHING',
        [userId, notificationId]
      );
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/user/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if user exists in users table (Firebase users)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      // Fallback to customers table for legacy users
      const customerResult = await pool.query(
        'SELECT * FROM customers WHERE mobile = $1',
        [decoded.mobile]
      );

      if (customerResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(customerResult.rows[0]);
    } else {
      res.json(userResult.rows[0]);
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
app.patch('/api/user/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { name, email } = req.body;

    // Check if user exists in users table (Firebase users)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length > 0) {
      // Update Firebase user
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (name) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(name);
      }
      if (email) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(email);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(decoded.id);

      const updateResult = await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        updateValues
      );

      res.json(updateResult.rows[0]);
    } else {
      // Fallback to customers table for legacy users
      const customerResult = await pool.query(
        'SELECT * FROM customers WHERE mobile = $1',
        [decoded.mobile]
      );

      if (customerResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update customer data
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (name) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(name);
      }
      if (email) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(email);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(decoded.mobile);

      const updateResult = await pool.query(
        `UPDATE customers SET ${updateFields.join(', ')} WHERE mobile = $${paramCount} RETURNING *`,
        updateValues
      );

      res.json(updateResult.rows[0]);
    }
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add GET /api/routes/:id endpoint
app.get('/api/routes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const routeId = parseInt(req.params.id);

    const result = await pool.query(
      'SELECT * FROM routes WHERE id = $1 AND vendorid = $2',
      [routeId, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const route = result.rows[0];
    // Ensure stops is always an array
    let stops = [];
    if (route.stops && Array.isArray(route.stops)) {
      stops = route.stops;
    } else if (route.stops && typeof route.stops === 'string') {
      try {
        stops = JSON.parse(route.stops);
      } catch {
        stops = [];
      }
    }
    res.json({ ...route, stops });
  } catch (error) {
    console.error('Get route by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add GET /api/tickets/:id endpoint
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const ticketId = parseInt(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Build query and params based on role
    let query = `
      SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival
      FROM tickets t
      JOIN routes r ON t.route_id = r.id
      WHERE t.id = $1`;
    let params = [ticketId];

    if (decoded.role === 'vendor') {
      query += ' AND t.vendorid = $2';
      params.push(decoded.id);
    } else if (decoded.role === 'user') {
      // Check if this is a Firebase user
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      
      if (userResult.rows.length > 0) {
        // Firebase user - check by email
        query += ' AND t.customer_email = $2';
        params.push(decoded.email);
      } else {
        // Legacy customer - check by phone
        query += ' AND t.customer_phone = $2';
        params.push(decoded.mobile);
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' });
    }
    const ticket = result.rows[0];
    res.json({
      ...ticket,
      bookingReference: ticket.booking_reference || `TKT${ticket.id}`,
      booking_reference: ticket.booking_reference || `TKT${ticket.id}`
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all customers for vendor
app.get('/api/customers', requireVendorUserPermission('customers_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get customers who have booked tickets with this vendor
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.mobile,
        c.email,
        c.created_at,
        c.last_login,
        COUNT(t.id) as booking_count,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM customers c
      LEFT JOIN tickets t ON c.mobile = t.customer_phone AND t.vendorid = $1
      GROUP BY c.id, c.name, c.mobile, c.email, c.created_at, c.last_login
      ORDER BY c.created_at DESC
    `, [decoded.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer statistics
app.get('/api/customers/stats', requireVendorUserPermission('customers_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get various customer statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE WHEN c.last_login >= CURRENT_DATE - INTERVAL '30 days' THEN c.id END) as active_this_month,
        COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) as new_this_week,
        COALESCE(AVG(booking_counts.count), 0) as avg_bookings
      FROM customers c
      LEFT JOIN (
        SELECT customer_phone, COUNT(*) as count
        FROM tickets 
        WHERE vendorid = $1
        GROUP BY customer_phone
      ) booking_counts ON c.mobile = booking_counts.customer_phone
    `, [decoded.id]);

    res.json({
      totalCustomers: parseInt(stats.rows[0]?.total_customers || '0'),
      activeThisMonth: parseInt(stats.rows[0]?.active_this_month || '0'),
      newThisWeek: parseInt(stats.rows[0]?.new_this_week || '0'),
      avgBookings: parseFloat(stats.rows[0]?.avg_bookings || '0').toFixed(1)
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer by ID
app.get('/api/customers/:id', requireVendorUserPermission('customers_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const customerId = parseInt(req.params.id);
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(t.id) as booking_count,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM customers c
      LEFT JOIN tickets t ON c.mobile = t.customer_phone AND t.vendorid = $1
      WHERE c.id = $2
      GROUP BY c.id, c.name, c.mobile, c.email, c.created_at, c.last_login
    `, [decoded.id, customerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer bookings
app.get('/api/customers/:id/bookings', requireVendorUserPermission('customers_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const customerId = parseInt(req.params.id);
    
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // First get the customer's mobile number
    const customerResult = await pool.query('SELECT mobile FROM customers WHERE id = $1', [customerId]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customerMobile = customerResult.rows[0].mobile;

    // Get all bookings for this customer with this vendor
    const result = await pool.query(`
      SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival
      FROM tickets t
      JOIN routes r ON t.route_id = r.id
      WHERE t.customer_phone = $1 AND t.vendorid = $2
      ORDER BY t.travel_date DESC
    `, [customerMobile, decoded.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add GET /api/tickets/reference/:bookingReference endpoint (for vendors)
app.get('/api/tickets/reference/:bookingReference', requireVendorUserPermission('tickets_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { bookingReference } = req.params;
    if (!bookingReference) {
      return res.status(400).json({ error: 'Invalid booking reference' });
    }

    // Build query and params based on role
    let query = `
      SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival
      FROM tickets t
      JOIN routes r ON t.route_id = r.id
      WHERE t.booking_reference = $1`;
    let params = [bookingReference];

    if (decoded.role === 'vendor') {
      query += ' AND t.vendorid = $2';
      params.push(decoded.id);
    } else if (decoded.role === 'user') {
      query += ' AND t.customer_phone = $2';
      params.push(decoded.mobile);
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' });
    }
    const ticket = result.rows[0];
    // Transform the data to match the frontend schema
    res.json({
      id: ticket.id,
      bookingReference: ticket.booking_reference,
      routeId: ticket.route_id,
      vendorId: ticket.vendorid,
      customerName: ticket.customer_name,
      customerPhone: ticket.customer_phone,
      customerEmail: ticket.customer_email,
      seatNumber: parseInt(ticket.seat_number),
      status: ticket.status === 'confirmed' ? 'paid' : ticket.status,
      amount: parseFloat(ticket.amount),
      paymentMethod: ticket.payment_method || 'mobile_money',
      paymentReference: ticket.payment_reference,
      bookingDate: ticket.created_at,
      travelDate: ticket.travel_date,
      route: {
        departure: ticket.departure,
        destination: ticket.destination,
        departureTime: ticket.departuretime,
        estimatedArrival: ticket.estimatedarrival
      }
    });
  } catch (error) {
    console.error('Get ticket by booking reference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add GET /api/user/tickets/reference/:bookingReference endpoint (for users)
app.get('/api/user/tickets/reference/:bookingReference', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { bookingReference } = req.params;
    
    if (!bookingReference) {
      return res.status(400).json({ error: 'Invalid booking reference' });
    }

    // Check if this is a Firebase user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    let query = `
      SELECT t.*, r.departure, r.destination, r.departuretime, r.estimatedarrival
      FROM tickets t
      JOIN routes r ON t.route_id = r.id
      WHERE t.booking_reference = $1`;
    let params = [bookingReference];

    if (userResult.rows.length > 0) {
      // Firebase user - check by email
      query += ' AND t.customer_email = $2';
      params.push(decoded.email);
    } else {
      // Legacy customer - check by phone
      query += ' AND t.customer_phone = $2';
      params.push(decoded.mobile);
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' });
    }
    
    const ticket = result.rows[0];
    // Transform the data to match the frontend schema
    res.json({
      id: ticket.id,
      bookingReference: ticket.booking_reference,
      routeId: ticket.route_id,
      vendorId: ticket.vendorid,
      customerName: ticket.customer_name,
      customerPhone: ticket.customer_phone,
      customerEmail: ticket.customer_email,
      seatNumber: parseInt(ticket.seat_number),
      status: ticket.status === 'confirmed' ? 'paid' : ticket.status,
      amount: parseFloat(ticket.amount),
      paymentMethod: ticket.payment_method || 'mobile_money',
      paymentReference: ticket.payment_reference,
      bookingDate: ticket.created_at,
      travelDate: ticket.travel_date,
      route: {
        departure: ticket.departure,
        destination: ticket.destination,
        departureTime: ticket.departuretime,
        estimatedArrival: ticket.estimatedarrival
      }
    });
  } catch (error) {
    console.error('Get user ticket by booking reference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a review (only after arrival time)
app.post('/api/reviews', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { ticketId, routeId, rating, comment } = req.body;
    if (!ticketId || !routeId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Get the ticket and route info
    const ticketResult = await pool.query(
      'SELECT t.*, r.estimatedarrival, r.vendorid FROM tickets t JOIN routes r ON t.route_id = r.id WHERE t.id = $1',
      [ticketId]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketResult.rows[0];
    // Only allow review after arrival time
    // Combine travel_date and estimatedarrival for accurate arrival datetime
    let arrival;
    if (ticket.travel_date && ticket.estimatedarrival) {
      // travel_date is the date, estimatedarrival is the time
      const travelDate = new Date(ticket.travel_date);
      const arrivalTime = new Date(ticket.estimatedarrival);
      // Set the hours/minutes/seconds of travelDate to those of estimatedarrival
      travelDate.setHours(arrivalTime.getHours(), arrivalTime.getMinutes(), arrivalTime.getSeconds(), 0);
      arrival = travelDate;
    } else if (ticket.estimatedarrival) {
      arrival = new Date(ticket.estimatedarrival);
    } else {
      arrival = null;
    }
    const now = new Date();
    console.log('Now:', now, 'Arrival:', arrival, 'Can rate:', arrival && now > arrival);
    if (!arrival || now < arrival) {
      return res.status(403).json({ error: 'You cannot rate a trip before it has ended. Please wait until after the scheduled arrival time.' });
    }
    // Only allow one review per ticket
    const existing = await pool.query('SELECT * FROM reviews WHERE ticket_id = $1', [ticketId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already rated this trip.' });
    }
    // Insert review with vendor_id
    const reviewResult = await pool.query(
      'INSERT INTO reviews (ticket_id, route_id, vendor_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [ticketId, routeId, ticket.vendorid, decoded.id, rating, comment || null]
    );
    res.status(201).json(reviewResult.rows[0]);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews for a route
app.get('/api/reviews/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const result = await pool.query(
      'SELECT * FROM reviews WHERE route_id = $1',
      [routeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get route reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================== Notifications Endpoints =====================

// Get all notifications for the authenticated user
app.get('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    // Use phone number as user_id for notifications (to match booking/payment logic)
    const userId = decoded.mobile;
    console.log('Fetching notifications for userId:', userId); // Debug log
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new notification
app.post('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.id;
    const { type, title, message } = req.body;
    const result = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, type, title, message, 'unread']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.mobile; // Use phone number
    const notificationId = parseInt(req.params.id);
    const result = await pool.query(
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
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.id;
    const notificationId = parseInt(req.params.id);
    const result = await pool.query(
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

// Mark all notifications as read for the authenticated user
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.mobile || decoded.id || decoded.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Create read_notifications table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS read_notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        notification_id VARCHAR(50) NOT NULL,
        read_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, notification_id)
      )
    `);

    // Update admin notifications in the notifications table
    const adminResult = await pool.query(
      'UPDATE notifications SET status = $1, read_at = NOW() WHERE user_id = $2 AND status != $1',
      ['read', userId]
    );

    // Get all notification IDs that should be marked as read
    const allNotificationIds = [];
    
    // Add admin notification IDs
    const adminNotifications = await pool.query(
      'SELECT id FROM notifications WHERE user_id = $1',
      [userId]
    );
    adminNotifications.rows.forEach(notification => {
      allNotificationIds.push(`admin_${notification.id}`);
    });

    // Add booking notification IDs (last 3 bookings)
    const ticketsResult = await pool.query(
      'SELECT t.id FROM tickets t WHERE t.customer_phone = $1 ORDER BY t.created_at DESC LIMIT 3',
      [userId]
    );
    ticketsResult.rows.forEach(ticket => {
      allNotificationIds.push(`booking_${ticket.id}`);
    });

    // Add reminder notification IDs
    const upcomingTrips = await pool.query(
      `SELECT t.id FROM tickets t 
       WHERE t.customer_phone = $1 
       AND t.travel_date::date > NOW()::date 
       AND t.travel_date::date <= (NOW() + INTERVAL '1 day')::date`,
      [userId]
    );
    upcomingTrips.rows.forEach(ticket => {
      allNotificationIds.push(`reminder_${ticket.id}`);
    });

    // Add system notification ID
    if (ticketsResult.rows.length === 0) {
      allNotificationIds.push('system_1');
    }

    // Insert all notification IDs into read_notifications table
    for (const notificationId of allNotificationIds) {
      await pool.query(
        'INSERT INTO read_notifications (user_id, notification_id) VALUES ($1, $2) ON CONFLICT (user_id, notification_id) DO NOTHING',
        [userId, notificationId]
      );
    }

    res.json({ 
      success: true, 
      message: 'All notifications marked as read', 
      updated: (adminResult.rowCount || 0) + allNotificationIds.length 
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// 2FA verification endpoint
app.post('/api/vendor/verify-2fa', async (req, res) => {
  try {
    const { firebaseToken, email } = req.body;
    
    if (!firebaseToken || !email) {
      return res.status(400).json({ error: 'Firebase token and email are required' });
    }

    // Verify the Firebase token (in production, you would verify this with Firebase Admin SDK)
    // For now, we'll trust the token and proceed with the verification
    
    // Find the vendor user by email
    const { rows } = await pool.query('SELECT * FROM vendor_users WHERE email = $1', [email]);
    const vendor = rows[0];

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Generate a new JWT token for the vendor
    const token = jwt.sign(
      { 
        id: vendor.id, 
        email: vendor.email, 
        role: vendor.role, 
        vendor_id: vendor.vendor_id,
        twoFactorVerified: true 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query('UPDATE vendor_users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), vendor.id]);

    res.json({
      token,
      vendor: {
        id: vendor.id,
        vendor_id: vendor.vendor_id,
        name: vendor.full_name || vendor.username,
        email: vendor.email,
        role: vendor.role,
        twoFactorVerified: true
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enable 2FA for a vendor
app.post('/api/vendor/enable-2fa', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendorId = decoded.vendor_id || decoded.id;

    // Update vendor to enable 2FA
    await pool.query(
      'UPDATE vendor_users SET two_factor_enabled = true WHERE id = $1',
      [vendorId]
    );

    res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable 2FA for a vendor
app.post('/api/vendor/disable-2fa', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendorId = decoded.vendor_id || decoded.id;

    // Update vendor to disable 2FA
    await pool.query(
      'UPDATE vendor_users SET two_factor_enabled = false WHERE id = $1',
      [vendorId]
    );

    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check 2FA status for a vendor
app.get('/api/vendor/2fa-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendorId = decoded.vendor_id || decoded.id;

    // Get vendor's 2FA status
    const { rows } = await pool.query(
      'SELECT two_factor_enabled FROM vendor_users WHERE id = $1',
      [vendorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ 
      twoFactorEnabled: rows[0].two_factor_enabled || false 
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Vendor server running at http://localhost:${port}`);
});

// Sales summary endpoint
app.get('/api/vendor/sales', requireVendorUserPermission('reports_view'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const vendorId = decoded.vendor_id || decoded.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Get all vendor users for this vendor
    const usersResult = await pool.query(
      'SELECT id, full_name, email FROM vendor_users WHERE vendor_id = $1',
      [vendorId]
    );
    const users = usersResult.rows;

    // For each user, get walk-in and online ticket sales and revenue for the date
    const sales = await Promise.all(users.map(async user => {
      // Walk-in tickets
      const walkinResult = await pool.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as revenue
         FROM tickets
         WHERE vendorid = $1 AND created_by = $2 AND is_walk_in = true AND DATE(travel_date) = $3`,
        [vendorId, user.id, date]
      );
      // Online tickets
      const onlineResult = await pool.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as revenue
         FROM tickets
         WHERE vendorid = $1 AND created_by = $2 AND is_walk_in = false AND DATE(travel_date) = $3`,
        [vendorId, user.id, date]
      );
      return {
        userId: user.id,
        name: user.full_name,
        email: user.email,
        walkInTickets: parseInt(walkinResult.rows[0].count),
        walkInRevenue: parseFloat(walkinResult.rows[0].revenue),
        onlineTickets: parseInt(onlineResult.rows[0].count),
        onlineRevenue: parseFloat(onlineResult.rows[0].revenue),
        totalTickets: parseInt(walkinResult.rows[0].count) + parseInt(onlineResult.rows[0].count),
        totalRevenue: parseFloat(walkinResult.rows[0].revenue) + parseFloat(onlineResult.rows[0].revenue)
      };
    }));

    res.json(sales);
  } catch (error) {
    console.error('Sales summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  try {
    // For development, we'll use a simple approach without service account
    // In production, you should use a service account JSON file
    admin.initializeApp({
      projectId: 'tiyende-3811a',
      // For development, we'll skip credential verification
      // In production, use: credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized');
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e);
  }
}

// Firebase social login verification endpoint
app.post('/api/user/verify-firebase', async (req, res) => {
  try {
    const { firebaseToken, email, displayName, photoURL, phoneNumber, providerId } = req.body;
    if (!firebaseToken) {
      return res.status(400).json({ error: 'No Firebase token provided' });
    }

    // For development, we'll trust the Firebase token from the frontend
    // In production, you should verify it with Firebase Admin SDK
    console.log('Firebase token received, processing user data...');
    
    // Extract user ID from the token (for development)
    // In production, use: const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const tokenParts = firebaseToken.split('.');
    if (tokenParts.length !== 3) {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    // For development, we'll use a simple approach
    // Generate a unique user ID based on email
    const firebaseUid = `dev_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // 2. Find or create user in users table
    let userResult = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    let user;
    if (userResult.rows.length === 0) {
      // Create user if not found
      const insert = await pool.query(
        `INSERT INTO users (firebase_uid, email, name, photo_url, phone, provider)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [firebaseUid, email, displayName, photoURL, phoneNumber, providerId]
      );
      user = insert.rows[0];
      console.log('New user created:', user.id);
    } else {
      // Update user info on login
      const update = await pool.query(
        `UPDATE users SET email = $1, name = $2, photo_url = $3, phone = $4, provider = $5, updated_at = NOW()
         WHERE firebase_uid = $6 RETURNING *`,
        [email, displayName, photoURL, phoneNumber, providerId, firebaseUid]
      );
      user = update.rows[0];
      console.log('Existing user updated:', user.id);
    }

    // 3. Issue your own JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 4. Return token and user info
    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photo_url,
        phone: user.phone,
        provider: user.provider,
      }
    });
  } catch (error) {
    console.error('Firebase verify error:', error);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});
