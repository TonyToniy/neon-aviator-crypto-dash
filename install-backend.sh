
#!/bin/bash

# Backend installation script
set -e

echo "🔧 Installing backend dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend packages..."
npm install --prefix . express cors bcrypt jsonwebtoken nodemon

echo "✅ Backend dependencies installed!"
echo ""
echo "To start the backend server:"
echo "  node backend-server.js"
echo ""
echo "Or for development with auto-restart:"
echo "  npx nodemon backend-server.js"
