import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import winston from 'winston';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// Log the loaded database URL
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL);

// If you use Firebase Admin, log its initialization (optional)
try {
  // Uncomment and configure if you use Firebase Admin
  // import admin from 'firebase-admin';
  // admin.initializeApp();
  console.log('Firebase Admin initialized');
} catch (e) {
  // Ignore if not using Firebase
}

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message } = info;
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'server.log' }),
    new winston.transports.Console()
  ]
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const app = express();

app.use(cors({
  origin: [
    'http://localhost:6173',
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811a.firebaseapp.com',
    'https://tiye.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint hit');
  res.json({ status: 'ok' });
});

// Sync Firebase Auth user to admins table
app.post('/api/user/sync', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      logger.warn('Missing uid or email in /api/user/sync');
      return res.status(400).json({ error: 'Missing uid or email' });
    }
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM admins WHERE firebase_uid = $1', [uid]);
    if (userResult.rows.length === 0) {
      // Insert new user
      await pool.query(
        'INSERT INTO admins (firebase_uid, email, full_name, active, role) VALUES ($1, $2, $3, $4, $5)',
        [uid, email, displayName || '', true, 'staff']
      );
      logger.info(`Created new admin user for Firebase UID: ${uid}`);
    } else {
      logger.info(`Admin user already exists for Firebase UID: ${uid}`);
    }
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`User sync error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// User login endpoint
app.post('/api/user/login', async (req, res) => {
  try {
    const { mobile, username, password } = req.body;
    if (!mobile || !username || !password) {
      logger.warn('Missing mobile, username, or password in /api/user/login');
      return res.status(400).json({ error: 'Mobile, username, and password are required' });
    }
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE mobile = $1 AND username = $2', [mobile, username]);
    if (userResult.rows.length === 0) {
      logger.warn(`Login failed for mobile: ${mobile}, username: ${username}`);
      return res.status(401).json({ error: 'Invalid mobile or username' });
    }
    const user = userResult.rows[0];
    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logger.warn(`Invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid password' });
    }
    // Generate a simple token (for demo purposes only)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    logger.info(`User login successful for mobile: ${mobile}, username: ${username}`);
    res.json({ token, user });
  } catch (err: any) {
    logger.error(`User login error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// User signup endpoint
app.post('/api/user/signup', async (req, res) => {
  try {
    const { username, mobile, password } = req.body;
    if (!username || !mobile || !password) {
      logger.warn('Missing username, mobile, or password in /api/user/signup');
      return res.status(400).json({ error: 'Username, mobile, and password are required' });
    }
    // Check if username already exists
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      logger.warn(`Signup failed: Username already exists: ${username}`);
      return res.status(409).json({ error: 'Username already exists' });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user (add dummy firebase_uid if required)
    const insert = await pool.query(
      'INSERT INTO users (firebase_uid, username, mobile, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [`${username}-firebase`, username, mobile, password_hash]
    );
    const user = insert.rows[0];
    // Generate a simple token (for demo purposes only)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    logger.info(`User signup successful for username: ${username}`);
    res.json({ token, user });
  } catch (err: any) {
    logger.error(`User signup error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to signup' });
  }
});

// Middleware to extract user from token (for demo purposes)
function getUserIdFromToken(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    // Our demo token is base64 of "userId:timestamp"
    const token = auth.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const userId = decoded.split(':')[0];
    return userId;
  } catch {
    return null;
  }
}

// GET /api/user/me
app.get('/api/user/me', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Get user profile error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// PATCH /api/user/me
app.patch('/api/user/me', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { username, mobile, password } = req.body;
    // Only update provided fields
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (username) { fields.push(`username = $${idx++}`); values.push(username); }
    if (mobile) { fields.push(`mobile = $${idx++}`); values.push(mobile); }
    if (password) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${idx++}`); values.push(hash);
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(sql, values);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Update user profile error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/user/routes (optionally filter by vendor)
app.get('/api/user/routes', async (req, res) => {
  try {
    const { vendor } = req.query;
    let result;
    if (vendor) {
      result = await pool.query(`
        SELECT routes.*, vendors.name AS vendorname,
               routes.departuretime AS "departureTime",
               routes.estimatedarrival AS "estimatedArrival"
        FROM routes
        JOIN vendors ON routes.vendorid = vendors.id
        WHERE routes.vendorid = $1
      `, [vendor]);
    } else {
      result = await pool.query(`
        SELECT routes.*, vendors.name AS vendorname,
               routes.departuretime AS "departureTime",
               routes.estimatedarrival AS "estimatedArrival"
        FROM routes
        JOIN vendors ON routes.vendorid = vendors.id
      `);
    }
    console.log('ROUTES SENT:', result.rows); // Log the routes being sent
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Get routes error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get routes' });
  }
});

// GET /api/user/routes/:id
app.get('/api/user/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Get route by id error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get route' });
  }
});

// GET /api/user/routes/:routeId/seats?travelDate=...
app.get('/api/user/routes/:routeId/seats', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { travelDate } = req.query;
    // Get all booked seat numbers for this route and date
    const bookedResult = await pool.query(
      'SELECT seat_number FROM tickets WHERE route_id = $1 AND travel_date = $2',
      [routeId, travelDate]
    );
    const bookedSeats = new Set(bookedResult.rows.map((row: any) => row.seat_number));
    // Build seat array
    const seats = Array.from({ length: 50 }, (_, i) => ({
      number: i + 1,
      status: bookedSeats.has(i + 1) ? 'booked' : 'available',
    }));
    res.json({ routeId, travelDate, seats });
  } catch (err: any) {
    logger.error(`Get seats error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get seats' });
  }
});

// POST /api/tickets (create ticket)
app.post('/api/tickets', async (req, res) => {
  try {
    let { userId, routeId, seatNumber, travelDate, customerName, customerPhone, amount, status, bookingReference, customerEmail } = req.body;
    // Generate bookingReference if not provided
    if (!bookingReference) {
      bookingReference = `TKT${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }
    // Look up vendorid from the route
    const routeResult = await pool.query('SELECT vendorid FROM routes WHERE id = $1', [routeId]);
    if (routeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid routeId' });
    }
    const vendorId = routeResult.rows[0].vendorid;
    // Insert ticket with all required fields (excluding bookingDate)
    const result = await pool.query(
      `INSERT INTO tickets (
        user_id, route_id, seat_number, travel_date, vendorid, customer_name, customer_phone, amount, status, booking_reference, customer_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId,
        routeId,
        seatNumber,
        travelDate,
        vendorId,
        customerName,
        customerPhone,
        amount,
        status,
        bookingReference,
        customerEmail || null
      ]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Create ticket error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /api/user/tickets (get tickets for current user)
app.get('/api/user/tickets', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query(`
      SELECT tickets.*, 
             routes.departure AS route_departure,
             routes.destination AS route_destination,
             routes.departuretime AS route_departuretime,
             routes.estimatedarrival AS route_estimatedarrival
      FROM tickets
      JOIN routes ON tickets.route_id = routes.id
      WHERE tickets.user_id = $1
    `, [userId]);
    const tickets = result.rows.map((row: any) => ({
      ...row,
      seatNumber: row.seat_number,
      travelDate: row.travel_date,
      bookingReference: row.booking_reference,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      vendorId: row.vendorid,
      routeId: row.route_id,
      createdAt: row.created_at,
      // Remove snake_case fields to avoid confusion
      seat_number: undefined,
      travel_date: undefined,
      booking_reference: undefined,
      customer_name: undefined,
      customer_phone: undefined,
      customer_email: undefined,
      vendorid: undefined,
      route_id: undefined,
      created_at: undefined,
      // Route mapping remains
      route: {
        departure: row.route_departure,
        destination: row.route_destination,
        departureTime: row.route_departuretime,
        estimatedArrival: row.route_estimatedarrival,
      }
    }));
    res.json(tickets);
  } catch (err: any) {
    logger.error(`Get user tickets error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// GET /api/tickets/:id (get ticket by ID)
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Get ticket by id error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// GET /api/user/tickets/reference/:bookingReference
app.get('/api/user/tickets/reference/:bookingReference', async (req, res) => {
  try {
    const { bookingReference } = req.params;
    const result = await pool.query(`
      SELECT tickets.*, 
             routes.departure AS route_departure,
             routes.destination AS route_destination,
             routes.departuretime AS route_departuretime,
             routes.estimatedarrival AS route_estimatedarrival
      FROM tickets
      JOIN routes ON tickets.route_id = routes.id
      WHERE tickets.booking_reference = $1
    `, [bookingReference]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const row = result.rows[0];
    const ticket = {
      ...row,
      seatNumber: row.seat_number,
      travelDate: row.travel_date,
      bookingReference: row.booking_reference,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      vendorId: row.vendorid,
      routeId: row.route_id,
      createdAt: row.created_at,
      seat_number: undefined,
      travel_date: undefined,
      booking_reference: undefined,
      customer_name: undefined,
      customer_phone: undefined,
      customer_email: undefined,
      vendorid: undefined,
      route_id: undefined,
      created_at: undefined,
      route: {
        departure: row.route_departure,
        destination: row.route_destination,
        departureTime: row.route_departuretime,
        estimatedArrival: row.route_estimatedarrival,
      }
    };
    res.json(ticket);
  } catch (err: any) {
    logger.error(`Get ticket by reference error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// GET /api/user/notifications
app.get('/api/user/notifications', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    // For demo: fetch notifications for user (customize as needed for your schema)
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err: any) {
    logger.error(`Get notifications error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// PATCH /api/user/notifications/:id/read
app.patch('/api/user/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Mark notification as read error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// DELETE /api/notifications/:id
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Delete notification error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// PATCH /api/notifications/read-all
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Mark all notifications as read error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// PATCH /api/tickets/:id/status (update ticket status)
app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const ticketId = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    // Only allow update if ticket belongs to user
    const result = await pool.query('UPDATE tickets SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [status, ticketId, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found or not owned by user' });
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Update ticket status error: ${err.stack || err}`);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Error handler (should be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.stack || err}`);
  res.status(500).json({ error: 'Internal server error' });
});

app.options('*', cors({
  origin: [
    'http://localhost:6173',
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811a.firebaseapp.com',
    'https://tiye.onrender.com'
  ],
  credentials: true
}), (req, res) => {
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`User backend running on port ${PORT}`);
}); 