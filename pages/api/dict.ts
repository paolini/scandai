import type { NextApiRequest, NextApiResponse } from 'next'

import Entry from '@/models/Entry'
import Dict, {IDictElement} from '@/models/Dict'
import getSessionUser from '@/lib/getSessionUser'
import questionary from '@/lib/questionary'

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
    const user = await getSessionUser(req)

    if (!user) {
        return res.status(401).json({error: 'not authenticated'})
    }

    if (!user.isAdmin) {
        return res.status(401).json({error: 'not authorized'})
    }

    if (req.method === 'GET') {
        const codes = Object.entries(questionary.questions)
            .filter(([code, q])=>q.type === 'choose-language')
            .map(([code, q])=> code)

        const baseLangs = Object.keys(questionary.languages)

        let pipeline: any = [
            // convert the answers object to an array of key-value pairs, {k: ..., v: ...}
            {$project: {list: {$objectToArray: '$answers'}}},
            // unwind the array
            {$unwind: '$list'},
            // filter questions of type 'choose-language'
            {$match: {'list.k': {$in: codes}}},
            // expand the values of the array
            {$project: {v: '$list.v'}},
            // unwind the values
            {$unwind: '$v' },
            // tolower
            {$project: {w: {$toLower: '$v'}, v: 1}},
            // remove base languages and other answers
            {$match: {$expr: {$and: [{$eq: [{$type: '$w'},'string']},{$not: {$in:['$w',baseLangs]}}]}}},
            // remove duplicates
            {$group:{_id:'$w', list: {$addToSet: '$v'}}},
        ]
        
        try {
            const entries = await Entry.aggregate(pipeline)
            // console.log(JSON.stringify({entries}))
            const dict = Object.fromEntries(await (await Dict.aggregate([{$project: {lang: 1, map: 1}}])).map(d => ([d.lang,d.map])))
            const data: IDictElement[] = []
            for (const entry of entries) {
                const lang = entry._id
                const variants = entry.list
                const map = dict[lang]
                if (map!==undefined) {
                    data.push({lang, variants, map})
                } else {
                    data.push({lang, variants})
                }
            }
            data.sort((a: IDictElement, b:IDictElement) => (a.lang<b.lang?-1:1))
            res.status(200).json({ data })
        } catch (error) {
            console.error(error)
            console.log(`database error: ${error}`)
            res.status(400).json({ error })
        }
    }

    if (req.method === 'POST') {
        try {
            const {lang, map} = JSON.parse(req.body)
            let dict = await Dict.findOne({lang})
            if (dict) {
                dict.map = map
            } else {
                dict = new Dict({lang, map})
            }
            if (dict.lang !== dict.map) {
                const out = await dict.save()
                return res.status(200).json({ data: out })
            } else {
                if (dict._id) {
                    const out = await Dict.deleteOne({_id: dict._id})
                    return res.status(200).json({data: null})
                } else {
                    return res.status(200).json({data: null})
                }
            }
        } catch (error) {
            return res.status(400).json({ error })
        }
    }
}
