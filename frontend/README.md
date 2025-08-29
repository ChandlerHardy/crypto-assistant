# Crypto Assistant Frontend

Next.js frontend for the crypto portfolio tracking application.

## Live Application

**Production:** [https://cryptassist.chandlerhardy.com](https://cryptassist.chandlerhardy.com)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/cryptassist/graphql
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Production Configuration

**Environment Variables:**
- `NEXT_PUBLIC_GRAPHQL_URL`: Points to GraphQL backend endpoint
  - **Local**: `http://localhost:8000/cryptassist/graphql`
  - **Production**: `https://backend.chandlerhardy.com/cryptassist/graphql`

## Architecture

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **Data Fetching**: Apollo Client for GraphQL
- **Charts**: Plotly.js and Recharts
- **Forms**: React Hook Form + Zod validation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The frontend is deployed on Vercel with automatic deployments from the main branch.

**Custom Domain Setup:**
1. Add `cryptassist.yourdomain.com` in Vercel project settings
2. Configure CNAME DNS record pointing to `cname.vercel-dns.com`
3. Update `NEXT_PUBLIC_GRAPHQL_URL` environment variable

## Related

- **Backend**: FastAPI GraphQL server at `backend.chandlerhardy.com`
- **Portfolio**: Personal portfolio at `chandlerhardy.com`
