import { getEntryCollection } from "@/lib/mongodb"
import { Context } from "../types"
import { MutationSubmitArgs } from "@/generated/graphql"

export default async function submit(parent: any, {_id, answers, lang, timestamp}: MutationSubmitArgs, {req, user}: Context) {
    console.log('>>> submit', `${new Date()}`, JSON.stringify({_id, answers, lang, timestamp}))

    const IP: string = (req as any).headers['x-forwarded-for'] || (req as any)?.socket?.remoteAddress || '???'

    const collection = await getEntryCollection()

    const createdAt = new Date()

    await collection.insertOne({
        answers,
        pollId: _id,
        lang: lang||'',
        clientTimestamp: timestamp,
        IP,
        createdAt,
    })
    
    return true
}
