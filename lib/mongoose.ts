import mongoose from 'mongoose'
import { MongoClient } from "mongodb"
import { hash, compare } from 'bcrypt'
import assert from 'assert'

import migrate from './migrations'

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

async function connect() {
  const uri = process.env.MONGODB_URI
  assert(uri, "MONGODB_URI environment variable not set")
  console.log(`connecting to mongodb at ${uri}`)
  const options = {}
  
  let client = await mongoose.connect(uri, options)
  
  console.log("connected to mongodb")

  await createAdminUser(mongoose.connection)

  console.log("apply migrations")      
  await migrate(mongoose.connection, { apply: true })

  return client.connection.getClient()
}

const clientPromise: Promise<MongoClient> = connect()

export default clientPromise
