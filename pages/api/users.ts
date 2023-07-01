import { NextApiRequest, NextApiResponse } from 'next'

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
        const users = await User.find({})

        return res.json({data: users})
    }