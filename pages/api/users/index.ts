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
            const users = await User.aggregate([
                {$project: {
                    password: 0,
                }},
                {$lookup: { 
                    from: "accounts", 
                    as: "accounts", 
                    localField: "_id", 
                    foreignField: "userId",
                    pipeline:[{
                        $project:{
                            provider:1,
                            _id:0
                    }}]
                }}
            ])
            return res.json({data: users})
        }
        if (req.method === 'POST') {
            const {name, username, email} = JSON.parse(req.body)
            const newUser = new User({name, username, email, isAdmin: false})
            // console.log(`creating new User: ${newUser}`)
            const out = await newUser.save()
            return res.json(out)
        }
    }