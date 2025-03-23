import { NextApiRequest, NextApiResponse } from 'next'
import randomstring from 'randomstring'
import { ObjectId } from 'mongodb'

import Poll from '@/models/Poll'
import School from '@/models/School'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (req.method === 'GET') {
    }
    if (req.method === 'POST') {
        if (!user) {
            return res.status(401).json({ error: 'not authenticated' })
        }
        try {
            let secret
            for(;;) {
                secret = randomstring.generate({length: 6, readable: true})
                const duplicate = await Poll.findOne({secret})
                if (duplicate === null) break
            }
            const body = JSON.parse(req.body)
            console.log("POST", JSON.stringify({body}))
            const school = await School.findOne({_id: new ObjectId(body.school_id)})
            if (!school) return res.status(400).json({error: `school not found _id: ${body.school_id}`})
            const poll = new Poll({
                school_id: school._id,
                class: body.class,
                year: body.year,
                form: body.form,
                secret,
                createdBy: user._id,
                date: new Date(),
            })
            const out = await poll.save()
            console.log(JSON.stringify({
                out,
                'year': poll.year,
            }))
            return res.status(200).json({ data: out })
        } catch (error) {
            console.error(error)
            return res.status(400).json({ error })
        }
    }
}
  
  