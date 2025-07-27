import randomstring from 'randomstring'

import { MutationNewSchoolArgs, MutationPatchSchoolArgs, MutationSchoolCreateSecretArgs, MutationSchoolRemoveSecretArgs, QuerySchoolArgs, QuerySchoolsArgs, School } from '@/generated/graphql'
import {Context} from '../types'
import {getSchoolCollection} from '@/lib/mongodb'
import { schoolYearMatch } from '@/lib/utils'

// export async function schools(parent: any, {}, {user}:Context) {
//     if (!user) throw Error('not authenticated')
//     if (!user.isAdmin) throw Error('not authorized')
//     const collection = await getSchoolCollection()
//     const res = await collection.find().toArray()
//     if (!res) throw Error('database error')
//     return res as School[]
// }

export async function schools(_parent: any, {year}: QuerySchoolsArgs, context: Context) {
    const pipeline = []
    if (year) {
        pipeline.push({$match: {"createdAt": schoolYearMatch(year)}})
    }
    const collection = await getSchoolCollection()
    // console.log(`schools resolver`, JSON.stringify({pipeline},null,2))
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
    return schools as School[]
}

export async function school(_:any,{_id}:QuerySchoolArgs,{user}:Context) {
    if (!user) throw Error("not authenticated")
    if (!user.isAdmin) throw Error("not authorized")
    if (!_id) return {_id: null, name: '', city: '', city_fu: ''} as School
    const collection = await getSchoolCollection()
    const school = await collection.findOne({_id})
    if (!school) throw Error("not found")
    return school as School
}

export async function newSchool(_:any,{data}:MutationNewSchoolArgs,{user}:Context) {
    const {name, city, city_fu} = data
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')
    const collection = await getSchoolCollection()
    const res = await collection.insertOne({
        name: name,
        city: city || '',
        city_fu: city_fu || city || ''})
    const _id = res.insertedId
    const out = await collection.findOne({_id})
    if (!out) throw Error('database error')
    return out as School
}

export async function patchSchool(_:any,{_id, data}:MutationPatchSchoolArgs,{user}:Context) {
    const {name, city, city_fu} = data
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')
    let $set: any = {}
    function valid(x: any) { return x!==null && x!==undefined}
    if (valid(name)) $set.name = name
    if (valid(city)) $set.city = city
    if (valid(city_fu)) $set.city_fu = city_fu
    const collection = await getSchoolCollection()
    const res = await collection.updateOne({_id},{$set})
    const out = await collection.findOne({_id})
    return out as School
}

export async function schoolCreateSecret(_:any,{_id}:MutationSchoolCreateSecretArgs,{user}:Context): Promise<School> {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')
    const reportSecret = randomstring.generate({length: 6, readable: true})
    const collection = await getSchoolCollection()
    const res = await collection.updateOne({_id},{$set:{reportSecret}})
    if (res.matchedCount === 0) throw Error('school not found')
    const out = await collection.findOne({_id})
    if (!out) throw Error('databaseError')
    return out as School
}

export async function schoolRemoveSecret(_:any,{_id}:MutationSchoolRemoveSecretArgs,{user}:Context): Promise<School> {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')
    const reportSecret = ''
    const collection = await getSchoolCollection()
    const res = await collection.updateOne({_id},{$set:{reportSecret}})
    if (res.matchedCount === 0) throw Error('school not found')
    const out = await collection.findOne({_id})
    if (!out) throw Error('databaseError')
    return out as School    
}