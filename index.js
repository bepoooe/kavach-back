// Render deployment entry point for Kavach Backend
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Kavach Backend Server...');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

// Check if the built server exists
const serverPath = path.join(__dirname, 'backend', 'dist', 'server.js');
if (!fs.existsSync(serverPath)) {
    console.error('❌ Backend server not found at:', serverPath);
    console.error('💡 Make sure the backend was built properly');
    process.exit(1);
}

// Change to backend directory and start the server
console.log('✅ Starting backend from:', serverPath);
process.chdir(path.join(__dirname, 'backend'));
require('./dist/server.js');
