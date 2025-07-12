import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  PORT: process.env.PORT || '3002',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Add other environment variables as needed
};

export * from './drizzle.config';
export * from './tailwind.config'; 