import { Context } from './types'
import { getCollection } from '@/lib/mongodb'
import { ObjectIdType, JSONType } from './types'
import stats from './resolvers/stats'
import {polls, newPoll} from './resolvers/polls'
import schools from './resolvers/schools'
import translations from './resolvers/translations'
import { Resolvers, Config, MutationSetProfileArgs, User, MutationPostTranslationArgs, Translation } from '@/generated/graphql'

export const resolvers: Resolvers<Context> = {
  ObjectId: ObjectIdType,
  JSON: JSONType,

  Query: {
    hello: async (_parent: any, _args: any, context: Context) => {
      return "Hello world!"
    },

    config: async (): Promise<Config | null> => {
      const collection = await getCollection("configs")
      const config = await collection.findOne({})
      if (!config) return null
      return config as Config
    },

    profile: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) return null      
      const sessionUser = context.user
      console.log(`Profile query: sessionUser: ${JSON.stringify(sessionUser)}`)
      const collection = await getCollection("users")
      const user = await collection.findOne({_id: sessionUser._id})
      return user
    },

    polls,
    schools,
    stats,
    translations,
  },

  Mutation: {
    setProfile: async (_parent: any, {name, isTeacher, isStudent}: MutationSetProfileArgs, context: Context) => {
      if (!context.user) throw new Error('not authenticated')
      const collection = await getCollection("users")
      const out = await collection.findOneAndUpdate({_id: context.user._id}, {
          $set: {
              name,
              isTeacher,
              isStudent,
          }
      })
      if (!out) throw new Error('user not found')
      return out as User
    },

    newPoll,

    postTranslation: async (_parent: any, params: MutationPostTranslationArgs, context: Context) => {
      const user = context.user
      if (!user) throw new Error('not authenticated')
      if (!user.isAdmin) throw new Error('not authorized')

      const collection = await getCollection("translations")
      let translation = await collection.findOne({source: params.source})
      if (translation) {
        await collection.updateOne({source: params.source}, {
            $set: {
                map: {
                    ...translation.map,
                    ...params.map,
                }
            }
        })
      } else {
        await collection.insertOne({
            source: params.source,
            map: params.map,
        })
      }
      return await collection.findOne({source: params.source}) as Translation
   }

  }
}
