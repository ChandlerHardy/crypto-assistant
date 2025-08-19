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

## 🚀 Recommended Deployment Strategy

### Frontend: Vercel (Free)
- Perfect for Next.js applications
- Automatic deployments from GitHub
- Built-in CDN and edge functions
- Custom domains and SSL included

### Backend: Render (Free)
- Easy Python deployment
- Free PostgreSQL database included
- Automatic SSL certificates
- GitHub integration for auto-deploys

**Total Cost: $0/month**

## 📝 Pre-Deployment Tasks

### 1. Database Migration
**Current State:** In-memory Python dictionaries  
**Needs:** PostgreSQL or SQLite for persistence

**Files to Update:**
- `backend/app/schemas/mutations.py` - Replace `PORTFOLIOS = {}` with database operations
- Add database models/schemas
- Add database connection setup

### 2. Environment Configuration

**Backend Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
COINGECKO_API_KEY=optional_api_key
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```

**Frontend Environment Variables:**
```env
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend.onrender.com/graphql
```

### 3. CORS Configuration
Update `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://your-app.vercel.app"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Create Deployment Files

**backend/requirements.txt:**
```
fastapi==0.104.1
strawberry-graphql==0.216.1
uvicorn[standard]==0.24.0
httpx==0.25.1
python-multipart==0.0.6
psycopg2-binary==2.9.7  # For PostgreSQL
```

**backend/Procfile (for Render):**
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 🔄 Deployment Steps

### Phase 1: Backend Deployment (Render)
1. **Create Render account** and connect GitHub
2. **Create new Web Service** from your repository
3. **Configure build settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`
4. **Add PostgreSQL database** (free add-on)
5. **Set environment variables** in Render dashboard
6. **Deploy and test** GraphQL endpoint

### Phase 2: Frontend Deployment (Vercel)
1. **Create Vercel account** and connect GitHub
2. **Import project** from repository
3. **Configure build settings:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Set environment variables:**
   - `NEXT_PUBLIC_GRAPHQL_URL=https://your-backend.onrender.com/graphql`
5. **Deploy and test** application

### Phase 3: Testing & Optimization
1. **Test all functionality** in production
2. **Verify CORS configuration**
3. **Test real-time data updates**
4. **Validate transaction system**
5. **Check dark/light mode toggle**

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