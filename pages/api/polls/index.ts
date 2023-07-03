import { NextApiRequest, NextApiResponse } from 'next'
import randomstring from 'randomstring'

import Poll from '@/models/Poll'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (req.method === 'GET') {
        console.log(`GET query ${JSON.stringify(req.query)}`)
        let filter: any = {}

        // set filters from query parameters
        for (const key of ['school', 'class', 'secret']) {
            if (req.query[key]!==undefined) {
                filter[key] = req.query[key]
            }
        }

        // set filters from user authorization
        if (user) {
            if (!user.isAdmin) {
                // non admin vede solo i suoi poll
                filter['createdBy'] = user._id
            }
        } else {
            // anonymous user can only see public polls
            filter['public'] = true
        }
        
        try {
            const data = await Poll.find(filter)
            return res.status(200).json({ data, filter })
        } catch (error) {
            console.log(`database error: ${error}`)
            return res.status(400).json({ error })
        }
    }
    if (req.method === 'POST') {
        if (!user) {
            return res.status(401).json({ error: 'not authenticated' })
        }
        try {
            const body = JSON.parse(req.body)
            const poll = new Poll({
                school: body.school,
                class: body.class,
                secret: randomstring.generate({length: 6, readable: true}),
                createdBy: user._id,
            })
            const out = await poll.save()
            return res.status(200).json({ data: out })
        } catch (error) {
            return res.status(400).json({ error })
        }
    }
}
  
  