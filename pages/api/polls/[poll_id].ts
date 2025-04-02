import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import assert from 'assert'

import Poll, {IPoll, IGetPoll} from '@/models/Poll'
import { POLL_PIPELINE } from '../graphql/resolvers'
import getSessionUser from '@/lib/getSessionUser'
import { trashDocument } from '@/lib/mongodb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
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

        if (req.method === 'DELETE') {
            try {
            } catch(error) {
                return res.status(500).json({error: `${error}`})
            }
        }

        if (req.method === 'PATCH') {
        }

    }

async function getPollById(id: string | ObjectId): Promise<IGetPoll|null> {
    const polls = await Poll.aggregate([
        { $match: {_id: new ObjectId(id)}},
        ...POLL_PIPELINE,
    ])
    
    if (polls.length === 0) return null

    assert (polls.length === 1, 'polls.length === 1')
    return polls[0]
}