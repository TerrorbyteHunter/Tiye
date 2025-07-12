import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
config({ path: rootEnvPath });

// Load app-specific environment variables
const appEnvPath = path.resolve(process.cwd(), '.env');
config({ path: appEnvPath });

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // API
  API_URL: process.env.API_URL || 'http://localhost:3002',
  API_PORT: process.env.API_PORT || '3002',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // App-specific
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3002',
} as const;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'] as const;
for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 