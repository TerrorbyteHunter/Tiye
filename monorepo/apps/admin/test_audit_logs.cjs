const http = require('http');

// Test function
function testEndpoint(path, description) {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`${description} - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 403) {
        console.log(`${description} - Authentication required (expected)`);
      } else if (res.statusCode === 500) {
        console.log(`${description} - Server error: ${data}`);
      } else {
        try {
          const jsonData = JSON.parse(data);
          console.log(`${description} - Response:`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(`${description} - Raw response:`, data);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`${description} - Error: ${e.message}`);
  });

  req.end();
}

// Test both endpoints
console.log('Testing audit logs endpoints...\n');

testEndpoint('/api/audit-logs?limit=5&offset=0', 'Audit Logs List');
testEndpoint('/api/audit-logs/count', 'Audit Logs Count'); 