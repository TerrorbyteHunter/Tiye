const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'tiyende',
  port: 5432,
});

async function addTestNotifications() {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      )
    `);

    // Add sample customer notifications
    const customerNotifications = [
      {
        user_id: '1',
        type: 'info',
        title: 'Welcome to our service',
        message: 'Thank you for choosing our platform',
        status: 'unread'
      },
      {
        user_id: '2',
        type: 'reminder',
        title: 'Payment reminder',
        message: 'Please complete your payment',
        status: 'read'
      },
      {
        user_id: '3',
        type: 'alert',
        title: 'System maintenance',
        message: 'Scheduled maintenance on Sunday',
        status: 'unread'
      },
      {
        user_id: '4',
        type: 'promo',
        title: 'Special offer',
        message: 'Get 20% off your next booking',
        status: 'unread'
      }
    ];

    for (const notification of customerNotifications) {
      await pool.query(
        'INSERT INTO customer_notifications (user_id, type, title, message, status) VALUES ($1, $2, $3, $4, $5)',
        [notification.user_id, notification.type, notification.title, notification.message, notification.status]
      );
    }

    // Add sample vendor notifications
    const vendorNotifications = [
      {
        user_id: '1',
        type: 'info',
        title: 'New booking request',
        message: 'You have a new booking request',
        status: 'unread'
      },
      {
        user_id: '2',
        type: 'reminder',
        title: 'Update your profile',
        message: 'Please update your vendor profile',
        status: 'read'
      },
      {
        user_id: '3',
        type: 'alert',
        title: 'Route changes',
        message: 'Some routes have been updated',
        status: 'unread'
      }
    ];

    for (const notification of vendorNotifications) {
      await pool.query(
        'INSERT INTO vendor_notifications (user_id, type, title, message, status) VALUES ($1, $2, $3, $4, $5)',
        [notification.user_id, notification.type, notification.title, notification.message, notification.status]
      );
    }

    console.log('Test notifications added successfully!');
    console.log('Customer notifications:', customerNotifications.length);
    console.log('Vendor notifications:', vendorNotifications.length);
  } catch (error) {
    console.error('Error adding test notifications:', error);
  } finally {
    await pool.end();
  }
}

addTestNotifications(); 