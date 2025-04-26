import { Db } from 'mongodb'

export default async function updateConfiguration(db: Db) {
    const collection = db.collection('configuration')
    let config = await collection.findOne()
    let modified = false

    let siteTitle = config?.siteTitle || {
        en: 'Scandai',
        fu: 'Scandai',
        it: 'Scandai',
    }

    const title_it = process.env.SITE_TITLE_IT || process.env.SITE_TITLE || 'Scandai'
    if (siteTitle.it !== title_it) {
        siteTitle.it = title_it
        modified = true
    }
    const title_en = process.env.SITE_TITLE_EN || process.env.SITE_TITLE || 'Scandai'
    if (siteTitle.en !== title_en) {
        siteTitle.en = title_en
        modified = true
    }
    const title_fu = process.env.SITE_TITLE_FU || process.env.SITE_TITLE || 'Scandai'
    if (siteTitle.fu !== title_fu) {
        siteTitle.fu = title_fu 
        modified = true
    }
    if (!config) {
        console.log(`Creating configuration: ${JSON.stringify(siteTitle)}`)
        await collection.insertOne({
            siteTitle,
        })
    } else if (modified) {
        console.log(`Updating configuration: ${JSON.stringify(config)}`)
        await collection.updateOne(
            { _id: config?._id },
            { $set: {
                siteTitle,
            }},
        )
    } else {
        console.log(`Configuration is up to date: ${JSON.stringify(config)}`)
    }
}