import { Context } from './types'
import { getConfigCollection } from '@/lib/mongodb'
import { ObjectIdType, JSONType } from './types'
import stats from './resolvers/stats'
import {polls, poll, newPoll, deletePoll, openPoll, closePoll, pollCreateAdminSecret, pollRemoveAdminSecret, pollsRemoveAdminSecrets } from './resolvers/polls'
import {translations, postTranslation} from './resolvers/translations'
import submit from './resolvers/submit'
import {users, profile, setProfile, newUser, patchUser, deleteUser} from './resolvers/users'
import { Resolvers } from '@/generated/graphql'
import {schools,school,newSchool,patchSchool,schoolCreateSecret,schoolRemoveSecret} from './resolvers/schools'
import {dict,addDict} from './resolvers/dict'
import {entry, entries, deleteEntry} from './resolvers/entry'

export const resolvers = {
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
    stats,
    users,
    schools,
    school,
    dict,
    translations,
    entries,
    entry,
  },

  Mutation: {
    submit,

    setProfile,
    newUser,
    patchUser,
    deleteUser,

    newPoll,
    deletePoll,
    openPoll,
    closePoll,
    pollCreateAdminSecret,
    pollRemoveAdminSecret,
    pollsRemoveAdminSecrets,

    newSchool,
    patchSchool,
    schoolCreateSecret,
    schoolRemoveSecret,

    addDict,

    postTranslation,

    deleteEntry,
  },

  Account: {
    provider: (parent: any) => parent.provider || null,
    __resolveType: (obj: any) => {
      if (obj.provider) {
        return 'Account'
      }
      return null
    }
  },
} satisfies Partial<Resolvers<Context>>
