import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

import User from '@/models/User'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        if (!user.isAdmin) {
            return res.status(403).json({error: 'not authorized'})
        }
        const user_id = req.query.user_id as string

        const aUser = await User.findOne({_id: new ObjectId(user_id)})

        if (req.method === 'GET') {
            return res.json({data: aUser})
        }

        if (req.method === 'PATCH') {
        }

        if (req.method === 'DELETE') {
            try {
                await User.deleteOne({_id: new ObjectId(user_id)})
                return res.json({})
            } catch(error) {
                return res.status(400).json({error: 'invalid id'})
            }
        }

        return res.status(405).json({error: 'method not allowed'})
    }