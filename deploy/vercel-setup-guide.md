# Custom Domain Setup Guide

This guide covers setting up custom domains for your crypto assistant application deployed on Vercel + OCI.

## Current Production Setup

**Live URLs:**
- **Portfolio**: `https://chandlerhardy.com`
- **Crypto App**: `https://cryptassist.chandlerhardy.com`
- **Backend API**: `https://backend.chandlerhardy.com/cryptassist/*`

## Architecture Overview

```
┌─────────────────┐    HTTPS    ┌─────────────────┐    HTTPS    ┌─────────────────┐
│                 │ ──────────► │                 │ ─────────► │                 │
│  User Browser   │             │  Vercel (CDN)   │            │ OCI + nginx +   │
│                 │ ◄────────── │  Custom Domains │ ◄───────── │ Let's Encrypt   │
└─────────────────┘             └─────────────────┘            └─────────────────┘
```

## Step-by-Step Setup

### 1. Deploy Backend to OCI with Custom Domain

Deploy your backend and set up SSL:

```bash
# Deploy backend with new GraphQL path
./deploy/deploy-backend-to-oci.sh YOUR_OCI_IP

# Set up SSL and nginx reverse proxy
./deploy/setup-ssl.sh YOUR_OCI_IP backend.yourdomain.com
```

### 2. Configure DNS Records

In your domain registrar (Namecheap), add these DNS records:

```
# Backend subdomain
Type: A
Host: backend
Value: YOUR_OCI_IP

# Crypto app subdomain 
Type: CNAME
Host: cryptassist
Value: cname.vercel-dns.com

# Main domain (portfolio)
Type: A 
Name: @
Value: [Vercel provided IP]
```

### 3. Set up Custom Domains in Vercel

**For Crypto App:**
1. Go to crypto app project in Vercel
2. Settings → Domains
3. Add `cryptassist.yourdomain.com`

**For Portfolio:**
1. Go to portfolio project in Vercel  
2. Settings → Domains
3. Add `yourdomain.com`

### 4. Update Environment Variables

**Crypto App (Vercel):**
```env
NEXT_PUBLIC_GRAPHQL_URL=https://backend.yourdomain.com/cryptassist/graphql
```

**Backend (OCI):**
```bash
# SSH to OCI instance
ssh ubuntu@YOUR_OCI_IP
cd crypto-assistant
echo "CORS_ORIGINS=http://localhost:3000,https://cryptassist.yourdomain.com,https://yourdomain.com" > .env
docker-compose -f docker-compose.backend.yml restart backend
```

## Required OCI Security Group Rules

Need to open ports for HTTP, HTTPS, and SSH:

| Protocol | Port | Source CIDR | Description |
|----------|------|-------------|-------------|
| TCP | 22 | YOUR_IP/32 | SSH Access |
| TCP | 80 | 0.0.0.0/0 | HTTP (for Let's Encrypt) |
| TCP | 443 | 0.0.0.0/0 | HTTPS (SSL traffic) |
| TCP | 8000 | 0.0.0.0/0 | Backend API (internal) |

## Testing Your Setup

### 1. Test Backend with SSL
```bash
curl https://backend.yourdomain.com/health
curl https://backend.yourdomain.com/cryptassist/graphql
```

### 2. Test Frontend Connection
1. Visit `https://cryptassist.yourdomain.com`
2. Open browser developer tools
3. Check Network tab for GraphQL requests to HTTPS backend
4. Verify no CORS or mixed content errors in console

### 3. Test DNS Propagation
```bash
nslookup backend.yourdomain.com
nslookup cryptassist.yourdomain.com
```

## Benefits of This Architecture

✅ **Professional Setup**: Custom domains with SSL certificates  
✅ **Clean URLs**: Subdomain separation for different services  
✅ **Free SSL**: Let's Encrypt certificates with auto-renewal  
✅ **Global CDN**: Vercel's edge network for fast loading  
✅ **Always-On Backend**: No cold starts on OCI  
✅ **Cost Effective**: Free Vercel + free OCI tier = $0/month  

## Troubleshooting

### Common Issues

**CORS Errors:**
```
Access to fetch at 'http://YOUR_OCI_IP:8000/graphql' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:** Update backend CORS_ORIGINS to include your Vercel URL

**GraphQL Connection Failed:**
- Verify `NEXT_PUBLIC_GRAPHQL_URL` is set correctly in Vercel
- Check if OCI port 8000 is open in security groups
- Test backend directly: `curl http://YOUR_OCI_IP:8000/health`

**502 Bad Gateway:**
- Backend container might be down: `ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.backend.yml ps'`
- Check backend logs: `ssh ubuntu@YOUR_OCI_IP 'cd crypto-assistant && docker-compose -f docker-compose.backend.yml logs'`

## SSL/HTTPS Considerations

For production, consider:
- **Let's Encrypt SSL** on OCI backend
- **Nginx reverse proxy** for SSL termination
- **Custom domain** for your backend API

## Monitoring & Maintenance

### Check Backend Status
```bash
# SSH to OCI and check status
ssh ubuntu@YOUR_OCI_IP
cd crypto-assistant
docker-compose -f docker-compose.backend.yml ps
docker-compose -f docker-compose.backend.yml logs
```

### Update Backend
```bash
# Just run the deployment script again
./deploy/deploy-backend-to-oci.sh YOUR_OCI_IP
```

### Update Frontend
- Push changes to GitHub
- Vercel auto-deploys from main branch

## Cost Breakdown

- **Frontend (Vercel)**: FREE (hobby plan)
- **Backend (OCI)**: FREE (Always Free tier A1.Flex)
- **Total**: $0/month 🎉