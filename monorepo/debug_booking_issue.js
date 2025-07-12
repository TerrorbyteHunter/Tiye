// Debug script to test booking and notification issues
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function debugBookingIssue() {
  console.log('🔍 Debugging booking and notification issues...\n');

  try {
    // 1. Test user login
    console.log('1. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, {
      mobile: '260977123456',
      name: 'Test User'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('User data:', loginResponse.data.user);
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Test getting user tickets
    console.log('2. Testing user tickets endpoint...');
    const ticketsResponse = await axios.get(`${API_BASE_URL}/user/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Tickets endpoint working');
    console.log('Tickets found:', ticketsResponse.data.length);
    console.log('Sample ticket:', ticketsResponse.data[0] || 'No tickets found');
    console.log('');

    // 3. Test notifications endpoint
    console.log('3. Testing notifications endpoint...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/user/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Notifications endpoint working');
    console.log('Notifications found:', notificationsResponse.data.length);
    console.log('Sample notification:', notificationsResponse.data[0] || 'No notifications found');
    console.log('');

    // 4. Test user profile endpoint
    console.log('4. Testing user profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE_URL}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User profile endpoint working');
    console.log('User profile:', profileResponse.data);
    console.log('');

    // 5. Test creating a mock booking (if we have a route)
    console.log('5. Testing route availability...');
    try {
      const routesResponse = await axios.get(`${API_BASE_URL}/user/routes`);
      console.log('✅ Routes endpoint working');
      console.log('Available routes:', routesResponse.data.length);
      
      if (routesResponse.data.length > 0) {
        const firstRoute = routesResponse.data[0];
        console.log('First route:', {
          id: firstRoute.id,
          departure: firstRoute.departure,
          destination: firstRoute.destination,
          fare: firstRoute.fare
        });
        
        // Test seat availability
        console.log('\n6. Testing seat availability...');
        const seatsResponse = await axios.get(`${API_BASE_URL}/user/routes/${firstRoute.id}/seats`);
        console.log('✅ Seats endpoint working');
        console.log('Available seats:', seatsResponse.data.length);
      }
    } catch (error) {
      console.log('❌ Routes endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n📊 Summary:');
    console.log('✅ User authentication: Working');
    console.log('✅ Tickets endpoint: Working');
    console.log('✅ Notifications endpoint: Working');
    console.log('✅ User profile: Working');
    
    if (ticketsResponse.data.length === 0) {
      console.log('⚠️  No tickets found for user');
      console.log('💡 This could be because:');
      console.log('   - User has not made any bookings yet');
      console.log('   - User authentication mismatch');
      console.log('   - Database connection issues');
    }
    
    if (notificationsResponse.data.length === 0) {
      console.log('⚠️  No notifications found for user');
      console.log('💡 This could be because:');
      console.log('   - No notifications have been created');
      console.log('   - User ID mismatch in notifications table');
      console.log('   - Notifications table not properly set up');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the debug
debugBookingIssue().catch(console.error); 