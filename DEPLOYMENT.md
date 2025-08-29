# Crypto Portfolio App - Deployment Guide

## 📋 Project Overview

A comprehensive cryptocurrency portfolio management application with real-time market data, transaction-based asset management, and a polished UI with dark/light mode support.

### Current Features
- **Real-time crypto market data** from CoinGecko API
- **Portfolio management** with multiple portfolios support
- **Transaction-based asset tracking** (buy/sell history)
- **Automatic calculations** (weighted averages, P&L, totals)
- **Interactive UI** with dark mode, responsive design
- **Live price charts** with multiple time periods
- **Complete transaction history** and audit trail

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.4.6** with Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** with dark/light mode
- **Apollo Client** for GraphQL
- **Lucide React** for icons

### Backend
- **FastAPI** with Python 3.13
- **Strawberry GraphQL** for schema/resolvers
- **HTTPX** for async HTTP requests
- **Uvicorn** ASGI server

### External APIs
- **CoinGecko API** for crypto market data
- **Cryptocurrency Icons CDN** for coin logos

## 🚀 Current Deployment Strategy

### Frontend: Vercel (Free)
- Perfect for Next.js applications
- Automatic deployments from GitHub
- Built-in CDN and edge functions
- Custom domains and SSL included

### Backend: Oracle Cloud Infrastructure (Free)
- **VM.Standard.A1.Flex** ARM-based compute instance
- **Docker containerized** FastAPI backend
- **PostgreSQL 15** database in Docker container
- **No cold starts** - always running
- **Always Free Tier** - up to 4 ARM OCPUs and 24GB RAM

**Total Cost: $0/month**

## 🔗 Live Application

- **Frontend**: https://crypto-portfolio-frontend-lovat.vercel.app/
- **Backend API**: http://150.136.38.166:8000
- **GraphQL Playground**: http://150.136.38.166:8000/graphql

## ✅ Deployment Status

### Database Setup ✅
**Current State:** PostgreSQL 15 running in Docker container on OCI  
**Features:**
- Persistent data storage with Docker volumes
- Connection pooling and health checks
- Production-ready database setup

### Environment Configuration ✅

**Backend Environment Variables (On OCI):**
```env
DATABASE_URL=postgresql://crypto_user:crypto_secure_password_2024@postgres:5432/crypto_portfolio
COINGECKO_API_KEY=optional_api_key
CORS_ORIGINS=https://crypto-portfolio-frontend-lovat.vercel.app,http://localhost:3000
```

**Frontend Environment Variables (Vercel):**
```env
NEXT_PUBLIC_GRAPHQL_URL=http://150.136.38.166:8000/graphql
```

### CORS Configuration ✅
**Current Setup:** Environment-based CORS configuration
```python
# In backend/app/main.py
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Configured via environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Deployment Files ✅

**Created deployment infrastructure:**
- `backend/Dockerfile` - Containerized backend with ARM64 support
- `docker-compose.backend-postgres.yml` - Production PostgreSQL + backend setup
- `deploy/deploy-backend-to-oci.sh` - Automated deployment script  
- `deploy/README.md` - Complete deployment documentation
- `.env.example` - Environment variables template

**Key Features:**
- ARM64-optimized for OCI A1.Flex instances
- Health checks and auto-restart policies
- Persistent PostgreSQL data storage
- SSH key-based deployment automation

## 🔄 Migration Complete ✅

### Backend Deployment (Oracle Cloud Infrastructure)
**Status:** ✅ **DEPLOYED AND RUNNING**

**Deployment Command:**
```bash
./deploy/deploy-backend-to-oci.sh 150.136.38.166
```

**Services Running:**
- FastAPI backend on port 8000
- PostgreSQL 15 database  
- Docker containerized with health checks
- Always-on (no cold starts)

### Frontend Deployment (Vercel)
**Status:** ✅ **DEPLOYED**

**Live URL:** https://crypto-portfolio-frontend-lovat.vercel.app/

**Configuration:**
- Auto-deploys from main branch
- Environment variable: `NEXT_PUBLIC_GRAPHQL_URL=http://150.136.38.166:8000/graphql`
- CORS configured for HTTPS requests

### Testing & Verification ✅
- ✅ Backend health check: http://150.136.38.166:8000/health
- ✅ GraphQL playground: http://150.136.38.166:8000/graphql  
- ✅ CORS properly configured for Vercel domain
- ✅ PostgreSQL database with persistent storage
- ✅ Frontend successfully connecting to OCI backend

## 🔧 Key Implementation Details

### Transaction System Logic
- **Buy transactions** increase holdings and contribute to weighted average price
- **Sell transactions** decrease holdings but don't affect average buy price
- **Asset auto-removal** when holdings reach zero
- **Real-time calculations** with live market prices

### GraphQL Schema
**Key Mutations:**
- `createPortfolio` - Create new portfolio
- `deletePortfolio` - Remove portfolio
- `addAssetToPortfolio` - Add crypto to portfolio (creates initial transaction)
- `addTransaction` - Record buy/sell transaction

**Key Queries:**
- `portfolios` - Get all portfolios with assets and transactions
- `cryptocurrencies` - Get market data for top cryptos
- `priceHistory` - Get historical price data for charts

### Data Models
```typescript
interface PortfolioAsset {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  transactions: AssetTransaction[];
}

interface AssetTransaction {
  id: string;
  transactionType: 'buy' | 'sell';
  amount: number;
  pricePerUnit: number;
  totalValue: number;
  timestamp: string;
  notes?: string;
}
```

## 🐛 Common Deployment Issues & Solutions

### Backend Issues
- **Cold starts on Render:** 30-second delay after 15 minutes inactivity (normal for free tier)
- **Database connection errors:** Verify DATABASE_URL format and credentials
- **CORS errors:** Ensure frontend URL is in CORS origins list

### Frontend Issues
- **GraphQL endpoint errors:** Check NEXT_PUBLIC_GRAPHQL_URL environment variable
- **Build errors:** Ensure all TypeScript types are properly defined
- **Dark mode issues:** Verify Tailwind configuration includes dark mode classes

## 📊 Performance Considerations

### Render Free Tier Limitations
- **512MB RAM limit** (sufficient for our app)
- **750 build hours/month** (plenty for personal projects)
- **Service sleeps after 15 minutes** inactivity

### Optimization Strategies
- **Apollo Client caching** for reduced API calls
- **Polling intervals** optimized for user experience vs API usage
- **Lazy loading** for modals and components
- **Image optimization** for crypto logos

## 🔐 Security Considerations

### API Keys
- **CoinGecko API key** (optional but recommended for higher rate limits)
- **Database credentials** stored in environment variables
- **CORS origins** restricted to known domains

### Data Validation
- **Input sanitization** on all GraphQL mutations
- **Type validation** with TypeScript and Strawberry
- **Error handling** with user-friendly messages

## 🚦 Current Status

✅ **Complete Features:**
- Portfolio CRUD operations
- Transaction-based asset management
- Real-time price updates
- Interactive UI with dark mode
- Price charts with time period selection
- Complete transaction history

⏳ **Ready for Deployment:**
- Well-architected codebase
- Modular component structure
- Environment-agnostic configuration
- Comprehensive error handling

🔄 **Next Steps for Production:**
- Add database persistence
- Configure production environment variables
- Set up CORS for production domains
- Deploy to Render + Vercel

---

## 💻 Local Development Commands

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:8000/graphql
- GraphQL Playground: http://localhost:8000/graphql (in browser)

---

*Last Updated: 2025-08-19*  
*Project Status: Ready for deployment preparation*