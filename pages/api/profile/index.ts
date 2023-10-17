import { NextApiRequest, NextApiResponse } from 'next'

import User, { IGetUser } from '@/models/User'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const sessionUser = await getSessionUser(req)
        if (!sessionUser) {
            return res.json(null)
            // return res.status(401).json({error: 'not authenticated'})
        }

        if (req.method === 'GET') {
            const user = await User.findOne({_id: sessionUser._id})
            if (!user) {
                return res.json({
                    _id: null,
                    notLoggedIn: true,
                })
            }
            const profile: IGetUser = {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isSuper: user.isSuper,
                isViewer: user.isViewer,
                image: user.image,
            }   
            return res.json(profile)
        }

        if (req.method === 'PATCH') {
            const { name } = JSON.parse(req.body)
            const out = await User.findOneAndUpdate({_id: sessionUser._id}, {name})
            if (!out) {
                return res.status(404).json({error: 'not found'})
            }
            return res.json({ok: true})
        }
    }