import { NextApiRequest, NextApiResponse } from 'next'

import Poll from '@/models/Poll'
import getSessionUser from '@/lib/getSessionUser'
import { requireSingle, schoolYearMatch } from '@/lib/utils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user.isSuper) return res.status(403).json({error: `not authorized`})
    if (req.method === 'POST') {
        try {
            const body = JSON.parse(req.body)
            const year: number = body.year ? parseInt(body.year) : 0
            const $match: any = { adminSecret: {$exists: true}}
            if (year) $match.createdAt = schoolYearMatch(year)
            console.log(JSON.stringify({
                $match,
                year,
                m:schoolYearMatch(year),
                body,
                y:body.year
            }))
            const result = await Poll.updateMany(
                $match,
                { $unset: {adminSecret: ""}})
            res.json({ok:true,count:result.modifiedCount,year})
        } catch (error) {
            console.error(error)
            return res.status(500).json({error:'internal server error'})
        }
        return
    }
    return res.status(405).json({error: 'method not allowed'})
}
