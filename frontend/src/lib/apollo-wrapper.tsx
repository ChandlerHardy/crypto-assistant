'use client';

import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

function makeClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        // Add auth headers here if needed
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