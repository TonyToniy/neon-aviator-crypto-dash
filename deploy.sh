
#!/bin/bash

# Neon Aviator Deployment Script
set -e

echo "🚀 Starting deployment of Neon Aviator..."

# Configuration
REPO_URL="https://github.com/TonyToniy/neon-aviator-crypto-dash.git"
TEMP_DIR="/tmp/neon-aviator-deploy"
TARGET_DIR="/var/www/site97"
NGINX_SITE="site97"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Stop nginx temporarily
echo_info "Stopping nginx..."
$SUDO systemctl stop nginx

# Clean up previous deployment
echo_info "Cleaning up previous deployment..."
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

if [ -d "$TARGET_DIR" ]; then
    $SUDO rm -rf "$TARGET_DIR"/*
fi

# Create directories
echo_info "Creating directories..."
mkdir -p "$TEMP_DIR"
$SUDO mkdir -p "$TARGET_DIR"
$SUDO mkdir -p "$TARGET_DIR/data"

# Clone repository
echo_info "Cloning repository from GitHub..."
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo_error "package.json not found in repository!"
    exit 1
fi

# Install dependencies
echo_info "Installing dependencies..."
npm install

# Build the application
echo_info "Building the application..."
npm run build

# Verify build was successful
if [ ! -f "dist/index.html" ]; then
    echo_error "Build failed - dist/index.html not found!"
    exit 1
fi

echo_info "Build successful. Files in dist:"
ls -la dist/

# Copy build files to target directory
echo_info "Copying files to $TARGET_DIR..."
$SUDO cp -r dist/* "$TARGET_DIR/"

# Set proper permissions
echo_info "Setting permissions..."
$SUDO chown -R www-data:www-data "$TARGET_DIR"
$SUDO chmod -R 755 "$TARGET_DIR"

# Set permissions for data directory (writable for JSON storage)
$SUDO chmod -R 777 "$TARGET_DIR/data"

# Verify files are copied
echo_info "Files copied to $TARGET_DIR:"
$SUDO ls -la "$TARGET_DIR/"

# Test nginx configuration
echo_info "Testing nginx configuration..."
$SUDO nginx -t

if [ $? -ne 0 ]; then
    echo_error "Nginx configuration test failed!"
    exit 1
fi

# Start nginx
echo_info "Starting nginx..."
$SUDO systemctl start nginx
$SUDO systemctl status nginx --no-pager

# Clean up temp directory
echo_info "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

# Test the deployment
echo_info "Testing deployment..."
sleep 2

# Test main page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8097/ || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo_info "✅ Main page is accessible (HTTP $HTTP_STATUS)"
else
    echo_warn "⚠️  Main page returned HTTP $HTTP_STATUS"
fi

# Test auth route
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8097/auth || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo_info "✅ Auth page is accessible (HTTP $HTTP_STATUS)"
else
    echo_warn "⚠️  Auth page returned HTTP $HTTP_STATUS"
fi

echo_info "🎉 Deployment complete!"
echo_info "📍 Your app is now available at:"
echo_info "   Main site: http://your-server:8097/"
echo_info "   Auth page: http://your-server:8097/auth"
echo_info "   API endpoints: http://your-server:8097/api/*"
echo ""
echo_warn "Don't forget to:"
echo_warn "1. Set up your backend Node.js server for API endpoints"
echo_warn "2. Configure your domain/firewall settings"
echo_warn "3. Set up SSL certificate if needed"
