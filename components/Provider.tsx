import { SessionProvider } from 'next-auth/react'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const apolloClient = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
  })
  
export default function Provider({children}:{
    children: React.ReactNode
}) {
    return <SessionProvider>
        <ApolloProvider client={apolloClient}>
                {children}
        </ApolloProvider>
    </SessionProvider>
}

