#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the database connection using the DATABASE_URL environment variable
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Database Connection for Render Deployment');
console.log('==================================================\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please set the DATABASE_URL environment variable with your Render database connection string');
  process.exit(1);
}

console.log('✅ DATABASE_URL is configured');
console.log(`📡 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('\n🔄 Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query test successful: ${result.rows[0].current_time}`);
    
    // Test if required tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'routes', 'vendors')
    `);
    
    console.log('\n📊 Database Tables Check:');
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['users', 'routes', 'vendors'];
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ ${table} table exists`);
      } else {
        console.log(`❌ ${table} table missing`);
      }
    });
    
    // Test users table structure
    try {
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ users table accessible: ${usersResult.rows[0].count} records`);
    } catch (error) {
      console.log('❌ users table not accessible or missing');
    }
    
    // Test routes table structure
    try {
      const routesResult = await client.query('SELECT COUNT(*) as count FROM routes');
      console.log(`✅ routes table accessible: ${routesResult.rows[0].count} records`);
    } catch (error) {
      console.log('❌ routes table not accessible or missing');
    }
    
    client.release();
    
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('Your backend is ready to connect to the Render database.');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if the DATABASE_URL is correct');
      console.log('2. Verify the database host is accessible');
      console.log('3. Ensure the database credentials are correct');
      console.log('4. Check if the database is running on Render');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection(); 