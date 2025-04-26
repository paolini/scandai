import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

import { Context } from './types'
import { resolvers } from './resolvers'
import { typeDefs } from './typedefs'

const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
})

const handler = startServerAndCreateNextHandler<NextRequest,Context>(server, {
    context: async (req, res): Promise<Context> => { 
      console.log("🔵 Ricevuta richiesta su /api/graphql");
      const ctx: Context = { req, res }
    try {
      const token = await getToken({ req })
      console.log("🟡 Token ricevuto:", token);
      
      if (!token || !token.dbUser) {
        console.log("🟠 Nessun utente loggato");
        return ctx
      }

      const db_user = token.dbUser
      const user = {
        ...db_user,
        _id: new ObjectId(db_user._id),
      }
      console.log("🟢 Utente autenticato:", user);

      return { 
        ...ctx,
        user,
      }
    } catch (err) {
      console.error("🔴 Errore in context GraphQL:", err);
      throw err;
    }
  }
});

export default handler;

// export { handler as GET, handler as POST };
