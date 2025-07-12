const axios = require('axios');

const BASE_URL = 'http://localhost:5173/api'; // Frontend dev server with proxy

async function testFrontendAPI() {
  try {
    // First login to get token
    console.log('🔐 Testing frontend login through proxy...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Frontend login successful');
    
    // Test dashboard endpoint through proxy
    console.log('\n📊 Testing dashboard endpoint through proxy...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Frontend dashboard endpoint accessible');
    console.log('📈 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    
    // Test vendors endpoint through proxy
    console.log('\n🏢 Testing vendors endpoint through proxy...');
    const vendorsResponse = await axios.get(`${BASE_URL}/vendors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Frontend vendors endpoint accessible');
    console.log(`📊 Found ${vendorsResponse.data.length} vendors`);
    vendorsResponse.data.forEach((vendor, index) => {
      console.log(`${index + 1}. ID: ${vendor.id}, Name: ${vendor.name}, Email: ${vendor.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendAPI(); 