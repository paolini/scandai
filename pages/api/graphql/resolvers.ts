import { ObjectId } from 'mongodb'
import randomstring from 'randomstring'

import { Context } from './types'
import { getCollection } from '@/lib/mongodb'
import { ObjectIdType, JSONType } from './types'
import stats from './resolvers/stats'
import polls from './resolvers/polls'
import schools from './resolvers/schools'
import translations from './resolvers/translations'

export const resolvers = {
  ObjectId: ObjectIdType,
  JSON: JSONType,

  Query: {
    hello: async (_parent: any, _args: any, context: Context) => {
      return "Hello world!"
    },

    config: async () => {
      const collection = await getCollection("configs")
      const config = await collection.findOne({})
      return config
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
    setProfile: async (_parent: any, {name, isTeacher, isStudent}: {name: string, isTeacher: boolean, isStudent: boolean}, context: Context) => {
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
      return
    },

    newPoll: async(_parent: any, data: {
      form: string, 
      year: string,
      class: string,
      school: ObjectId,
    }, context: Context) => {
      if (!context.user) throw new Error('not authenticated')
      const collection = await getCollection("polls")
      let secret
      for(;;) {
        secret = randomstring.generate({length: 6, readable: true})
        const duplicate = await collection.findOne({secret})
        if (duplicate === null) break
      }
      const schoolCollection = await getCollection("schools")
      const school = await schoolCollection.findOne({_id: new ObjectId(data.school)})
      if (!school) throw new Error(`school not found _id: ${data.school}`)

      const result = await collection.insertOne({
          school_id: school._id,
          "class": data.class,
          year: data.year,
          form: data.form,
          secret,
          createdBy: context.user._id,
          date: new Date(),
      })
      return result.insertedId
    }
  }
}
