'use client';

export function EnvDebug() {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  
  return (
    <div className="fixed top-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
      <div>GraphQL URL: {graphqlUrl || 'NOT SET'}</div>
      <div>Expected: https://crypto-portfolio-backend-b8jm.onrender.com/graphql</div>
    </div>
  );
}