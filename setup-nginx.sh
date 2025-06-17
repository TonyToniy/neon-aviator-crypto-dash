
#!/bin/bash

# Nginx setup script for site97
set -e

echo "Setting up nginx for site97..."

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Copy nginx configuration
echo "Copying nginx configuration..."
$SUDO cp etc/nginx/sites-available/site97 /etc/nginx/sites-available/

# Enable the site
echo "Enabling site97..."
$SUDO ln -sf /etc/nginx/sites-available/site97 /etc/nginx/sites-enabled/

# Test nginx configuration
echo "Testing nginx configuration..."
$SUDO nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "Reloading nginx..."
    $SUDO systemctl reload nginx
    
    echo "✅ Nginx setup complete!"
    echo "Site97 is now configured to serve on port 8097"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
