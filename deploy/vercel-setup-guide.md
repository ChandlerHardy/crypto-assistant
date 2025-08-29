# Vercel + OCI Backend Setup Guide

This guide covers deploying your frontend to Vercel while running the backend on your OCI instance.

## Architecture Overview

```
┌─────────────────┐    HTTPS    ┌─────────────────┐    HTTP     ┌─────────────────┐
│                 │ ──────────► │                 │ ─────────► │                 │
│  User Browser   │             │  Vercel (CDN)   │            │  OCI Backend    │
│                 │ ◄────────── │  Frontend       │ ◄───────── │  (GraphQL API)  │
└─────────────────┘             └─────────────────┘            └─────────────────┘
```

## Step-by-Step Setup

### 1. Deploy Backend to OCI

First, deploy your backend to your OCI instance:

```bash
# Deploy backend only
./deploy/deploy-backend-to-oci.sh YOUR_OCI_IP

# Example:
./deploy/deploy-backend-to-oci.sh 129.153.XXX.XXX
```

This will:
- Deploy only the FastAPI backend to OCI
- Make it accessible at `http://YOUR_OCI_IP:8000`
- Set up GraphQL at `http://YOUR_OCI_IP:8000/graphql`

### 2. Update Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Update or add:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://YOUR_OCI_IP:8000/graphql
```

**Replace `YOUR_OCI_IP` with your actual OCI instance IP**

### 3. Update Backend CORS Configuration

You'll need to update your backend to allow requests from Vercel:

**Option A: Set via Environment Variable on OCI**
```bash
# SSH to your OCI instance
ssh ubuntu@YOUR_OCI_IP

# Update environment and restart
cd crypto-assistant
echo "CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000" > .env
docker-compose -f docker-compose.backend.yml restart
```

**Option B: Update main.py directly**
Edit `backend/app/main.py` and add your Vercel URL to the CORS origins:

```python
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://your-vercel-app.vercel.app").split(",")
```

### 4. Deploy/Redeploy Frontend to Vercel

If your project isn't on Vercel yet:

1. **Connect GitHub** to Vercel
2. **Import your repository**
3. **Set Root Directory**: `frontend`
4. **Add Environment Variable**: `NEXT_PUBLIC_GRAPHQL_URL=http://YOUR_OCI_IP:8000/graphql`
5. **Deploy**

If already deployed, just redeploy to pick up the new environment variable.

## Required OCI Security Group Rules

Only need to open port 8000 for the backend:

| Protocol | Port | Source CIDR | Description |
|----------|------|-------------|-------------|
| TCP | 22 | YOUR_IP/32 | SSH Access |
| TCP | 8000 | 0.0.0.0/0 | Backend API |

## Testing Your Setup

### 1. Test Backend Directly
```bash
curl http://YOUR_OCI_IP:8000/health
curl http://YOUR_OCI_IP:8000/graphql
```

### 2. Test Frontend Connection
1. Visit your Vercel app URL
2. Open browser developer tools
3. Check Network tab for GraphQL requests to your OCI backend
4. Verify no CORS errors in console

## Benefits of This Architecture

✅ **Best of Both Worlds**: Vercel's CDN + your always-on backend  
✅ **Cost Effective**: Free Vercel frontend + minimal OCI backend  
✅ **No Cold Starts**: Backend stays warm on OCI  
✅ **Easy Updates**: Deploy backend and frontend independently  
✅ **Better Performance**: Frontend served from global CDN  

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