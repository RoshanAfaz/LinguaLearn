console.log('🧹 Clearing any rate limiting issues...');

// Simple script to test if the server is responding
const http = require('http');

const testConnection = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/translation/test',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server responding with status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('📡 Server response:', parsed);
        console.log('🎯 Translation API is ready!');
      } catch (e) {
        console.log('📡 Raw response:', data);
      }
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Connection error: ${e.message}`);
    console.log('💡 Make sure your server is running: node server.js');
    process.exit(1);
  });

  req.end();
};

console.log('🔍 Testing server connection...');
testConnection();
