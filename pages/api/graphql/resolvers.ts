import { ObjectId } from 'mongodb'

import { Context } from './types'
import clientPromise from '@/lib/mongodb'
import { ObjectIdType } from './types'


export const resolvers = {
  ObjectId: ObjectIdType,

  Query: {
    hello: async (_parent: any, _args: any, context: Context) => {
      return "Hello world!"
    },

    config: async () => {
      const db = (await clientPromise).db()
      const collection = db.collection("configs")
      const config = await collection.findOne({})
      return config
    },

    profile: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) return null      
      const sessionUser = context.user
      console.log(`Profile query: sessionUser: ${JSON.stringify(sessionUser)}`)
      const db = (await clientPromise).db()
      const user = await db.collection("users").findOne({_id: sessionUser._id})
      return user
    }
  },

  Mutation: {
    profile: async (_parent: any, {name, isTeacher, isStudent}: {name: string, isTeacher: boolean, isStudent: boolean}, context: Context) => {
      if (!context.user) throw new Error('not authenticated')
      const db = (await clientPromise).db()
      const collection = db.collection("users")
      const out = await collection.findOneAndUpdate({_id: context.user._id}, {
          name,
          isTeacher,
          isStudent,
      })
      if (!out) throw new Error('user not found')
      return
  }
  }
}
