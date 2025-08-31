# Claude Code Project Information

## Project Overview
Crypto Portfolio Analyzer - A real-time cryptocurrency portfolio tracking and analysis application with AI-powered investment advice.

## Tech Stack
- **Frontend**: Next.js 15 + TypeScript, Tailwind CSS, Apollo GraphQL
- **Backend**: FastAPI + Strawberry GraphQL, PostgreSQL
- **AI**: GitHub Llama 3.1 8B model integration
- **Deployment**: Vercel (frontend) + Oracle Cloud Infrastructure (backend)

## 🚀 Live Production URLs
- **Main App**: https://cryptassist.chandlerhardy.com
- **Portfolio**: https://chandlerhardy.com
- **Backend API**: https://backend.chandlerhardy.com
- **GraphQL**: https://backend.chandlerhardy.com/cryptassist/graphql

## 🖥️ Server Access
**OCI Server:**
- **IP**: `150.136.38.166`
- **SSH**: `ssh ubuntu@150.136.38.166 -i /Users/chandlerhardy/.ssh/ampere.key`
- **Location**: `/home/ubuntu/crypto-assistant/`

## ⚙️ Key Environment Variables
**Backend (.env on OCI server):**
- `GITHUB_TOKEN=ghp_***` (for AI chat)
- `CORS_ORIGINS=https://cryptassist.chandlerhardy.com,https://backend.chandlerhardy.com`

**Frontend (Vercel):**
- `NEXT_PUBLIC_GRAPHQL_URL=https://backend.chandlerhardy.com/cryptassist/graphql`

## 🛠️ Common Commands
```bash
# SSH to server
ssh ubuntu@150.136.38.166 -i /Users/chandlerhardy/.ssh/ampere.key

# Check backend status
cd crypto-assistant && docker-compose -f docker-compose.backend.yml ps

# Restart backend
cd crypto-assistant && docker-compose -f docker-compose.backend.yml restart backend

# Deploy backend updates
./deploy/deploy-backend-to-oci.sh 150.136.38.166

# Test build locally
npm run build

# Test AI chat
curl -X POST "https://backend.chandlerhardy.com/cryptassist/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { chatWithAssistant(message: \"Hello\") }"}'
```

## 🤖 AI Chat Service
- **Status**: ✅ Active and working
- **Model**: GitHub Llama 3.1 8B Instruct
- **Features**: Portfolio-aware advice, real-time market analysis
- **UI**: Glassmorphism floating chat widget

## 📁 Project Structure
```
crypto-assistant/
├── frontend/           # Next.js app (deployed to Vercel)
├── backend/           # FastAPI app (deployed to OCI)
├── deploy/            # Deployment scripts
├── DEPLOYMENT_STATUS.md  # Detailed deployment info
└── CLAUDE.md          # This file
```

## 🚨 Quick Fixes
- **AI chat not working**: Check `GITHUB_TOKEN` on OCI server
- **CORS errors**: Verify `CORS_ORIGINS` in backend `.env`
- **Build failures**: Usually TypeScript errors, check types
- **GraphQL 404**: Use `/cryptassist/graphql` endpoint (not `/graphql`)

## 📋 Recent Features Added
- ✅ AI chatbot with portfolio context awareness
- ✅ Glassmorphism UI effects on chat widget
- ✅ Portfolio data integration with AI responses
- ✅ GitHub Llama AI model integration
- ✅ Production deployment with SSL/HTTPS

## 💡 Important Notes
- Backend runs on OCI Always Free tier (ARM64)
- Frontend auto-deploys from main branch via Vercel
- AI requires GitHub Personal Access Token
- Database is persistent PostgreSQL with Docker volumes
- SSL certificates auto-renew via Let's Encrypt

---
*For detailed troubleshooting, see DEPLOYMENT_STATUS.md*