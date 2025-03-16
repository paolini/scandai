import clientPromise from "../../../lib/mongodb"
import { ObjectId } from 'mongodb'

import { Context } from './types'

export const resolvers = {
  Query: {
    hello: async (_parent: any, _args: any, context: Context) => {
      console.log(`====> hello`)
      return "Hello world!"
    }
  },
}