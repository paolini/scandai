import { Context } from './types'
import { getConfigCollection, getUserCollection, getTranslationCollection } from '@/lib/mongodb'
import { ObjectIdType, JSONType } from './types'
import stats from './resolvers/stats'
import {polls, poll, newPoll, deletePoll, openPoll, closePoll, pollCreateAdminSecret, pollRemoveAdminSecret, pollsRemoveAdminSecrets } from './resolvers/polls'
import schools from './resolvers/schools'
import {translations, postTranslation} from './resolvers/translations'
import submit from './resolvers/submit'
import {users, profile, setProfile, newUser, patchUser} from './resolvers/users'
import { Resolvers } from '@/generated/graphql'

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

    profile,

    polls,
    poll,
    schools,
    stats,
    translations,
    users,
  },

  Mutation: {
    submit,

    setProfile,
    newUser,
    patchUser,

    newPoll,
    deletePoll,
    openPoll,
    closePoll,
    pollCreateAdminSecret,
    pollRemoveAdminSecret,
    pollsRemoveAdminSecrets,

    postTranslation,
  }
}
