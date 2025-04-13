import {Context} from '../types'
import {schoolYearMatch} from '@/lib/utils'
import {getCollection} from '@/lib/mongodb'
import { QuerySchoolsArgs } from '@/generated/graphql'

export default async function resolver(_parent: any, params: QuerySchoolsArgs, context: Context) {
        const pipeline = []
        if (params.year) {
            pipeline.push({$match: {"createdAt": schoolYearMatch(params.year)}})
        }
        const collection = await getCollection("schools")
        console.log(`schools resolver`, JSON.stringify({pipeline},null,2))
        const schools = await collection.aggregate([
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
        ]).toArray()
        return schools
    }