import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import type { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

import { Context } from './types'
import { resolvers } from './resolvers'
import { typeDefs } from './typedefs'
import type { MongoUser } from '@/lib/mongodb'
import { auth } from '@/lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import { getUserCollection } from '@/lib/mongodb'

const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
})

const handler = startServerAndCreateNextHandler<NextRequest,Context>(server, {
    context: async (req, res): Promise<Context> => { 
      const ctx: Context = { req, res }
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: fromNodeHeaders((req as any).headers),
      })
      
      if (!session?.user?.id) {
        return ctx
      }

      // Fetch the full user from MongoDB
      const collection = await getUserCollection()
      const dbUser = await collection.findOne({ _id: new ObjectId(session.user.id) })
      
      if (!dbUser) {
        return ctx
      }

      return { 
        ...ctx,
        user: dbUser,
      }
    } catch (err) {
      throw err;
    }
  }
});

export default handler;
