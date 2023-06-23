// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import { hash, compare } from 'bcrypt'

import migrate from './migrations'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

async function createAdminUser(db: mongoose.Connection) {
    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD
    if (!username) {
        console.log("no ADMIN_USERNAME set")
        return
    }
    if (!password) {
        console.log("no ADMIN_PASSWORD set")
        return
    }
    const encryptedPassword = await hash(password, 12)
    const users = db.collection('users')

    const user = await users.findOne({ username })
    if (user) {
        console.log(`admin user "${username}" already exists.`)
        if (await compare(password, user.password)) {
        console.log(`admin user "${username}" password already matches env variable ADMIN_PASSWORD.`)
        } else {
        await users.updateOne(
            { _id: user._id }, 
            { $set: {password: encryptedPassword }})
        console.log(`admin user "${username}" password updated to match ADMIN_PASSWORD env variable.`)
        }
    } else {
        console.log(`creating admin user ${username}`)
        const user = {
        username,
        password: encryptedPassword,
        roles: ['admin'],
        }
        await users.insertOne(user)
        console.log(`admin user ${username} created.`)
    } 
}
  
async function init() {
  const client = await clientPromise
  const conn = mongoose.createConnection().setClient(client);
  console.log(`connected to mongodb at ${uri}`)

  await createAdminUser(conn)

  console.log("apply migrations")
  await migrate(conn, { apply: true })
}

init()

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise