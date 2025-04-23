import {ObjectId} from 'mongodb'
import randomstring from 'randomstring'

import {Context} from '../types'
import {schoolYearMatch} from '@/lib/utils'
import {getCollection, getPollCollection, trashDocument} from '@/lib/mongodb'
import {MutationNewPollArgs, Poll, QueryPollArgs, QueryPollsArgs, MutationOpenPollArgs, MutationClosePollArgs, MutationPollCreateAdminSecretArgs, MutationPollRemoveAdminSecretArgs, MutationDeletePollArgs, MutationPollsRemoveAdminSecretsArgs, Profile} from '@/generated/graphql'

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

export async function polls(_parent: any, {year}: QueryPollsArgs, context: Context): Promise<Poll[]> {
    const { user } = context
    const $match: any = {}

    if (year) $match.date = schoolYearMatch(year)

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

    const pipeline:any = [
        { $match },
        ...POLL_PIPELINE,
    ]

    const collection = await getCollection("polls")
    const data = await collection.aggregate(pipeline).toArray()
    return data as Poll[]
}

export async function poll(_parent: any, {_id, adminSecret, secret}: QueryPollArgs, context: Context): Promise<Poll> {
    const { user } = context
    const $match: any = {}

    if (_id) $match._id = new ObjectId(_id)      
    if (adminSecret) $match.adminSecret = adminSecret
    if (secret) $match.secret = secret

    // se ho specificato un secret o un adminSecret
    // posso vedere solo quella poll 
    // ma non ho bisogno di essere autenticato            
    if (!secret && !adminSecret) {
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

    if (!_id && !secret) throw Error(`"_id" or "secret" required`)

    const pipeline:any = [
        { $match },
        ...POLL_PIPELINE,
    ]

    const collection = await getCollection("polls")
    const data = await collection.aggregate(pipeline).toArray()
    if (data.length===0) throw Error("not found")
    if (data.length>1) throw Error("multiple objects")
    return data[0] as Poll
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

    const date = new Date()

    const result = await collection.insertOne({
        school_id: school._id,
        "class": data.class,
        year: data.year,
        form: data.form,
        secret,
        createdAt: date,
        createdBy: context.user._id,
        date: date,
    })
    return result.insertedId
}

export async function deletePoll(_parent: any, {_id}: MutationDeletePollArgs, {user}: Context) {
    console.log(`deletePoll ${_id}`)
    if (!user) throw new Error('not authenticated')
    const collection = await getPollCollection()
    const poll = await collection.findOne({_id})
    if (!poll) throw new Error(`poll not found`)
    const userIsOwnerOrAdmin = user.isAdmin || user._id == poll.createdBy

    if (!userIsOwnerOrAdmin) throw Error('not authorized')
    await trashDocument(collection, _id)
    return true
}

async function getPoll(_id: ObjectId, secret: string|null, user: Profile|undefined) {
    if (!user) throw new Error('not authenticated')
    const collection = await getPollCollection()
    const poll = await collection.findOne({_id})
    if (!poll) throw new Error(`poll not found`)
    
    const userKnowsSecret = poll.adminSecret && poll.adminSecret === secret
    const userIsOwnerOrAdmin = user.isAdmin || user._id == poll.createdBy

    if (!userKnowsSecret && !userIsOwnerOrAdmin) throw Error('not authorized')

    return {
        collection,
        poll,
        userKnowsSecret,
        userIsOwnerOrAdmin
    }
}

export async function openPoll(_parent: any, {_id,secret}: MutationOpenPollArgs, {user}: Context) {
    const { collection, poll, userKnowsSecret, userIsOwnerOrAdmin } = await getPoll(_id, secret, user)

    if (!userKnowsSecret && !userIsOwnerOrAdmin) throw Error('not authorized')

    if (!poll.closed) return false

    const closed = false

    const out = await collection.updateOne({_id}, {$set: {closed}})

    return out.modifiedCount > 0
}

export async function closePoll(_parent: any, {_id,secret}: MutationClosePollArgs, {user}: Context) {
    const { collection, poll, userKnowsSecret, userIsOwnerOrAdmin } = await getPoll(_id, secret, user)

    if (!userKnowsSecret && !userIsOwnerOrAdmin) throw Error('not authorized')

    if (poll.closed) return false

    const date = new Date()
    const closed = true

    const out = await collection.updateOne({_id}, {
        $set: {closed, date}
    })

    return out.modifiedCount > 0
}

export async function pollCreateAdminSecret(_parent: any, {_id, secret}: MutationPollCreateAdminSecretArgs, {user}: Context) {
    const { collection, userIsOwnerOrAdmin } = await getPoll(_id, secret, user)
    if (!userIsOwnerOrAdmin) throw Error('not authorized')
    const adminSecret = randomstring.generate({length: 6, readable: true})
    const out = await collection.updateOne({_id},{$set:{adminSecret}})
    return out.modifiedCount > 0
}

export async function pollRemoveAdminSecret(_parent: any, {_id,secret}: MutationPollRemoveAdminSecretArgs, {user}: Context) {
    const { collection, userIsOwnerOrAdmin } = await getPoll(_id, secret, user)
    if (!userIsOwnerOrAdmin) throw Error('not authorized')
    const out = await collection.updateOne({_id},{$set: {adminSecret: ''}})
    return out.modifiedCount > 0
}

export async function pollsRemoveAdminSecrets(_parent: any, {year}: MutationPollsRemoveAdminSecretsArgs, {user}: Context) {
    if (!user) throw Error("not authenticated")
    if (!user.isSuper) throw Error("not authorized")
    const $match: any = { adminSecret: {$exists: true}}
    if (year) $match.date = schoolYearMatch(year)
    const collection = await getPollCollection()
    const result = await collection.updateMany(
        $match,
        { $unset: {adminSecret: ""}})
    return result.modifiedCount
}