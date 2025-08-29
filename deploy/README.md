# OCI Deployment Guide

This guide will help you deploy your Crypto Assistant application to Oracle Cloud Infrastructure.

## Prerequisites

1. **OCI Instance**: A running VM.Standard.A1.Flex instance
2. **SSH Access**: SSH key configured for your instance
3. **Security Groups**: Ports 22, 80, 443, 3000, 8000 open (see `setup-oci-security-groups.md`)
4. **Docker**: Will be installed automatically by the deployment script

## Quick Deployment

### 1. Configure Security Groups
First, follow the instructions in `setup-oci-security-groups.md` to open the required ports.

### 2. Set Environment Variables (Optional)
```bash
export OCI_USER=ubuntu  # or your instance username
export COINGECKO_API_KEY=your_api_key_here  # optional
```

### 3. Run Deployment Script
```bash
./deploy/deploy-to-oci.sh YOUR_OCI_IP_ADDRESS
```

Example:
```bash
./deploy/deploy-to-oci.sh 129.153.XXX.XXX
```

## What the Deployment Script Does

1. ✅ Tests SSH connectivity
2. ✅ Creates deployment directories on OCI instance  
3. ✅ Copies application files via rsync
4. ✅ Installs Docker and Docker Compose
5. ✅ Builds and starts containers
6. ✅ Configures firewall rules
7. ✅ Tests application health

## After Deployment

Your application will be accessible at:
- **Frontend**: `https://cryptassist.yourdomain.com` (Vercel)
- **Backend API**: `https://backend.yourdomain.com`
- **GraphQL Playground**: `https://backend.yourdomain.com/cryptassist/graphql`
- **Health Check**: `https://backend.yourdomain.com/health`

**Local Development:**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://YOUR_OCI_IP:8000`
- **GraphQL Playground**: `http://YOUR_OCI_IP:8000/cryptassist/graphql`

## Managing Your Deployment

### Check Application Status
```bash
ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.prod.yml ps'
```

### View Logs
```bash
# All services
ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.prod.yml logs'

# Backend only  
ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.prod.yml logs backend'

# Frontend only
ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.prod.yml logs frontend'
```

### Restart Services
```bash
ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.prod.yml restart'
```

### Update Application
Simply run the deployment script again:
```bash
./deploy/deploy-to-oci.sh YOUR_OCI_IP
```

## Environment Configuration

The deployment uses these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `http://localhost:3000,https://cryptassist.yourdomain.com` | Allowed frontend origins |
| `COINGECKO_API_KEY` | _(empty)_ | Optional API key for higher rate limits |
| `NEXT_PUBLIC_GRAPHQL_URL` | `https://backend.yourdomain.com/cryptassist/graphql` | Backend GraphQL endpoint |

## Troubleshooting

### Common Issues

**SSH Connection Failed:**
- Verify your SSH key is correct
- Check that port 22 is open in security groups
- Ensure the IP address is correct

**Application Not Accessible:**
- Verify security group rules allow ports 3000 and 8000
- Check if containers are running: `docker-compose -f docker-compose.prod.yml ps`
- Review logs for errors

**Docker Build Failures:**
- OCI instance might be low on disk space: `ssh ubuntu@YOUR_OCI_IP 'df -h'`
- Clean up old Docker images: `ssh ubuntu@YOUR_OCI_IP 'docker system prune -f'`

### Manual Deployment Steps

If the script fails, you can deploy manually:

```bash
# 1. SSH to your instance
ssh ubuntu@YOUR_OCI_IP

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone/copy your application code
# 5. Build and run containers
docker-compose -f docker-compose.prod.yml up -d --build
```

## Production Domain Setup

### Custom Domain Configuration
1. **Configure DNS Records**:
   ```
   Type: A, Host: backend, Value: YOUR_OCI_IP
   Type: CNAME, Host: cryptassist, Value: cname.vercel-dns.com
   ```

2. **Set up SSL**:
   ```bash
   ./deploy/setup-ssl.sh YOUR_OCI_IP backend.yourdomain.com
   ```

3. **Configure Vercel Custom Domain**:
   - Add `cryptassist.yourdomain.com` to Vercel project
   - Update environment variable: `NEXT_PUBLIC_GRAPHQL_URL=https://backend.yourdomain.com/cryptassist/graphql`

### Next Steps
- **Monitoring**: Set up logging and monitoring for production
- **Backup**: Configure database backups for persistent storage
- **Performance**: Consider CDN for static assets

## Cost Optimization

- **Always Free Tier**: VM.Standard.A1.Flex with 1 OCPU and 6GB RAM is free
- **Resource Monitoring**: Monitor CPU/memory usage and adjust if needed
- **Docker Cleanup**: Regular cleanup of old images and containers