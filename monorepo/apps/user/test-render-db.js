#!/usr/bin/env node

/**
 * Render Database Connection Test
 * Tests connection to the specific Render PostgreSQL database
 */

import { Pool } from 'pg';

// Your Render database URL
const DATABASE_URL = 'postgresql://tiyende_db_user:XpUre7CB6HaQWScz3dQ2qzUCoWDJ3LyB@dpg-d1q3hbjuibrs73eal4gg-a.oregon-postgres.render.com/tiyende_db';

console.log('🔍 Testing Render Database Connection');
console.log('====================================\n');

console.log('✅ Database URL configured');
console.log('📡 Host: dpg-d1q3hbjuibrs73eal4gg-a.oregon-postgres.render.com');
console.log('🗄️  Database: tiyende_db');
console.log('👤 User: tiyende_db_user');

// Create connection pool with SSL for Render
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testRenderConnection() {
  try {
    console.log('\n🔄 Testing connection to Render database...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`✅ Query test successful`);
    console.log(`⏰ Current time: ${result.rows[0].current_time}`);
    console.log(`📊 Database: ${result.rows[0].db_version.split(' ')[0]}`);
    
    // Test if required tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'routes', 'vendors', 'admins', 'customer_notifications', 'vendor_notifications')
    `);
    
    console.log('\n📊 Database Tables Check:');
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['users', 'routes', 'vendors', 'admins', 'customer_notifications', 'vendor_notifications'];
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ ${table} table exists`);
      } else {
        console.log(`❌ ${table} table missing`);
      }
    });
    
    // Test table access and record counts
    console.log('\n📈 Table Record Counts:');
    
    const tableTests = [
      { name: 'users', query: 'SELECT COUNT(*) as count FROM users' },
      { name: 'routes', query: 'SELECT COUNT(*) as count FROM routes' },
      { name: 'vendors', query: 'SELECT COUNT(*) as count FROM vendors' },
      { name: 'admins', query: 'SELECT COUNT(*) as count FROM admins' },
      { name: 'customer_notifications', query: 'SELECT COUNT(*) as count FROM customer_notifications' },
      { name: 'vendor_notifications', query: 'SELECT COUNT(*) as count FROM vendor_notifications' }
    ];
    
    for (const tableTest of tableTests) {
      try {
        const countResult = await client.query(tableTest.query);
        console.log(`✅ ${tableTest.name}: ${countResult.rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${tableTest.name}: ${error.message}`);
      }
    }
    
    // Test sample data queries
    console.log('\n🔍 Sample Data Check:');
    
    try {
      const sampleRoutes = await client.query('SELECT id, departure, destination, fare FROM routes LIMIT 3');
      console.log(`✅ Sample routes found: ${sampleRoutes.rows.length} routes`);
      sampleRoutes.rows.forEach(route => {
        console.log(`   - ${route.departure} → ${route.destination} ($${route.fare})`);
      });
    } catch (error) {
      console.log('❌ Could not fetch sample routes');
    }
    
    try {
      const sampleVendors = await client.query('SELECT id, name, email FROM vendors LIMIT 3');
      console.log(`✅ Sample vendors found: ${sampleVendors.rows.length} vendors`);
      sampleVendors.rows.forEach(vendor => {
        console.log(`   - ${vendor.name} (${vendor.email})`);
      });
    } catch (error) {
      console.log('❌ Could not fetch sample vendors');
    }
    
    client.release();
    
    console.log('\n🎉 Render database connection test completed successfully!');
    console.log('✅ Your backend is ready to connect to the Render database');
    console.log('✅ Environment variable DATABASE_URL should be set to:');
    console.log('   postgresql://tiyende_db_user:XpUre7CB6HaQWScz3dQ2qzUCoWDJ3LyB@dpg-d1q3hbjuibrs73eal4gg-a.oregon-postgres.render.com/tiyende_db');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if the database host is accessible');
      console.log('2. Verify the database is running on Render');
      console.log('3. Check if the database credentials are correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - check if database is active on Render');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication failed - check username and password');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testRenderConnection(); 