#!/usr/bin/env node

/**
 * Initialize Sample Data Script
 * Run this to reset and create sample data
 * Usage: node scripts/init-data.js
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔄 Initializing sample data...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log('✅ Success!');
        console.log('📦 Sample data has been created:\n');
        console.log('   👤 Admin user: admin / admin123');
        console.log('   👤 Operator user: operator / operator123');
        console.log('   🏥 3 Partners created');
        console.log('   📦 12 Products with QR codes created\n');
        console.log('🌐 You can now login at http://localhost:3000');
      } else {
        console.log('❌ Error:', result.message);
      }
    } catch (err) {
      console.error('❌ Failed to parse response:', err.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to server:', error.message);
  console.log('\n💡 Make sure the dev server is running:');
  console.log('   npm run dev');
});

req.end();
