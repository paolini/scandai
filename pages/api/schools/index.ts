import { NextApiRequest, NextApiResponse } from 'next'

import School from '@/models/School'
import getSessionUser from '@/lib/getSessionUser'
import { schoolYearMatch } from '@/lib/utils'

// const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }
        if (req.method === 'GET') {
            const year = req.query.year && !Array.isArray(req.query.year) && parseInt(req.query.year)
            const pipeline = []
            if (year) {
                pipeline.push({$match: {"createdAt": schoolYearMatch(year)}})
            }
            const schools = await School.aggregate([
                { $lookup: { 
                    from: 'polls', 
                    localField: '_id', 
                    foreignField: 'school_id', 
                    as: 'polls', 
                    pipeline,
                } 
                },
                { $addFields: {
                    pollCount: {$size: "$polls"}}
                },
                { $project: {
                    name: 1,
                    city: 1,
                    city_fu: 1,
                    pollCount: 1
                    }
                },
            ])
            return res.json({data: schools})
        }
        // non admin can only make GET requests
        if (!user.isAdmin) {
            return res.status(403).json({error: 'not authorized'})
        }
        if (req.method === 'POST') {
            const {name, city, city_fu } = JSON.parse(req.body)
            const newSchool = new School({name, city, city_fu})
            // console.log(`creating new School: ${newSchool}`)
            const out = await newSchool.save()
            return res.json({data: out})
        }
    }