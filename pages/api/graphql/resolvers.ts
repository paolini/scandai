import { Context } from './types'
import { getConfigCollection, getUserCollection, getTranslationCollection } from '@/lib/mongodb'
import { ObjectIdType, JSONType } from './types'
import stats from './resolvers/stats'
import {polls, poll, newPoll, deletePoll, openPoll, closePoll, pollCreateAdminSecret, pollRemoveAdminSecret } from './resolvers/polls'
import schools from './resolvers/schools'
import translations from './resolvers/translations'
import submit from './resolvers/submit'
import { Resolvers, Profile, MutationSetProfileArgs, MutationPostTranslationArgs } from '@/generated/graphql'

export const resolvers: Resolvers<Context> = {
  ObjectId: ObjectIdType,
  JSON: JSONType,

  Query: {
    hello: async (_parent: any, _args: any, context: Context) => {
      return "Hello world!"
    },

    config: async () => {
      const collection = await getConfigCollection()
      const config = await collection.findOne({})
      if (!config) throw Error("config not found")
      return config
    },

    profile: async (_parent: any, _args: any, context: Context): Promise<Profile|null> => {
      if (!context.user) return null
      const sessionUser = context.user
      console.log(`Profile query: sessionUser: ${JSON.stringify(sessionUser)}`)
      const collection = await getUserCollection()
      const user = await collection.findOne({_id: sessionUser._id})
      if (!user) return null
      return user as Profile
    },

    polls,
    poll,
    schools,
    stats,
    translations,
  },

  Mutation: {
    submit,
    setProfile: async (_parent: any, {name, isTeacher, isStudent}: MutationSetProfileArgs, context: Context) => {
      if (!context.user) throw new Error('not authenticated')
      const collection = await getUserCollection()
      const out = await collection.findOneAndUpdate({_id: context.user._id}, {
          $set: {
              name,
              isTeacher,
              isStudent,
          }
      })
      if (!out) throw new Error('user not found')
      return out.value
    },

    newPoll,
    deletePoll,
    openPoll,
    closePoll,
    pollCreateAdminSecret,
    pollRemoveAdminSecret,

    postTranslation: async (_parent: any, params: MutationPostTranslationArgs, context: Context) => {
      const user = context.user
      if (!user) throw new Error('not authenticated')
      if (!user.isAdmin) throw new Error('not authorized')

      const collection = await getTranslationCollection()
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
      const res = await collection.findOne({source: params.source})
      return res
   }

  }
}
