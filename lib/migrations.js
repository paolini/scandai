/**
 * "migrations" contiene le migrazioni da applicare.
 * Se la funzione torna true il nome viene salvato
 * nel database e la migrazione non verrà più applicata.
 * Le migrazioni devono essere autoconsistenti, non bisogna
 * utilizzare i modelli perché potrebbero non corrispondere 
 * più allo stato del database
 */

import { ObjectId } from 'mongodb'

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
    },
    _20251206_add_school_type: async function(db) {
        const schools = db.collection('schools')
        for (const school of await schools.find({}).toArray()) {
            if (!school.type) {
                let type = "second"
                console.log(`school ${school._id} ${school.name} => type=${type}`)
                await schools.updateOne(
                    {_id: school._id}, 
                    {$set: 
                        {type}})
            }
        }
        return true
    },
    _20260301_migrate_passwords_to_account: async function(db) {
        // Better Auth stores passwords in the `account` table with providerId: "credential"
        // This migration moves existing passwords from the legacy users.password field
        const usersCollection = db.collection('users')
        const accountCollection = db.collection('account')

        const usersWithPasswords = await usersCollection.find({ 
            password: { $exists: true, $ne: null } 
        }).toArray()

        console.log(`Found ${usersWithPasswords.length} users with passwords to migrate`)

        for (const user of usersWithPasswords) {
            const existingAccount = await accountCollection.findOne({
                userId: user._id,
                providerId: 'credential'
            })

            if (existingAccount) {
                console.log(`  [SKIP] User ${user.username || user.email} already has credential account`)
                continue
            }

            await accountCollection.insertOne({
                _id: new ObjectId(),
                id: new ObjectId().toString(),
                userId: user._id,  // ObjectId to match user._id
                accountId: user._id.toString(),
                providerId: 'credential',
                password: user.password,
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            console.log(`  [OK] Migrated password for user ${user.username || user.email}`)
        }
        return true
    },
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
