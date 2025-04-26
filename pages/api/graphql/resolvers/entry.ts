import { ObjectId } from 'mongodb'

import { schoolYearMatch } from '@/lib/utils'
import { getEntryCollection, trashDocument } from '@/lib/mongodb'
import { Entry, MutationDeleteEntryArgs, QueryEntriesArgs } from '@/generated/graphql'
import { Context } from '../types'

const ENTRY_PIPELINE = [
    {$lookup: {
        from: 'polls',
        as: 'poll',
        let: { pollId: '$pollId' },
        pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$pollId'] } } },
            { $lookup: {
                from: 'schools',
                as: 'school',
                let: { schoolId: '$school_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$schoolId'] } } },
                ],
            }},
            { $unwind: {
                path: '$school',
                preserveNullAndEmptyArrays: true,
            }}
        ]
    }},
   {$unwind: {
        path: '$poll',
        preserveNullAndEmptyArrays: true,
    }},
    {$sort: { 
        createdAt: -1 as const,
    }},
]

export async function entries(_:any,{poolId,year,_id}:QueryEntriesArgs,{user}:Context): Promise<Entry[]> {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin || !user.isSuper) throw Error('not authorized')

    let $match: any = {}

    // set filters from query parameters
    if (year) $match['createdAt'] = schoolYearMatch(year)
    if (poolId) $match.pool_id = poolId
    if (_id) $match['_id'] = new ObjectId(_id)

    const pipeline = [
        { $match },
        ...ENTRY_PIPELINE,
    ]
    const collection = await getEntryCollection()
    const data = await collection.aggregate(pipeline).toArray()
    return data as Entry[]
}

export async function entry(_:any,{_id}:QueryEntriesArgs,{user}:Context): Promise<Entry> {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin || !user.isSuper) throw Error('not authorized')

    const pipeline = [
        { $match: {_id: _id} },
        ...ENTRY_PIPELINE,
    ]
    const collection = await getEntryCollection()
    const data = await collection.aggregate(pipeline).toArray()
    if (data.length === 0) throw new Error('entry not found')
    if (data.length > 1) throw new Error('multiple entries found')
    return data[0] as Entry
}
  
export async function deleteEntry(_:any,{_id}:MutationDeleteEntryArgs,{user}:Context): Promise<boolean> {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin || !user.isSuper) throw Error('not authorized')

    const collection = await getEntryCollection()
    await trashDocument(collection, _id)
    return true
}