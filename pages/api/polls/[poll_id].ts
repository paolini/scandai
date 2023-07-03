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
        if (!user.isAdmin && !user._id.equals(poll.createdBy)) {
            return res.status(403).json({error: 'not authorized'})
        }

        if (req.method === 'DELETE') {
            const out = await Poll.deleteOne({_id: poll._id})
            return res.status(200).json({ data: out })
        }
    }