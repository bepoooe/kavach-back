// Alternative start script for Render if index.js fails
const path = require('path');
const fs = require('fs');

console.log('🚀 Alternative Kavach Backend Startup...');
console.log('📁 Process CWD:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Load environment variables
try {
    require('dotenv').config();
    console.log('✅ Environment variables loaded');
} catch (e) {
    console.log('⚠️ Could not load .env file:', e.message);
}

// Try to find and start the backend server directly
const backendPaths = [
    path.join(process.cwd(), 'backend', 'dist', 'server.js'),
    path.join(__dirname, 'backend', 'dist', 'server.js'),
    path.join(process.cwd(), 'dist', 'server.js'),
    path.join(__dirname, 'dist', 'server.js')
];

for (const serverPath of backendPaths) {
    console.log('🔍 Trying server path:', serverPath);
    if (fs.existsSync(serverPath)) {
        console.log('✅ Found server at:', serverPath);
        
        // Set NODE_PATH to include the backend node_modules
        const backendNodeModules = path.join(path.dirname(serverPath), '..', 'node_modules');
        if (fs.existsSync(backendNodeModules)) {
            process.env.NODE_PATH = `${backendNodeModules}:${process.env.NODE_PATH || ''}`;
            require('module')._initPaths();
        }
        
        // Change to the backend directory
        const backendDir = path.dirname(path.dirname(serverPath));
        console.log('📁 Changing to backend directory:', backendDir);
        process.chdir(backendDir);
        
        // Start the server
        require(serverPath);
        return;
    }
}

console.error('❌ Could not find backend server in any location');
console.error('📂 Available files in current directory:');
try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        const stats = fs.statSync(filePath);
        console.error(`   ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    });
} catch (e) {
    console.error('   Error reading directory:', e.message);
}

process.exit(1);
