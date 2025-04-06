import {ObjectId} from 'mongodb'

import {Context} from '../types'
import {schoolYearMatch} from '@/lib/utils'
import {getCollection} from '@/lib/mongodb'

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

export default async function resolver(_parent: any, params: {
        _id?: ObjectId
        school_id?: ObjectId, 
        year?: number, 
        class?: string,
        secret?: string,
        adminSecret?: string,
      }, context: Context) {
      const { user } = context
      const $match: any = {}

      if (params._id) $match._id = new ObjectId(params._id)      
      if (params.secret) $match.secret = params.secret
      if (params.adminSecret) $match.adminSecret = params.adminSecret
      if (params.class) $match.class = params.class
      if (params.school_id) $match.school_id = new ObjectId(params.school_id)

      if (params.year) $match.date = schoolYearMatch(params.year)

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

      const collection = await getCollection("polls")
      const data = await collection.aggregate(pipeline).toArray()
      return data
    }