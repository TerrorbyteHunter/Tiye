const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAdminAPI() {
  try {
    console.log('Testing admin API...');
    
    // Test if server is running
    try {
      const response = await makeRequest('http://localhost:3002/api/test');
      console.log('✅ Server is running');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Server not accessible:', error.message);
      return;
    }
    
    // Try to login
    console.log('\nAttempting to login...');
    try {
      const loginResponse = await makeRequest('http://localhost:3002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Test vendors endpoint with token
        console.log('\nTesting vendors endpoint...');
        const vendorsResponse = await makeRequest('http://localhost:3002/api/vendors', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (vendorsResponse.status === 200) {
          console.log('✅ Vendors endpoint accessible');
          console.log(`Found ${vendorsResponse.data.length} vendors:`);
          
          if (vendorsResponse.data.length === 0) {
            console.log('❌ No vendors found in the API response');
          } else {
            vendorsResponse.data.forEach((vendor, index) => {
              console.log(`${index + 1}. ID: ${vendor.id}, Name: ${vendor.name}, Email: ${vendor.email}`);
            });
          }
        } else {
          console.log('❌ Vendors endpoint failed:', vendorsResponse.status, vendorsResponse.data);
        }
      } else {
        console.log('❌ Login failed:', loginResponse.status, loginResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Login error:', error.message);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAdminAPI(); 