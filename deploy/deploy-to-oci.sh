#!/bin/bash

# OCI Deployment Script for Crypto Assistant
# Usage: ./deploy-to-oci.sh <OCI_IP_ADDRESS>

set -e

# Configuration
OCI_IP="${1:-}"
OCI_USER="${OCI_USER:-ubuntu}"
APP_NAME="crypto-assistant"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

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

# Validate arguments
if [ -z "$OCI_IP" ]; then
    print_error "Usage: $0 <OCI_IP_ADDRESS>"
    print_error "Example: $0 129.153.XXX.XXX"
    exit 1
fi

print_status "Starting deployment to OCI instance: $OCI_IP"

# Check if we can SSH to the instance
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$OCI_USER@$OCI_IP" "echo 'SSH connection successful'" >/dev/null 2>&1; then
    print_error "Cannot connect to $OCI_IP via SSH"
    print_error "Make sure:"
    print_error "1. The IP address is correct"
    print_error "2. Your SSH key is added to the instance"
    print_error "3. Security groups allow SSH (port 22)"
    exit 1
fi

print_status "SSH connection successful!"

# Create deployment directory on OCI instance
print_status "Setting up deployment directory..."
ssh "$OCI_USER@$OCI_IP" "mkdir -p ~/$APP_NAME/backend ~/$APP_NAME/frontend ~/$APP_NAME/deploy"

# Copy application files
print_status "Copying application files..."
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='venv' \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.next' \
    --exclude='crypto_portfolio.db' \
    ./ "$OCI_USER@$OCI_IP:~/$APP_NAME/"

# Install Docker and Docker Compose on OCI instance
print_status "Installing Docker and dependencies..."
ssh "$OCI_USER@$OCI_IP" << 'ENDSSH'
# Update system
sudo apt-get update

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
ENDSSH

# Build and start containers
print_status "Building and starting containers..."
ssh "$OCI_USER@$OCI_IP" << ENDSSH
cd ~/$APP_NAME

# Stop existing containers
docker-compose -f $DOCKER_COMPOSE_FILE down 2>/dev/null || true

# Remove old images to free space
docker system prune -f

# Build and start new containers
docker-compose -f $DOCKER_COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check container status
docker-compose -f $DOCKER_COMPOSE_FILE ps
ENDSSH

# Configure firewall rules
print_status "Configuring firewall rules..."
ssh "$OCI_USER@$OCI_IP" << 'ENDSSH'
# Allow HTTP and HTTPS traffic
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT

# Save iptables rules
sudo sh -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true

# For Ubuntu/Debian, install iptables-persistent if not present
if ! dpkg -l | grep -q iptables-persistent; then
    sudo apt-get install -y iptables-persistent
    sudo sh -c "iptables-save > /etc/iptables/rules.v4"
fi
ENDSSH

# Test deployment
print_status "Testing deployment..."
sleep 10

# Test backend health
if curl -f "http://$OCI_IP:8000/health" >/dev/null 2>&1; then
    print_status "✅ Backend is healthy at http://$OCI_IP:8000"
else
    print_warning "⚠️  Backend health check failed - check logs with: ssh $OCI_USER@$OCI_IP 'cd $APP_NAME && docker-compose -f $DOCKER_COMPOSE_FILE logs backend'"
fi

# Test frontend
if curl -f "http://$OCI_IP:3000" >/dev/null 2>&1; then
    print_status "✅ Frontend is accessible at http://$OCI_IP:3000"
else
    print_warning "⚠️  Frontend health check failed - check logs with: ssh $OCI_USER@$OCI_IP 'cd $APP_NAME && docker-compose -f $DOCKER_COMPOSE_FILE logs frontend'"
fi

print_status "🚀 Deployment completed!"
print_status ""
print_status "Your application should be accessible at:"
print_status "🔗 Frontend: http://$OCI_IP:3000"
print_status "🔗 Backend API: http://$OCI_IP:8000"
print_status "🔗 GraphQL Playground: http://$OCI_IP:8000/graphql"
print_status ""
print_status "To check logs:"
print_status "ssh $OCI_USER@$OCI_IP 'cd $APP_NAME && docker-compose -f $DOCKER_COMPOSE_FILE logs'"
print_status ""
print_status "To update the application, run this script again."
print_status ""
print_warning "⚠️  Remember to configure OCI Security Groups to allow:"
print_warning "   - Port 3000 (Frontend)"
print_warning "   - Port 8000 (Backend)"
print_warning "   - Port 80 (HTTP) - for future SSL setup"
print_warning "   - Port 443 (HTTPS) - for future SSL setup"