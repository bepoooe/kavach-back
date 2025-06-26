#!/bin/bash

echo "🔨 Building Kavach Backend for Render..."
echo "📁 Current working directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Navigate to backend directory
if [ -d "backend" ]; then
    echo "✅ Found backend directory"
    cd backend
    echo "📁 Backend directory: $(pwd)"
    echo "📂 Backend contents:"
    ls -la
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm ci
    
    # Build the backend
    echo "🔨 Building backend..."
    npm run build
    
    # Verify build
    if [ -f "dist/server.js" ]; then
        echo "✅ Backend build successful!"
        echo "📄 Built files:"
        ls -la dist/
    else
        echo "❌ Backend build failed - dist/server.js not found"
        exit 1
    fi
else
    echo "❌ Backend directory not found!"
    exit 1
fi

echo "🎉 Build complete!"
