import {ObjectId} from 'mongodb'
import randomstring from 'randomstring'

import {Context} from '../types'
import {schoolYearMatch} from '@/lib/utils'
import {getCollection} from '@/lib/mongodb'
import {MutationNewPollArgs, Poll, QueryPollsArgs} from '@/generated/graphql'

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

export async function polls(_parent: any, params: QueryPollsArgs, context: Context): Promise<Poll[]> {
    const { user } = context
    const $match: any = {}

    if (params._id) $match._id = new ObjectId(params._id)      
    if (params.adminSecret) $match.adminSecret = params.adminSecret

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
    return data as Poll[]
}

export async function newPoll(_parent: any, data: MutationNewPollArgs, context: Context) {
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

/*
export async function patchPoll(_parent: any, data: {
        _id: ObjectId,
        form?: string, 
        year?: string,
        class?: string,
        school?: ObjectId,
        closed?: boolean,
        closedAt?: Date,
        adminSecret?: string,
        }, context: Context) {
    if (!context.user) throw new Error('not authenticated')
    const collection = await getCollection("polls")
    const poll = await collection.findOne({_id: data._id})
    if (!poll) throw new Error(`poll not found _id: ${data._id}`)
    
        const adminSecret = req.query.secret
        const poll_id = req.query.poll_id

        if (typeof poll_id !== 'string') return res.status(400).json({error: 'invalid poll_id'})  
        if (Array.isArray(adminSecret)) return res.status(400).json({error: 'invalid secret'})

        const poll = await getPollById(poll_id)

        if (!poll) {
            return res.status(404).json({error: 'poll not found'})
        }

        const userKnowsSecret = (poll.adminSecret && poll.adminSecret === adminSecret)
        const userIsOwnerOrAdmin = user && (user.isAdmin || user._id == poll.createdBy.toString()) 

        if (!userKnowsSecret && !userIsOwnerOrAdmin) {
            return res.status(401).json({error: 'not authorized'})
        }

        let body
        try {
            body = JSON.parse(req.body)
        } catch(error) {
            return res.status(400).json({error: 'invalid json'})
        }
        let payload: any = {}
        console.log(`PATCH ${poll_id} ${JSON.stringify(body)}`)
        if (userIsOwnerOrAdmin) {
            for (let field of  ['school_id', 'form', 'type', 'class', 'year']) {
                if (body[field] === undefined) continue
                payload[field] = body[field]
            }
            if (body.adminSecret !== undefined) {
                payload['adminSecret'] = body.adminSecret 
                    ? randomstring.generate({length: 6, readable: true})
                    : ''
            }
        }
        
        if (body.closed !== undefined) {
            if (body.closed && !poll.closed) {
                payload.date = new Date()
            }
            payload.closed = body.closed
        }
        const out = await Poll.updateOne({_id: poll._id}, payload)
        return res.json({data: out})
}
        */