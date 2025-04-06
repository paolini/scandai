import type { NextApiRequest, NextApiResponse } from 'next'

import Translation, {ITranslation, IPostTranslation} from '@/models/Translation'
import Dict from '@/models/Dict'
import getSessionUser from '@/lib/getSessionUser'
import questionary from '@/lib/questionary'

// const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
    const user = await getSessionUser(req)

    // await delay(7000)

    if (!user) {
        return res.status(401).json({error: 'not authenticated'})
    }

    if (req.method === 'POST') {
        try {
            const d:IPostTranslation = JSON.parse(req.body)
            console.log(`POST translation body=${JSON.stringify(d)}`)
            for (const [source, map] of Object.entries(d)) {
                let translation = await Translation.findOne({source})
                console.log(`translation=${JSON.stringify(translation)}`)
                if (translation) {
                    console.log(`found ${JSON.stringify(translation.map.toObject())}`)
                    Object.entries(map).forEach(([k,v]) => {
                        translation.map.set(k,v)
                    })
                } else {
                    console.log('new translation!')
                    translation = new Translation({
                        source,
                        map,
                    })
                }
                await translation.save()
            }
            return res.status(200).json({})
        } catch (error:any) {
            console.error(error)
            return res.status(400).json(error?.message)
        }
    }

    return res.status(405).json({error: 'Method not allowed'})
}
