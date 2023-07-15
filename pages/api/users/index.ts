import { NextApiRequest, NextApiResponse } from 'next'
import randomstring from 'randomstring'

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
        if (req.method === 'GET') {
            const users = await User.find({})
            return res.json({data: users})
        }
        if (req.method === 'POST') {
            const {name, username, email} = req.body
            const password = randomstring.generate({length: 6, readable: true})
            const newUser = new User({name, username, email, password, isAdmin: false})
            const out = await newUser.save()
            return res.json({data: out, password})
        }
    }