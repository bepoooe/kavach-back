# Render Build Script - Simplified Backend Only
echo "Starting Kavach Backend Build..."

# Install backend dependencies only
echo "Installing backend dependencies..."
cd backend
npm ci

# Build TypeScript to JavaScript
echo "Building TypeScript..."
npm run build

# Verify build
if [ -f "dist/server.js" ]; then
    echo "Build successful - server.js created"
else
    echo "Build failed - server.js not found"
    exit 1
fi

echo "Backend build complete!"
