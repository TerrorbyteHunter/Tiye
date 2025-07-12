const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testDashboard() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test dashboard endpoint
    console.log('\n📊 Testing dashboard endpoint...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard endpoint accessible');
    console.log('📈 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    
    // Test routes endpoint
    console.log('\n🚌 Testing routes endpoint...');
    const routesResponse = await axios.get(`${BASE_URL}/routes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Routes endpoint accessible');
    console.log(`📊 Found ${routesResponse.data.length} routes`);
    routesResponse.data.forEach((route, index) => {
      console.log(`${index + 1}. ID: ${route.id}, From: ${route.departure}, To: ${route.destination}, Status: ${route.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard(); 