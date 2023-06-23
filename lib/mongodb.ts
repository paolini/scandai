import mongoose from 'mongoose'

import migrate from './migrations'
import createAdminUser from './createAdminUser'

async function init() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
    }
    
    const promise = mongoose.connect(uri, {})

    await promise

    console.log(`connected to mongodb at ${uri}`)

    await createAdminUser(mongoose.connection)
    await migrate(mongoose.connection, { apply: true })

    return promise
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default init()