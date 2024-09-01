import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

import Entry, {ENTRY_PIPELINE} from '@/models/Entry'
import getSessionUser from '@/lib/getSessionUser'
import { schoolYearMatch, requireSingle } from '@/lib/utils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)

    if (!user) return res.status(401).json({ error: 'not authenticated' })
    if (!user.isAdmin) return res.status(401).json({ error: 'not authorized' })
    if (!user.isSuper) return res.status(401).json({ error: 'not authorized' })

    if (req.method === 'GET') {
        const poolId = requireSingle(req.query.poolId)
        const year = requireSingle(req.query.year)
        const _id = requireSingle(req.query._id)

        console.log(`GET query ${JSON.stringify(req.query)}`)
        let $match: any = {}

        // set filters from query parameters
        if (year) $match['createdAt'] = schoolYearMatch(parseInt(year))
        if (poolId) $match.pool_id = poolId
        if (_id) $match['_id'] = new ObjectId(_id)

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

  
  