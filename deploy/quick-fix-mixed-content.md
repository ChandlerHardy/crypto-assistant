# Quick Fix for Mixed Content Issue

## Problem
Your Vercel app (HTTPS) is trying to connect to your OCI backend (HTTP), which browsers block as "mixed content".

## Immediate Solutions

### Option 1: Browser Override (Testing Only)
**Chrome/Edge:**
1. Click the shield icon in address bar
2. Click "Load unsafe scripts"
3. Refresh the page

**Firefox:**
1. Click the shield icon
2. Click "Disable protection for now"

### Option 2: Update GraphQL Client (Better)
Add this to your Apollo Client configuration in `frontend/src/lib/apollo-client.ts`:

```typescript
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  // Add this for HTTP backends from HTTPS sites
  fetchOptions: {
    mode: 'cors',
  },
});

// Or use this workaround for development
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  // Add this line for development
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' }
  }
});
```

### Option 3: Use ngrok for HTTPS tunnel (Quick)
```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Create HTTPS tunnel to your OCI backend
ngrok http 150.136.38.166:8000

# Use the https:// URL in your Vercel environment variable
```

## Permanent Solutions

### Best: Set up SSL on OCI
1. Get a domain name (free options: freenom.com, dot.tk)
2. Point DNS to your OCI IP (150.136.38.166)
3. Run: `./deploy/setup-ssl.sh 150.136.38.166 yourdomain.com`
4. Update Vercel: `NEXT_PUBLIC_GRAPHQL_URL=https://yourdomain.com/graphql`

### Alternative: Use Vercel API Routes as Proxy
Create a proxy in your Next.js frontend to forward requests to your HTTP backend.