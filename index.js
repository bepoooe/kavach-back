// Render deployment entry point for Kavach Backend
require('dotenv').config({ path: './backend/.env' });
require('./backend/dist/server.js');
