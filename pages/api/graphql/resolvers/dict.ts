import { getDictCollection, getEntryCollection, MongoDict } from "@/lib/mongodb"
import { Context } from "../types"
import questionary from "@/lib/questionary"
import { Dict, MutationAddDictArgs } from "@/generated/graphql"

type IDictElement = {
    lang: string,
    variants: string[],
    map?: string,
}

export async function dict(_:any,{},{user}:Context) {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')

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
    
    const Entry = await getEntryCollection()
    const entries = await Entry.aggregate(pipeline).toArray()
    const DictCollection = await getDictCollection()
    const dict = Object.fromEntries((await DictCollection.aggregate([{$project: {lang: 1, map: 1}}]).toArray()).map(d => ([d.lang,d.map])))
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
    return data as Dict[]
}

export async function addDict(_:any,{lang,map}:MutationAddDictArgs,{user}:Context) {
    if (!user) throw Error('not authenticated')
    if (!user.isAdmin) throw Error('not authorized')
    const DictCollection = await getDictCollection()
    let dict = await DictCollection.findOne({lang})
    if (dict) {
        if (dict.lang === dict.map) {
            await DictCollection.deleteOne({_id: dict._id})
            return false
        } else {
            await DictCollection.updateOne({_id: dict._id},{$set:{map}})
            return true
        }
    } else {
        const createdAt = new Date()
        const updatedAt = new Date()
        await DictCollection.insertOne({lang, map, createdAt, updatedAt})
        return true
    }
}
