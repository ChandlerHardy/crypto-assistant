# Crypto Portfolio Analyzer - Backend

FastAPI backend with GraphQL for real-time cryptocurrency portfolio tracking and analysis.

## Features

- **FastAPI** with **GraphQL** (Strawberry)
- Real-time WebSocket connections for live price updates
- Portfolio optimization algorithms
- Risk analysis tools
- Integration with multiple crypto APIs (CoinGecko, CoinMarketCap)
- PostgreSQL database with SQLAlchemy ORM
- Redis for caching and session management
- Celery for background tasks

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

**Production:**
- **GraphQL Playground**: https://backend.chandlerhardy.com/cryptassist/graphql
- **Health Check**: https://backend.chandlerhardy.com/health
- **API Root**: https://backend.chandlerhardy.com

**Local Development:**
- **GraphQL Playground**: http://localhost:8000/cryptassist/graphql
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── api/          # API routes and endpoints
│   ├── core/         # Core configuration and utilities
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # GraphQL schemas and resolvers
│   ├── services/     # Business logic and external API integrations
│   └── utils/        # Utility functions
├── tests/            # Test files
└── requirements.txt  # Dependencies
```