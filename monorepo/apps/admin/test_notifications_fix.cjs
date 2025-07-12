const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tiyende_db',
  user: 'postgres',
  password: 'postgres'
});

async function testNotifications() {
  try {
    console.log('Testing notifications system...');
    
    // Test 1: Check if vendors table exists and has data
    console.log('\n1. Checking vendors table...');
    const vendorsResult = await pool.query('SELECT id, name, phone FROM vendors LIMIT 5');
    console.log('Vendors found:', vendorsResult.rows);
    
    // Test 2: Check if notification tables exist
    console.log('\n2. Checking notification tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('vendor_notifications', 'customer_notifications')
    `);
    console.log('Notification tables:', tablesResult.rows);
    
    // Test 3: Create a test notification
    console.log('\n3. Creating test notification...');
    if (vendorsResult.rows.length > 0) {
      const vendorId = vendorsResult.rows[0].id;
      const insertResult = await pool.query(`
        INSERT INTO vendor_notifications (user_id, type, title, message, status) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `, [vendorId, 'test', 'Test Notification', 'This is a test notification', 'unread']);
      console.log('Created notification:', insertResult.rows[0]);
      
      // Test 4: Query the notification with vendor details
      console.log('\n4. Querying notification with vendor details...');
      const queryResult = await pool.query(`
        SELECT 
          n.*,
          v.name as vendor_name,
          v.phone as vendor_phone,
          v.email as vendor_email
        FROM vendor_notifications n
        LEFT JOIN vendors v ON n.user_id = v.id::text
        WHERE n.id = $1
      `, [insertResult.rows[0].id]);
      console.log('Notification with vendor details:', queryResult.rows[0]);
    }
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testNotifications(); 