import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import assert from 'assert'

import School, {ISchool, IGetSchool} from '@/models/School'
import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }

        // only admins can access school
        if (!user.isAdmin) {
            return res.status(403).json({error: 'not authorized'})
        }

        const school_id = req.query.school_id as string
        
        const school = await getSchoolById(school_id)

        if (!school) {
            return res.status(404).json({error: 'school not found'})
        }

        if (req.method === 'DELETE') {
            const out = await School.deleteOne({_id: school._id})
            return res.status(200).json({ data: out })
        }

        if (req.method === 'PATCH') {
            let body
            try {
                body = JSON.parse(req.body)
            } catch(error) {
                return res.status(400).json({error: 'invalid json'})
            }
            let payload: any = {}
            for (let field of  ['name', 'city']) {
                if (body[field] === undefined) continue
                payload[field] = body[field]
            }
            console.log('patch school', payload)
            const out = await School.updateOne({_id: school._id}, payload)
            console.log('out', out)
            return res.json({data: out})
        }

    }

async function getSchoolById(id: string | ObjectId): Promise<IGetSchool|null> {
    const schools = await School.aggregate([
        { $match: {_id: new ObjectId(id)}},
    ])
    
    if (schools.length === 0) return null

    assert (schools.length === 1, 'schools.length === 1')
    return schools[0]
}