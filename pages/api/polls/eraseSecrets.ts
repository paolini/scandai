import { NextApiRequest, NextApiResponse } from 'next'

import Poll from '@/models/Poll'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user.isAdmin) return res.status(403).json({error: `not authorized`})
    if (req.method === 'POST') {
        try {
            const result = await Poll.updateMany(
                {adminSecret: { $exists: true}},
                { $unset: {adminSecret: ""}})
            res.json({ok:true,count:result.modifiedCount})
        } catch (error) {
            console.error(error)
            return res.status(500).json({error:'internal server error'})
        }
        return
    }
    return res.status(405).json({error: 'method not allowed'})
}
