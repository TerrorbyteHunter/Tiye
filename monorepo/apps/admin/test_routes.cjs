const axios = require('axios');

const BASE_URL = 'http://localhost:5173/api'; // Frontend dev server with proxy

async function testRoutes() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test routes endpoint through proxy
    console.log('\n🚌 Testing routes endpoint through proxy...');
    const routesResponse = await axios.get(`${BASE_URL}/routes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Frontend routes endpoint accessible');
    console.log(`📊 Found ${routesResponse.data.length} routes`);
    routesResponse.data.forEach((route, index) => {
      console.log(`${index + 1}. ID: ${route.id}, From: ${route.departure}, To: ${route.destination}, Status: ${route.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRoutes(); 