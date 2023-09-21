import { NextApiRequest, NextApiResponse } from 'next'
import randomstring from 'randomstring'
import { ObjectId } from 'mongodb'

import Poll, {POLL_PIPELINE} from '@/models/Poll'
import School from '@/models/School'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (req.method === 'GET') {
        console.log(`GET query ${new Date().toISOString()} ${JSON.stringify(req.query)}`)
        let $match: any = {}

        // set filters from query parameters
        for (const key of ['school', 'class', 'secret', 'adminSecret']) {
            if (req.query[key]!==undefined) {
                $match[key] = req.query[key]
            }
        }
        if (req.query._id!==undefined) {
            $match['_id'] = new ObjectId(req.query._id as string)
        }
        // set filters from user authorization
        if (user) {
            if (!user.isAdmin) {
                // non admin vede solo i suoi poll
                $match['createdBy'] = new ObjectId(user._id)
            }
        } else {
            // anonymous user can only see public polls
            // or get a specific poll by secret
            if (!$match.secret && !$match.adminSecret) {
                // attualmente "public" non è valorizzato
                // quindi si otterrà sempre un array vuoto
                $match['public'] = true
            } else {
                // otterrò solamente i poll con il secret o l'adminSecret specificato
            }
        }

        const pipeline = [
            { $match },
            ...POLL_PIPELINE,
        ]
        
        // console.log('Poll pipeline', JSON.stringify(pipeline))
        try {
            const data = await Poll.aggregate(pipeline)
            return res.status(200).json({ data, filter: $match })
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
            let secret
            for(;;) {
                secret = randomstring.generate({length: 6, readable: true})
                const duplicate = await Poll.findOne({secret})
                if (duplicate === null) break
            }
            const body = JSON.parse(req.body)
            const school = await School.findOne({_id: new ObjectId(body.school_id)})
            if (!school) return res.status(400).json({error: `school not found _id: ${body.school_id}`})
            const poll = new Poll({
                school_id: school._id,
                class: body.class,
                form: body.form,
                secret,
                createdBy: user._id,
                date: new Date(),
            })
            const out = await poll.save()
            return res.status(200).json({ data: out })
        } catch (error) {
            console.error(error)
            return res.status(400).json({ error })
        }
    }
}
  
  