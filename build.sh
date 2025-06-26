#!/bin/bash
# Render build script for Kavach Backend

echo "🚀 Starting Kavach Backend deployment..."

# Navigate to backend directory
cd backend

echo "📦 Installing all dependencies (including dev for build)..."
npm ci

echo "🔧 Building TypeScript..."
npm run build

echo "✅ Backend build complete!"

# Verify build
if [ -f "dist/server.js" ]; then
    echo "✅ Server build found: dist/server.js"
else
    echo "❌ Server build failed: dist/server.js not found"
    exit 1
fi

echo "🎉 Kavach Backend ready for deployment!"
