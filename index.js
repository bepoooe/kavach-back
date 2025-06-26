// Render deployment entry point for Kavach Backend
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Kavach Backend Server...');
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Load environment variables from multiple possible locations
const envPaths = [
    path.join(__dirname, 'backend', '.env'),
    path.join(__dirname, '.env'),
    path.join(process.cwd(), 'backend', '.env'),
    path.join(process.cwd(), '.env')
];

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        console.log('📄 Loading environment from:', envPath);
        require('dotenv').config({ path: envPath });
        break;
    }
}

// Try multiple possible server locations
const possibleServerPaths = [
    path.join(__dirname, 'backend', 'dist', 'server.js'),
    path.join(process.cwd(), 'backend', 'dist', 'server.js'),
    path.join(__dirname, 'dist', 'server.js'),
    path.join(process.cwd(), 'dist', 'server.js')
];

let serverPath = null;
let serverDir = null;

for (const possiblePath of possibleServerPaths) {
    console.log('🔍 Checking for server at:', possiblePath);
    if (fs.existsSync(possiblePath)) {
        serverPath = possiblePath;
        serverDir = path.dirname(possiblePath);
        console.log('✅ Found server at:', serverPath);
        break;
    }
}

if (!serverPath) {
    console.error('❌ Backend server not found in any of these locations:');
    possibleServerPaths.forEach(p => console.error('   -', p));
    console.error('💡 Make sure the backend was built properly with "npm run build"');
    
    // List contents of directories to help debug
    console.error('📂 Contents of current directory:');
    try {
        fs.readdirSync(process.cwd()).forEach(file => console.error('   -', file));
    } catch (e) {
        console.error('   Error reading directory:', e.message);
    }
    
    const backendDir = path.join(process.cwd(), 'backend');
    if (fs.existsSync(backendDir)) {
        console.error('📂 Contents of backend directory:');
        try {
            fs.readdirSync(backendDir).forEach(file => console.error('   -', file));
        } catch (e) {
            console.error('   Error reading backend directory:', e.message);
        }
    }
    
    process.exit(1);
}

// Set working directory to server directory for proper relative imports
console.log('📁 Changing working directory to:', path.dirname(serverDir));
process.chdir(path.dirname(serverDir));

console.log('✅ Starting backend from:', serverPath);
require(serverPath);
