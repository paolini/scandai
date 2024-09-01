import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import assert from 'assert'
import randomstring from 'randomstring'

import Poll, {IPoll, IGetPoll, POLL_PIPELINE} from '@/models/Poll'
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
                const entries = await Poll.find({poll_id: poll._id})
                const count = entries.length
                if (!userIsOwnerOrAdmin) return res.status(401).json({error: 'not authorized'})
                if (!poll.closed) return res.status(400).json({error: 'poll not closed'})
                if (count && !user.isAdmin) return res.status(400).json({error: 'poll not empty'})
                for (const entry of entries) {
                    await trashDocument('entries', entry._id)
                }
                await trashDocument('polls', poll._id)
                return res.status(200).json({ deleted: true, entriesDeleted: count })
            } catch(error) {
                return res.status(500).json({error: `${error}`})
            }
        }

        if (req.method === 'PATCH') {
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