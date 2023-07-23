import type { NextApiRequest, NextApiResponse } from 'next'

import Entry from '@/models/Entry'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
        console.log(`HANDLER`)
        const user = await getSessionUser(req)

        let pipeline: any = [
            // convert the answers object to an array of key-value pairs
            {$project: {list: {$objectToArray: '$answers'}}},
            // unwind the array
            {$unwind: '$list'},
            // expand the values of the array
            {$project: {v: '$list.v'}},
            // unwind the values
            {$unwind: '$v' },
            // remove base languages and other answers
            {$match: {$expr: {$and: [{$eq: [{$type: '$v'},'string']},{$not: {$in:['$v',['it','fu','de','sl']]}}]}}},
            // remove duplicates
            {$group:{_id:'$v'}},
        ]
        
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }

        if (!user.isAdmin) {
            return res.status(401).json({error: 'not authorized'})
        }

        try {
            const entries = await Entry.aggregate(pipeline)
            const data = []
            for (const entry of entries) {
                data.push([entry._id])
            }
            res.status(200).json({ data })
        } catch (error) {
            console.error(error)
            console.log(`database error: ${error}`)
            res.status(400).json({ error })
        }
}
