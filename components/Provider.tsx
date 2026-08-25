import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const apolloClient = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache()
  })
  
export default function Provider({children}:{
    children: React.ReactNode
}) {
    // Better Auth doesn't need a session provider wrapper like next-auth
    // Session is fetched directly via authClient.useSession() hook
    return <ApolloProvider client={apolloClient}>
        {children}
    </ApolloProvider>
}

