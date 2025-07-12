import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import pg from 'pg';
const { types } = pg;
types.setTypeParser(1114, (str: string) => str);

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811admin.web.app',
    'https://tiyende-3811vendor.web.app',
    'https://tiyende-3811a.firebaseapp.com' // Added for Firebase Hosting frontend
  ], // Allow local dev and all deployed Firebase Hosting domains
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Register routes
registerRoutes(app).then(server => {
  const port = 3002; // Explicitly set to 3002 to avoid conflicts
  server.listen(port, () => {
    console.log(`Admin server is running on port ${port}`);
    console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});