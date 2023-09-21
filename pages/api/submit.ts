import type { NextApiRequest, NextApiResponse } from 'next'
import Entry from '../../models/Entry'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('>>> submit', `${new Date()}`, JSON.stringify(req.body))
    const IP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '???'
    try {
            await Entry.create({
                answers: req.body.answers,
                pollId: req.body.pollId,
                lang: req.body.lang,
                timestamp: req.body.timestamp,
                IP,
            })
        res.status(200).json({ data: 'ok' })
    } catch (error) {
        console.log(`submit error: ${error}`)
        res.status(400).json({ error: `${error}` })
    }
}
  
  