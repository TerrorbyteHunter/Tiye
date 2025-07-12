const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAnalytics() {
  try {
    console.log('Testing Analytics Endpoints...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@tiyende.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Login successful\n');

    // Test revenue endpoint
    console.log('2. Testing revenue endpoint...');
    const revenueResponse = await axios.get(`${BASE_URL}/analytics/dashboard/revenue?period=30`, { headers });
    console.log('✅ Revenue data:', revenueResponse.data);
    console.log('');

    // Test vendors endpoint
    console.log('3. Testing vendors endpoint...');
    const vendorsResponse = await axios.get(`${BASE_URL}/analytics/dashboard/vendors?period=30`, { headers });
    console.log('✅ Vendors data:', vendorsResponse.data);
    console.log('');

    // Test bookings endpoint
    console.log('4. Testing bookings endpoint...');
    const bookingsResponse = await axios.get(`${BASE_URL}/analytics/dashboard/bookings?period=30`, { headers });
    console.log('✅ Bookings data:', bookingsResponse.data);
    console.log('');

    // Test routes endpoint
    console.log('5. Testing routes endpoint...');
    const routesResponse = await axios.get(`${BASE_URL}/analytics/dashboard/routes?period=30`, { headers });
    console.log('✅ Routes data:', routesResponse.data);
    console.log('');

    console.log('🎉 All analytics endpoints are working!');

  } catch (error) {
    console.error('❌ Error testing analytics:', error.response?.data || error.message);
  }
}

testAnalytics(); 