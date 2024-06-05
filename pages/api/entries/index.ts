import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

import Entry, {ENTRY_PIPELINE} from '@/models/Entry'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)

    if (!user) return res.status(401).json({ error: 'not authenticated' })
    if (!user.isAdmin) return res.status(401).json({ error: 'not authorized' })
    if (!user.isSuper) return res.status(401).json({ error: 'not authorized' })

    if (req.method === 'GET') {
        console.log(`GET query ${JSON.stringify(req.query)}`)
        let $match: any = {}

        // set filters from query parameters
        for (const key of ['poolId', ]) {
            if (req.query[key]!==undefined) {
                $match[key] = req.query[key]
            }
        }
        if (req.query._id!==undefined) {
            $match['_id'] = new ObjectId(req.query._id as string)
        }

        const pipeline = [
            { $match },
            ...ENTRY_PIPELINE,
        ]
        // console.log('Entry pipeline', JSON.stringify(pipeline))
        try {
            const data = await Entry.aggregate(pipeline)
            return res.status(200).json({ data, filter: $match })
        } catch (error) {
            console.log(`database error: ${error}`)
            return res.status(400).json({ error })
        }
    }
    res.status(400).json({ error: 'bad request' })
}

  
  