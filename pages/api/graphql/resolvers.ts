import { ObjectId } from 'mongodb'

import { Context } from './types'
import clientPromise from '@/lib/mongodb'
import { ObjectIdType } from './types'
import { schoolYearMatch } from '@/lib/utils'

export const POLL_PIPELINE = [
  { $lookup: {
      from: 'users',
      localField: 'createdBy',
      foreignField: '_id',
      as: 'createdBy',
      pipeline: [
          { $project: {
              _id: 1,
              name: 1,
              email: 1,
              image: 1,
              username: 1,
          }}
      ]
  }},
  // createdBy could be null if 
  // the user has been deleted
  {
      $addFields: {
          createdBy: { $arrayElemAt: [ '$createdBy', 0 ] }
      }
  },
  // add school information
  {
      $lookup: {
          from: "schools", // The name of the School collection
          localField: "school_id", // The field in the Poll collection
          foreignField: "_id", // The field in the School collection
          as: "school" // The field to store the matched school
      }
  },
  {
      $addFields: {
          school: { $arrayElemAt: [ "$school", 0 ] }
      }
  },
  // count the number of entries
  // related to the poll
  {
      $lookup: {
        from: "entries", // The name of the Entry collection
        localField: "_id", // The field in the Poll collection
        foreignField: "pollId", // The field in the Entry collection
        as: "entries" // The field to store the matched entries
      }
  },
  {
      $project: {
          _id: 1,
          school: 1,
          class: 1,
          year: 1,
          form: 1,
          secret: 1,
          adminSecret: 1,
          createdAt: 1,
          createdBy: 1,
          closedAt: 1,
          closed: 1,
          date: 1,
          entriesCount: { $size: "$entries" } // Calculate the size of the entryCount array
      }
  }            
]


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
    },

    polls: async (_parent: any, params: {
        _id?: ObjectId
        school_id?: ObjectId, 
        year?: number, 
        class?: string,
        secret?: string,
        adminSecret?: string,
      }, context: Context) => {
      const { user } = context
      const $match: any = {...params}
      if ($match.year) $match.year = schoolYearMatch($match.year)

      // se ho specificato un secret o un adminSecret
      // posso vedere solo quella poll 
      // ma non ho bisogno di essere autenticato            
      if (!$match.secret && !$match.adminSecret) {
        // set filters from user authorization
        if (user) {
            if (!user.isAdmin) {
                // non admin vede solo i suoi poll                
                $match['createdBy'] = new ObjectId(user._id)
            }
        } else {
            // anonymous user can only see public polls
            // or get a specific poll by secret
            $match['public'] = true
        }
      }

      const pipeline:any = [
          { $match },
          ...POLL_PIPELINE,
      ]

      const db = (await clientPromise).db()
      const collection = db.collection("polls")        
      return await collection.aggregate(pipeline).toArray()
    },
  },

  Mutation: {
    setProfile: async (_parent: any, {name, isTeacher, isStudent}: {name: string, isTeacher: boolean, isStudent: boolean}, context: Context) => {
      if (!context.user) throw new Error('not authenticated')
      const db = (await clientPromise).db()
      const collection = db.collection("users")
      const out = await collection.findOneAndUpdate({_id: context.user._id}, {
          $set: {
              name,
              isTeacher,
              isStudent,
          }
      })
      if (!out) throw new Error('user not found')
      return
    }
  }
}
