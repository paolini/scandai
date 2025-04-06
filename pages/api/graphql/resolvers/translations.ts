import {getCollection} from '@/lib/mongodb'
import questionary from '@/lib/questionary'

export type IPostTranslation = {
    [key: string]: {
        it?: string,
        en?: string,
        fu?: string,
    }
}

export type IGetTranslation = IPostTranslation

export default async function resolver() {
    const collection = await getCollection("translations")
    const translations = await collection.find().toArray()
    const dictCollection = await getCollection("dicts")
    const dict = await dictCollection.find().toArray()

    // usa la traduzione in italiano come chiave
    const data = {
        ...Object.fromEntries(dict.filter(d=>d.map).map(d => [d.map, {}])),
        ...Object.fromEntries(Object.values(questionary.languages).map(l => [l.it, l])),
        ...Object.fromEntries(translations.map(d => [d.source,d.map])),
    }
    return data
}

