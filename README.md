# Crypto Portfolio Analyzer

A real-time cryptocurrency portfolio tracking and analysis application built with Next.js, FastAPI, and GraphQL.

## Features

- 🚀 **Real-time Updates**: Live cryptocurrency price tracking via WebSocket connections
- 📊 **Data Visualization**: Interactive charts using Plotly.js and Recharts
- 💼 **Portfolio Management**: Track multiple portfolios with detailed analytics
- 🤖 **AI Assistant**: Real-time crypto advice powered by GitHub's Llama AI model
- 🔍 **Risk Analysis**: Portfolio optimization algorithms and risk assessment
- ⚡ **GraphQL API**: Efficient data fetching with Apollo Client caching
- 🎨 **Modern UI**: Responsive design with Tailwind CSS and glassmorphism effects

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Apollo Client** for GraphQL and caching
- **Tailwind CSS** + **Radix UI** for styling
- **Plotly.js** + **Recharts** for data visualization
- **React Hook Form** + **Zod** for form handling

### Backend
- **FastAPI** with **Strawberry GraphQL**
- **GitHub Llama AI** integration for intelligent assistance
- **WebSocket** support for real-time updates
- **Redis** for caching and session management
- **PostgreSQL** with SQLAlchemy ORM
- **Celery** for background tasks
- **CoinGecko API** integration

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Redis (optional, for caching)
- PostgreSQL (optional, for persistence)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Access Points

**Production:**
- **Frontend**: https://cryptassist.chandlerhardy.com
- **Portfolio**: https://chandlerhardy.com  
- **GraphQL Playground**: https://backend.chandlerhardy.com/cryptassist/graphql
- **API Health**: https://backend.chandlerhardy.com/health

**Local Development:**
- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:8000/cryptassist/graphql
- **API Documentation**: http://localhost:8000/docs

## Project Structure

```
crypto-assistant/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Apollo Client setup
│   │   └── types/           # TypeScript interfaces
│   └── package.json
│
├── backend/                  # FastAPI GraphQL API
│   ├── app/
│   │   ├── api/             # REST endpoints (if needed)
│   │   ├── core/            # Configuration
│   │   ├── models/          # Database models
│   │   ├── schemas/         # GraphQL schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── requirements.txt
│
└── README.md
```

## Development

### Environment Variables

Backend (`.env`):
```bash
DATABASE_URL=postgresql://user:pass@localhost/crypto_db
REDIS_URL=redis://localhost:6379
COINGECKO_API_KEY=your-api-key-here
GITHUB_TOKEN=your-github-personal-access-token
SECRET_KEY=your-secret-key
```

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/cryptassist/graphql
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Backend:**
- `uvicorn app.main:app --reload` - Start development server
- `pytest` - Run tests
- `alembic upgrade head` - Run database migrations

## Deployment

### Production Status ✅

**Current Live Deployment (as of August 2025):**
- **Frontend**: ✅ https://cryptassist.chandlerhardy.com (Vercel)
- **Portfolio**: ✅ https://chandlerhardy.com (Vercel) 
- **Backend API**: ✅ https://backend.chandlerhardy.com (OCI - 150.136.38.166)
- **GraphQL Endpoint**: ✅ https://backend.chandlerhardy.com/cryptassist/graphql
- **AI Chat**: ✅ Active with GitHub Llama integration
- **Database**: ✅ PostgreSQL in Docker on OCI
- **SSL/HTTPS**: ✅ Let's Encrypt certificates

### Key Deployment Information

**OCI Server:**
- **IP**: `150.136.38.166`
- **SSH**: `ssh ubuntu@150.136.38.166 -i /Users/chandlerhardy/.ssh/ampere.key`
- **Location**: `/home/ubuntu/crypto-assistant/`
- **Docker Compose**: `docker-compose.backend.yml`

**Environment Variables (Production):**
```bash
# On OCI server in ~/crypto-assistant/.env
CORS_ORIGINS=http://localhost:3000,https://cryptassist.chandlerhardy.com,https://backend.chandlerhardy.com
GITHUB_TOKEN=ghp_*** (configured)
```

**Vercel Environment:**
```bash
NEXT_PUBLIC_GRAPHQL_URL=https://backend.chandlerhardy.com/cryptassist/graphql
```

### Architecture Overview
```
┌─────────────────┐    HTTPS    ┌─────────────────┐    HTTPS    ┌─────────────────┐
│                 │ ──────────► │                 │ ─────────► │                 │
│  User Browser   │             │  Vercel (CDN)   │            │ OCI + nginx +   │
│ cryptassist.    │ ◄────────── │  Custom Domains │ ◄───────── │ Let's Encrypt   │
│ chandlerhardy.  │             │                 │            │ 150.136.38.166  │
│ com             │             │                 │            │                 │
└─────────────────┘             └─────────────────┘            └─────────────────┘
```

### Deploy to OCI
```bash
# Deploy backend to Oracle Cloud
./deploy/deploy-backend-to-oci.sh 150.136.38.166

# Set up SSL certificates (if needed)
./deploy/setup-ssl.sh 150.136.38.166 backend.chandlerhardy.com
```

### Maintenance Commands
```bash
# SSH to server
ssh ubuntu@150.136.38.166 -i /Users/chandlerhardy/.ssh/ampere.key

# Check backend status
cd crypto-assistant && docker-compose -f docker-compose.backend.yml ps

# View backend logs
cd crypto-assistant && docker-compose -f docker-compose.backend.yml logs backend

# Restart backend
cd crypto-assistant && docker-compose -f docker-compose.backend.yml restart backend

# Update backend (redeploy)
./deploy/deploy-backend-to-oci.sh 150.136.38.166
```

## API Examples

### GraphQL Queries

```graphql
# Get cryptocurrency list
query GetCryptocurrencies {
  cryptocurrencies(limit: 50) {
    id
    symbol
    name
    current_price
    price_change_percentage_24h
  }
}

# Get portfolio data
query GetPortfolio($id: String!) {
  portfolio(id: $id) {
    id
    name
    total_value
    assets {
      symbol
      amount
      current_price
      total_value
    }
  }
}
```

### AI Chat Integration

The application includes an intelligent AI assistant powered by GitHub's Llama 3.1 8B model:

```graphql
# Chat with AI assistant
mutation ChatWithAssistant($message: String!, $context: String) {
  chatWithAssistant(message: $message, context: $context)
}
```

**AI Features:**
- 🤖 **Real-time Market Analysis**: Current crypto prices and trends
- 📊 **Portfolio Insights**: Personalized advice based on user holdings
- 💡 **Investment Guidance**: Educational market analysis and strategies
- 🔄 **Context Awareness**: AI receives user portfolio data for personalized responses
- 🎨 **Glassmorphism UI**: Beautiful floating chat widget with blur effects

**AI Configuration:**
- **Model**: GitHub Llama 3.1 8B Instruct
- **Endpoint**: https://models.github.ai/inference
- **Authentication**: GitHub Personal Access Token required
- **Context**: Portfolio data automatically included for personalized advice
- **Rate Limiting**: Managed by GitHub AI API

### Real-time Subscriptions

```graphql
# Subscribe to price updates
subscription PriceUpdates($cryptoIds: [String!]!) {
  priceUpdates(cryptoIds: $cryptoIds) {
    timestamp
    price
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.