import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkVendors() {
  console.log('Checking database connection and vendors...');

  try {
    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful!');

    // List all vendors
    const vendorsResult = await pool.query(
      'SELECT id, name, "contactPerson", email, phone, status, "createdAt" FROM vendor'
    );
    const vendors = vendorsResult.rows;

    console.log('\nExisting vendors:', vendors);

    // If no vendors exist, create a test vendor
    if (vendors.length === 0) {
      console.log('\nNo vendors found. Creating a test vendor...');
      const newVendorResult = await pool.query(
        `INSERT INTO vendor (
           name, "contactPerson", email, phone, address, status
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email`,
        [
          'Test Bus Company',
          'John Doe',
          'test@example.com',
          '+1234567890',
          '123 Test Street',
          'active'
        ]
      );
      console.log('✅ Test vendor created:', newVendorResult.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkVendors(); 