# Deployment Commands for Crypto Portfolio App

## Prerequisites
- GitHub account with your repository pushed
- Render account (free): https://render.com
- Vercel account (free): https://vercel.com

## Phase 1: Backend Deployment (Render)

### 1. Push to GitHub (if not already done)
```bash
git add .
git commit -m "Add PostgreSQL database support for deployment"
git push origin main
```

### 2. Deploy to Render
1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crypto-portfolio-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Add PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. **Name**: `crypto-portfolio-db`
3. **Plan**: Free
4. Click "Create Database"
5. Copy the **External Database URL** (starts with `postgresql://`)

### 4. Set Backend Environment Variables
In your Render web service settings, add these environment variables:
```
DATABASE_URL=postgresql://[paste_your_database_url_here]
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

## Phase 2: Frontend Deployment (Vercel)

### 1. Deploy to Vercel
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Your personal account
- **Link to existing project**: No
- **Project name**: `crypto-portfolio-frontend`
- **Directory**: `./` (current directory)
- **Want to override settings**: Yes
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Development Command**: `npm run dev`

### 2. Set Frontend Environment Variables
After deployment, set environment variables in Vercel:

**Option A: Via Vercel CLI**
```bash
vercel env add NEXT_PUBLIC_GRAPHQL_URL
# Enter: https://your-backend-name.onrender.com/graphql
```

**Option B: Via Vercel Dashboard**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_GRAPHQL_URL` = `https://your-backend-name.onrender.com/graphql`

### 3. Update CORS in Backend
After you get your Vercel URL, update the CORS environment variable in Render:
```
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

## Phase 3: Final Configuration

### 1. Update Backend CORS (important!)
Once you have your Vercel frontend URL, update the CORS_ORIGINS in Render:
```
CORS_ORIGINS=http://localhost:3000,https://your-actual-vercel-url.vercel.app
```

### 2. Redeploy Frontend
After updating backend CORS:
```bash
cd frontend
vercel --prod
```

## Expected URLs
- **Backend**: `https://crypto-portfolio-backend-[hash].onrender.com`
- **Frontend**: `https://crypto-portfolio-frontend-[hash].vercel.app`
- **GraphQL Playground**: `https://crypto-portfolio-backend-[hash].onrender.com/graphql`

## Troubleshooting

### Backend Issues
- **Database connection errors**: Check DATABASE_URL format
- **CORS errors**: Ensure frontend URL is in CORS_ORIGINS
- **Cold starts**: Render free tier sleeps after 15 minutes (normal)

### Frontend Issues
- **GraphQL errors**: Check NEXT_PUBLIC_GRAPHQL_URL points to backend
- **Build errors**: Run `npm run build` locally first
- **Environment variables**: Redeploy after adding env vars

### Testing Commands
```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test GraphQL endpoint
curl -X POST https://your-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ portfolios { id name } }"}'
```

## Important Notes
1. **First deployment** may take 5-10 minutes for database initialization
2. **Free tier limitations**: Backend sleeps after 15 minutes of inactivity
3. **Database persistence**: All data will now persist between deployments
4. **Environment variables**: Both services need env vars to communicate

## Quick Deploy Summary
1. Push code to GitHub
2. Create Render web service from repository
3. Add PostgreSQL database to Render
4. Set DATABASE_URL and CORS_ORIGINS in Render
5. Deploy frontend with `vercel --prod`
6. Set NEXT_PUBLIC_GRAPHQL_URL in Vercel
7. Update CORS_ORIGINS with actual Vercel URL
8. Test both applications

Your crypto portfolio app will then be fully deployed and accessible worldwide!