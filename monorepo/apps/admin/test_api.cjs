const fetch = require('node-fetch');

async function testNotifications() {
  try {
    // Test creating notifications via API
    const notifications = [
      {
        type: 'info',
        title: 'Welcome to our service',
        message: 'Thank you for choosing our platform',
        recipient_type: 'customer',
        broadcast: true
      },
      {
        type: 'reminder',
        title: 'Payment reminder',
        message: 'Please complete your payment',
        recipient_type: 'customer',
        broadcast: true
      },
      {
        type: 'alert',
        title: 'System maintenance',
        message: 'Scheduled maintenance on Sunday',
        recipient_type: 'customer',
        broadcast: true
      },
      {
        type: 'promo',
        title: 'Special offer',
        message: 'Get 20% off your next booking',
        recipient_type: 'customer',
        broadcast: true
      },
      {
        type: 'info',
        title: 'New booking request',
        message: 'You have a new booking request',
        recipient_type: 'vendor',
        broadcast: true
      },
      {
        type: 'reminder',
        title: 'Update your profile',
        message: 'Please update your vendor profile',
        recipient_type: 'vendor',
        broadcast: true
      }
    ];

    for (const notification of notifications) {
      const response = await fetch('http://localhost:3002/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJzdXBlcmFkbWluIiwicm9sZSI6ImFkbWluIiwic2Vzc2lvbklkIjoiNW5pM2l0bHl0dnJwanlueTRmZHM2IiwiaWF0IjoxNzUxNjgzMjIzLCJleHAiOjE3NTE3Njk2MjN9.VxEHDq5TKIq4MHjF3dXpJ0J-P5IW7jWC-IuswNygFNM'
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Created ${notification.recipient_type} notification:`, result);
      } else {
        console.error(`Failed to create ${notification.recipient_type} notification:`, response.status, response.statusText);
      }
    }

    // Test filtering
    console.log('\nTesting filters...');
    
    const filterTests = [
      { recipient_type: 'customer', status: 'unread' },
      { recipient_type: 'customer', type: 'info' },
      { recipient_type: 'customer', search: 'welcome' },
      { recipient_type: 'vendor', status: 'read' },
      { recipient_type: 'vendor', type: 'reminder' }
    ];

    for (const test of filterTests) {
      const params = new URLSearchParams(test);
      const response = await fetch(`http://localhost:3002/api/notifications/history?${params}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJzdXBlcmFkbWluIiwicm9sZSI6ImFkbWluIiwic2Vzc2lvbklkIjoiNW5pM2l0bHl0dnJwanlueTRmZHM2IiwiaWF0IjoxNzUxNjgzMjIzLCJleHAiOjE3NTE3Njk2MjN9.VxEHDq5TKIq4MHjF3dXpJ0J-P5IW7jWC-IuswNygFNM'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Filter test ${JSON.stringify(test)}:`, result.notifications.length, 'notifications');
      } else {
        console.error(`Filter test failed ${JSON.stringify(test)}:`, response.status, response.statusText);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNotifications(); 