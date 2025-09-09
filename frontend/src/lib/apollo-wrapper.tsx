'use client';

import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

function makeClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/cryptassist/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      }
    }
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}