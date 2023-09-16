import { NextApiRequest, NextApiResponse } from 'next'

import getSessionUser from '@/lib/getSessionUser'
import { trashDocument } from '@/lib/mongodb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        const entry_id = req.query.entry_id

        if (Array.isArray(entry_id)) return res.status(400).json({error: 'invalid entry_id'})
        if (!entry_id) return res.status(400).json({error: 'missing entry_id'})

        if (!user?.isAdmin) return res.status(401).json({ error: 'not authorized' })

        if (req.method === 'DELETE') {
            try {
                await trashDocument('entries', entry_id)
                return res.status(200).json({ tradhed: entry_id })
            } catch (error) {
                return res.status(400).json({ error })
            }
        }
        res.status(400).json({ error: 'bad request' })
    }
