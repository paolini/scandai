import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import assert from 'assert'
import randomstring from 'randomstring'

import Poll, {IPoll, IGetPoll, POLL_PIPELINE} from '@/models/Poll'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        const poll_id = req.query.poll_id as string
        
        const poll = await getPollById(poll_id)
        
        if (!poll) {
            return res.status(404).json({error: 'poll not found'})
        }
        
        // only admins and owners can access poll
        if (!user.isAdmin && user._id !== poll.createdBy.toString()) {
            return res.status(403).json({error: 'not authorized'})
        }

        if (req.method === 'DELETE') {
            const out = await Poll.deleteOne({_id: poll._id})
            return res.status(200).json({ data: out })
        }

        if (req.method === 'PATCH') {
            let body
            try {
                body = JSON.parse(req.body)
            } catch(error) {
                return res.status(400).json({error: 'invalid json'})
            }
            let payload: any = {}
            for (let field of  ['school_id', 'form', 'type', 'class']) {
                if (body[field] === undefined) continue
                payload[field] = body[field]
            }
            if (body['adminSecret'] !== undefined) {
                payload['adminSecret'] = randomstring.generate({length: 6, readable: true})
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