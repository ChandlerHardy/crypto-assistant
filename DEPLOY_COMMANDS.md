# Deployment Commands for Crypto Portfolio App

## Current Production Setup

**Live Application:**
- **Frontend**: https://cryptassist.chandlerhardy.com
- **Portfolio**: https://chandlerhardy.com  
- **Backend API**: https://backend.chandlerhardy.com/cryptassist/*
- **GraphQL Playground**: https://backend.chandlerhardy.com/cryptassist/graphql

## Prerequisites
- **OCI Instance**: Oracle Cloud Infrastructure VM
- **Domain**: Custom domain with DNS control (using Namecheap)
- **SSH Access**: SSH key for OCI instance
- **Vercel Account**: For frontend deployment

## Phase 1: Backend Deployment (Oracle Cloud Infrastructure)

### 1. Deploy Backend to OCI
```bash
# Deploy backend with updated GraphQL path
./deploy/deploy-backend-to-oci.sh 150.136.38.166
```

### 2. Set up SSL Certificate
```bash
# Configure nginx reverse proxy and SSL
./deploy/setup-ssl.sh 150.136.38.166 backend.yourdomain.com
```

### 3. Configure DNS
In your domain registrar (Namecheap), add:
```
Type: A
Host: backend
Value: YOUR_OCI_IP_ADDRESS
```

## Phase 2: Frontend Deployment (Vercel)

### 1. Set up Custom Domain for Crypto App
1. **Add CNAME Record** in domain DNS:
   ```
   Type: CNAME
   Host: cryptassist  
   Value: cname.vercel-dns.com
   ```

2. **Add Custom Domain in Vercel**:
   - Go to crypto app project in Vercel
   - Settings → Domains
   - Add `cryptassist.yourdomain.com`

### 2. Configure Environment Variables
In Vercel project settings, add:
```
NEXT_PUBLIC_GRAPHQL_URL=https://backend.yourdomain.com/cryptassist/graphql
```

### 3. Set up Portfolio Domain (Optional)
For main portfolio site:
1. **Add Domain in Vercel** (portfolio project):
   - Add `yourdomain.com` as custom domain
2. **Update DNS**:
   ```
   Type: A
   Name: @
   Value: [Vercel IP provided]
   ```

## Phase 3: Final Configuration

### 1. Update Backend CORS
Update CORS on OCI backend to allow new domains:
```bash
ssh ubuntu@YOUR_OCI_IP 'cd ~/crypto-assistant && echo "CORS_ORIGINS=http://localhost:3000,https://cryptassist.yourdomain.com,https://yourdomain.com" > .env'
ssh ubuntu@YOUR_OCI_IP 'cd ~/crypto-assistant && docker-compose -f docker-compose.backend.yml restart backend'
```

### 2. Test All Endpoints
```bash
# Test backend health
curl https://backend.yourdomain.com/health

# Test GraphQL endpoint  
curl https://backend.yourdomain.com/cryptassist/graphql

# Verify frontend loads
curl -I https://cryptassist.yourdomain.com
```

## Current Architecture
- **Frontend**: `cryptassist.yourdomain.com` (Vercel)
- **Portfolio**: `yourdomain.com` (Vercel)
- **Backend**: `backend.yourdomain.com` (OCI + nginx + SSL)
- **Database**: PostgreSQL on OCI (Docker)

## Troubleshooting

### Backend Issues
- **SSL Certificate**: Check Let's Encrypt certificate status
- **CORS errors**: Verify CORS_ORIGINS includes all frontend domains
- **Docker issues**: Check container status with `docker-compose ps`
- **Nginx issues**: Check nginx config and restart if needed

### Frontend Issues
- **GraphQL errors**: Verify NEXT_PUBLIC_GRAPHQL_URL points to correct backend path
- **Domain issues**: Check DNS propagation with `nslookup`
- **SSL issues**: Verify Vercel SSL certificate is active

### Testing Commands
```bash
# Test backend health
curl https://backend.yourdomain.com/health

# Test GraphQL endpoint (note /cryptassist path)
curl https://backend.yourdomain.com/cryptassist/graphql

# Check DNS propagation
nslookup cryptassist.yourdomain.com
nslookup backend.yourdomain.com
```

### Common Issues
- **Mixed Content Warnings**: Ensure all URLs use HTTPS in production
- **Path Mismatch**: GraphQL endpoint is at `/cryptassist/graphql`, not `/graphql`
- **CORS Blocking**: Backend must explicitly allow frontend domain in CORS_ORIGINS

## Important Notes
1. **SSL Auto-Renewal**: Let's Encrypt certificates auto-renew via cron
2. **Path-Based API**: Backend serves at `/cryptassist/*` to allow multiple apps
3. **Free SSL**: No cost for SSL certificates using Let's Encrypt
4. **Domain Structure**: Clean separation of services via subdomains

## Quick Deploy Summary
1. Deploy backend to OCI with `./deploy/deploy-backend-to-oci.sh`
2. Configure DNS A/CNAME records for subdomains
3. Set up SSL with `./deploy/setup-ssl.sh`
4. Add custom domains in Vercel for frontend
5. Configure CORS to allow all domains
6. Test all endpoints and domain resolution

Your crypto portfolio app is now deployed with custom domains and SSL!