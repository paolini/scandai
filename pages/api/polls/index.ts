import { NextApiRequest, NextApiResponse } from 'next'
import randomstring from 'randomstring'
import { ObjectId } from 'mongodb'

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
        if (req.query._id!==undefined) {
            filter['_id'] = new ObjectId(req.query._id as string)
        }
        // set filters from user authorization
        if (user) {
            if (!user.isAdmin) {
                // non admin vede solo i suoi poll
                filter['createdBy'] = new ObjectId(user._id)
            }
        } else {
            // anonymous user can only see public polls
            // or get a specific poll by secret
            if (req.query.secret===undefined) {
                // attualmente "public" non è valorizzato
                // quindi si otterrà sempre un array vuoto
                filter['public'] = true
            }
        }

        const pipeline = [
            { $match: filter },
            { $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
                pipeline: [
                    { $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        image: 1,
                        username: 1,
                    }}
                ]
            }},
            {
                $unwind: '$createdBy'
            },
            // count the number of entries
            // related to the poll
            {
                $lookup: {
                  from: "entries", // The name of the Entry collection
                  localField: "_id", // The field in the Poll collection
                  foreignField: "pollId", // The field in the Entry collection
                  as: "entries" // The field to store the matched entries
                }
            },
            {
                $project: {
                    _id: 1,
                    school: 1,
                    class: 1,
                    form: 1,
                    secret: 1,
                    createdBy: 1,
                    closedAt: 1,
                    closed: 1,
                    date: 1,
                    entriesCount: { $size: "$entries" } // Calculate the size of the entryCount array
                }
            }            
        ]
        
        console.log('Poll pipeline', JSON.stringify(pipeline))
        try {
            const data = await Poll.aggregate(pipeline)
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
            let secret
            for(;;) {
                secret = randomstring.generate({length: 6, readable: true})
                const duplicate = await Poll.findOne({secret})
                if (duplicate === null) break
            }
            const body = JSON.parse(req.body)
            const poll = new Poll({
                school: body.school,
                class: body.class,
                form: body.form,
                secret,
                createdBy: user._id,
                date: new Date(),
            })
            console.log(`poll: ${JSON.stringify(poll)}`)
            const out = await poll.save()
            console.log(`created poll ${out._id}: ${JSON.stringify(out)} body was ${JSON.stringify(body)}`)
            return res.status(200).json({ data: out })
        } catch (error) {
            return res.status(400).json({ error })
        }
    }
}
  
  