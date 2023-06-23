/**
 * "migrations" contiene le migrazioni da applicare.
 * Se la funzione torna true il nome viene salvato
 * nel database e la migrazione non verrà più applicata.
 * Le migrazioni devono essere autoconsistenti, non bisogna
 * utilizzare i modelli perché potrebbero non corrispondere 
 * più allo stato del database
 */

const migrations = { 
    _20230607_create_some_classes_1: async function(db) {
        const classes = db.collection('classes')
        // await classes.deleteMany({})
        await classes.insertOne({ slug: 'test_1A', school: 'Scuola di prova', class: '1A', hidden: false })
        await classes.insertOne({ slug: 'test_1B', school: 'Scuola di prova', class: '1B', hidden: false })
        return true
    },

    _20230623_fix_ages_answer: async function(db) {
        const entries = db.collection('entries')
        for (const entry of await entries.find({}).toArray()) {
            if (Array.isArray(entry.answers['2.1.1'])) {
                entry.answers['2.1.1'] = {}
                await entries.updateOne({_id: entry._id}, {$set: {answers: entry.answers}})
            }
        }
        return true
    }
}

export default async function migrate(db, options) {
    const {apply, clean} = {
        apply: false, 
        clean: false, 
        ...options }

    const configs = db.collection('config')
    let config = await configs.findOne({})
    if (config === null) {
        console.log(`no config document in database. Create empty config.`)
        config = { migrations: [] }
        await db.collection('config').insertOne(config)
    }
    
    async function update() {
        await configs.updateOne(
            { _id: config._id }, 
            { $set: {migrations: config.migrations }})
        }

    console.log("Migrations: (*) applied, (+) new, (-) removed")

    const all_migrations = [...new Set([...Object.keys(migrations), ...config.migrations])]
    for (const name of all_migrations.sort()) {
        if (config.migrations.includes(name)) {
            if (migrations.hasOwnProperty(name)) {
                console.log(` (*) ${name}`)
            } else {
                if (clean) {
                    config.migrations = config.migrations.filter(m => m !== name)
                    console.log(` (-) ${name} (removed!)`)
                } else {
                    console.log(` (-) ${name}`)
                }
            }
        } else {
            console.log(` (+) ${name}`)
        }
    }
    if (clean) {
        await update()
    }

    if (apply) {
        for (const [name, run] of Object.entries(migrations)) {
            if (config.migrations.includes(name)) continue
            console.log(`===> apply migration: ${name}`)
            if (await run(db)) {
                // migrazione applicata!
                config.migrations.push(name)
                await update()
                console.log(`migration ${name} OK!`)
            } else {
                console.log(`migration ${name} FAILED! ****`)
                return false
            }
        }
        console.log("===> all migrations applied!")
    }
    return true
}
