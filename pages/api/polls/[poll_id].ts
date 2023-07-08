import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

import Poll, {IPoll} from '@/models/Poll'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        const poll_id = req.query.poll_id as string
        
        const poll = await Poll.findOne({_id: new ObjectId(poll_id)})
        
        if (poll === null) {
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
            if (body.closed !== undefined) {
                if (body.closed && !poll.closed) {
                    poll.date = new Date()
                }
                poll.closed = body.closed
            }
            console.log('patch poll', poll)
            const out = await poll.save()
            console.log('out', out)
            return res.json({data: out})
        }

    }