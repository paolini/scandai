import { MutationPostTranslationArgs, Translation } from '@/generated/graphql'
import {getDictCollection, getTranslationCollection} from '@/lib/mongodb'
import questionary, {LocalizedString} from '@/lib/questionary'
import { Context } from '../types'

export async function translations() {
    const collection = await getTranslationCollection()
    const translations = await collection.find().toArray()
    const dictCollection = await getDictCollection()
    const dict = await dictCollection.find().toArray()

    // usa la traduzione in italiano come chiave
    const data:{[key:string]: LocalizedString} = {
        ...Object.fromEntries(dict.filter(d=>d.map).map(d => [d.map, {}])),
        ...Object.fromEntries(Object.values(questionary.languages).map(l => [l.it, l])),
        ...Object.fromEntries(translations.map(d => [d.source,d.map])),
    }
    return Object.entries(data).map(([source, map]) => {
        const res: Translation = {
            source,
            map: {
                it: map.it,
                en: map.en,
                fu: map.fu,
            }
        }
        return res
    })
}

export async function postTranslation (_parent: any, {source,map: input_map}: MutationPostTranslationArgs, context: Context) {
      const user = context.user
      if (!user) throw new Error('not authenticated')
      if (!user.isAdmin) throw new Error('not authorized')
      const collection = await getTranslationCollection()
      const translation = await collection.findOne({source})
      let map = translation ? translation.map : {}
      if (input_map.it) map.it = input_map.it
      if (input_map.en) map.en = input_map.en
      if (input_map.fu) map.fu = input_map.fu
      console.log("postTranslation", JSON.stringify({source, map, input_map, db: translation?.map}))
      if (translation) {
        await collection.updateOne({source}, {
            $set: {map}
        })
      } else {
        await collection.insertOne({
            source,
            map,
        })
      }
      const res = await collection.findOne({source})
      if (!res) throw Error("database error")
      return res as Translation
   }

