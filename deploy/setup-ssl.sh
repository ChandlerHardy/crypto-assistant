#!/bin/bash

# SSL Setup Script for OCI Backend
# Usage: ./setup-ssl.sh <OCI_IP_ADDRESS> <DOMAIN_NAME>

set -e

OCI_IP="${1:-}"
DOMAIN="${2:-}"
OCI_USER="${OCI_USER:-ubuntu}"
SSH_KEY_PATH="${SSH_KEY_PATH:-/Users/chandlerhardy/.ssh/ampere.key}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH command with key
SSH_CMD="ssh -i $SSH_KEY_PATH"

if [ -z "$OCI_IP" ] || [ -z "$DOMAIN" ]; then
    print_error "Usage: $0 <OCI_IP_ADDRESS> <DOMAIN_NAME>"
    print_error "Example: $0 150.136.38.166 api.yourdomain.com"
    exit 1
fi

print_status "🔒 Setting up SSL for $DOMAIN on OCI instance: $OCI_IP"

# Install Nginx and Certbot
print_status "Installing Nginx and Certbot..."
$SSH_CMD "$OCI_USER@$OCI_IP" << 'ENDSSH'
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
ENDSSH

# Create Nginx configuration
print_status "Creating Nginx configuration..."
$SSH_CMD "$OCI_USER@$OCI_IP" << ENDSSH
# Create Nginx config for the API
sudo tee /etc/nginx/sites-available/crypto-api << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/crypto-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
ENDSSH

# Get SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
$SSH_CMD "$OCI_USER@$OCI_IP" << ENDSSH
# Get SSL certificate
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up auto-renewal
sudo systemctl enable certbot.timer
ENDSSH

# Update CORS configuration
print_status "Updating CORS configuration..."
$SSH_CMD "$OCI_USER@$OCI_IP" << ENDSSH
cd ~/crypto-assistant
echo "CORS_ORIGINS=http://localhost:3000,https://crypto-portfolio-frontend-lovat.vercel.app,https://$DOMAIN" > .env
docker-compose -f docker-compose.backend-postgres.yml restart backend
ENDSSH

# Open HTTPS port
print_status "Configuring firewall for HTTPS..."
$SSH_CMD "$OCI_USER@$OCI_IP" << 'ENDSSH'
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo sh -c "iptables-save > /etc/iptables/rules.v4"
ENDSSH

print_status "🎉 SSL setup complete!"
print_status ""
print_status "Your backend is now available at:"
print_status "🔗 HTTPS API: https://$DOMAIN"
print_status "🔗 GraphQL: https://$DOMAIN/graphql"
print_status ""
print_status "Update your Vercel environment variable:"
print_status "NEXT_PUBLIC_GRAPHQL_URL=https://$DOMAIN/graphql"
print_status ""
print_warning "⚠️  Make sure your domain's DNS points to $OCI_IP"
print_warning "⚠️  Add HTTPS (port 443) to your OCI Security Groups"