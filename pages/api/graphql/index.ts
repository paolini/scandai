import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

import { Context } from './types'
import { resolvers } from './resolvers'
import { typeDefs } from './typedefs'

const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
})

console.log('server', server)
console.log(`resolvers`, resolvers)

const handler = startServerAndCreateNextHandler<NextRequest,Context>(server, {
    context: async (req, res): Promise<Context> => { 
      const ctx: Context = { req, res }
      const token = await getToken({ req })
      if (!token || !token.dbUser) return ctx // not logged in
      const user = token.dbUser
      return { 
        ...ctx,
        user,
      }
    }
});

export default handler;

// export { handler as GET, handler as POST };
