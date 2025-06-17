
#!/bin/bash

# Stop nginx temporarily
sudo systemctl stop nginx

# Clean up old build
sudo rm -rf /var/www/site97/*
sudo rm -rf /tmp/neon-aviator-build

# Create fresh build directory
mkdir -p /tmp/neon-aviator-build
cd /tmp/neon-aviator-build

# Clone the repository
git clone https://github.com/TonyToniy/neon-aviator-crypto-dash.git .

# Install dependencies
npm install

# Build the application
npm run build

# Verify build was successful
if [ ! -f "dist/index.html" ]; then
    echo "Build failed - index.html not found!"
    exit 1
fi

echo "Build successful. Files in dist:"
ls -la dist/

# Copy build files to nginx directory
sudo cp -r dist/* /var/www/site97/
sudo chown -R www-data:www-data /var/www/site97
sudo chmod -R 755 /var/www/site97

# Verify files are copied
echo "Files copied to /var/www/site97:"
sudo ls -la /var/www/site97/

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl status nginx

# Test the deployment
echo "Testing deployment..."
curl -I http://localhost:8097/
echo "Testing auth route..."
curl -I http://localhost:8097/auth

echo "Rebuild complete!"
echo "Access your site at: http://your-server:8097"
echo "Auth page at: http://your-server:8097/auth"
