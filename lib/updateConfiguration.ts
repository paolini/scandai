import Config from '../models/Config'

export default async function updateConfiguration() {
    let config = await Config.findOne()
    let modified = false
    if (!config) {
        config = new Config({
            siteTitle: {
                en: 'Scandai',
                fu: 'Scandai',
                it: 'Scandai',
            },
        })
        modified = true
    }
    const title_it = process.env.SITE_TITLE_IT || process.env.SITE_TITLE || 'Scandai'
    if (config.siteTitle.it !== title_it) {
        config.siteTitle.it = title_it
        modified = true
    }
    const title_en = process.env.SITE_TITLE_EN || process.env.SITE_TITLE || 'Scandai'
    if (config.siteTitle.en !== title_en) {
        config.siteTitle.en = title_en
        modified = true
    }
    const title_fu = process.env.SITE_TITLE_FU || process.env.SITE_TITLE || 'Scandai'
    if (config.siteTitle.fu !== title_fu) {
        config.siteTitle.fu = title_fu 
        modified = true
    }
    if (modified) {
        console.log(`Updating configuration: ${JSON.stringify(config)}`)
        await config.save()
    } else {
        console.log(`Configuration is up to date: ${JSON.stringify(config)}`)
    }
}