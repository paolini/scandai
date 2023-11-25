/**
 * "migrations" contiene le migrazioni da applicare.
 * Se la funzione torna true il nome viene salvato
 * nel database e la migrazione non verrà più applicata.
 * Le migrazioni devono essere autoconsistenti, non bisogna
 * utilizzare i modelli perché potrebbero non corrispondere 
 * più allo stato del database
 */

const migrations = { 
    _20230903_link_schools_0: async function(db) {
        const schools = db.collection('schools')
        const polls = db.collection('polls')
        for (const poll of await polls.find({}).toArray()) {
            const [name, city] = poll.school ? poll.school.split(' - ') : ["test",""]
            
            let school = await schools.findOne({name})
            console.log('found school', JSON.stringify(school))
            if (!school) {
                school = await schools.insertOne({name, city: city || ''})
                console.log('inserted school', JSON.stringify(school))
            }
            await polls.updateOne(
                {_id: poll._id}, 
                {$set: 
                    {school_id: school._id}})
        }
        return true
    },
    _20231016_populate_poll_year_1: async function(db) {
        const polls = db.collection('polls')
        for (const poll of await polls.find({}).toArray()) {
            let year = poll.class.substr(0,1)
            let rest = poll.class.substr(1)
            if (isNaN(parseInt(year))) year=""
            if (year && !poll.year) {
                console.log(`poll ${poll._id} ${poll.year}${poll.class} => ${year}/${rest}`)
                await polls.updateOne(
                    {_id: poll._id}, 
                    {$set: 
                        {year,class:poll.class}})
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
