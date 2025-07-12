const axios = require('axios');

const BASE_URL = 'http://localhost:5173/api'; // Frontend dev server with proxy

async function testTickets() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test tickets endpoint through proxy
    console.log('\n🎫 Testing tickets endpoint through proxy...');
    const ticketsResponse = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Frontend tickets endpoint accessible');
    console.log(`📊 Found ${ticketsResponse.data.length} tickets`);
    ticketsResponse.data.forEach((ticket, index) => {
      console.log(`${index + 1}. ID: ${ticket.id}, Customer: ${ticket.customerName || 'Unknown'}, Status: ${ticket.status}, Amount: ${ticket.amount || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTickets(); 