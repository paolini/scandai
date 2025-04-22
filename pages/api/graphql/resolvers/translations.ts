import { LocalizedString, LocalizedStringInput, MutationPostTranslationArgs, Translation } from '@/generated/graphql'
import {getCollection, getTranslationCollection} from '@/lib/mongodb'
import questionary from '@/lib/questionary'
import { Context } from '../types'

export type IPostTranslation = {
    [key: string]: {
        it?: string,
        en?: string,
        fu?: string,
    }
}

export type IGetTranslation = IPostTranslation

export async function translations() {
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

export async function postTranslation (_parent: any, params: MutationPostTranslationArgs, context: Context) {
      const user = context.user
      if (!user) throw new Error('not authenticated')
      if (!user.isAdmin) throw new Error('not authorized')

      const collection = await getTranslationCollection()
      let translation = await collection.findOne({source: params.source})
      let map: any = {}
      Object.entries(params.map).forEach(([key,val]) => {
        if ((translation?.map as any)[key]) map[key] = (translation?.map as any)[key]
        if (val!==null && val!==undefined) map[key] = val
      })
      if (translation) {
        await collection.updateOne({source: params.source}, {
            $set: {map}
        })
      } else {
        await collection.insertOne({
            source: params.source,
            map,
        })
      }
      const res = await collection.findOne({source: params.source})
      if (!res) throw Error("database error")
      return res as Translation
   }

