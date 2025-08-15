# Crypto Portfolio Analyzer

A real-time cryptocurrency portfolio tracking and analysis application built with Next.js, FastAPI, and GraphQL.

## Features

- 🚀 **Real-time Updates**: Live cryptocurrency price tracking via WebSocket connections
- 📊 **Data Visualization**: Interactive charts using Plotly.js and Recharts
- 💼 **Portfolio Management**: Track multiple portfolios with detailed analytics
- 🔍 **Risk Analysis**: Portfolio optimization algorithms and risk assessment
- ⚡ **GraphQL API**: Efficient data fetching with Apollo Client caching
- 🎨 **Modern UI**: Responsive design with Tailwind CSS and Radix UI

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Apollo Client** for GraphQL and caching
- **Tailwind CSS** + **Radix UI** for styling
- **Plotly.js** + **Recharts** for data visualization
- **React Hook Form** + **Zod** for form handling

### Backend
- **FastAPI** with **Strawberry GraphQL**
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
- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:8000/graphql
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
SECRET_KEY=your-secret-key
```

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8000/graphql
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