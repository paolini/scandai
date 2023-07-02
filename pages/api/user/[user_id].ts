import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

import User from '@/models/User'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req, res)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        if (!user.isAdmin) {
            return res.status(403).json({error: 'not authorized'})
        }
        const user_id = req.query.user_id as string

        const aUser = await User.find({_id: new ObjectId(user_id)})

        if (req.method === 'GET') {
            return res.json({data: aUser})
        }

        if (req.method === 'PATCH') {
            if ('isAdmin' in req.body) {
                aUser[0].isAdmin = req.body.isAdmin
                await aUser[0].save()
                return res.json({data: aUser})
            }
        }
    }