import mongoose, {Types} from 'mongoose'
import {WithoutId, Document, ObjectId} from 'mongodb'

import migrate from './migrations'
import createAdminUser from './createAdminUser'
import updateConfiguration from './updateConfiguration'
import {Config, User, Translation, Poll} from '@/generated/graphql'

async function db() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  const promise = mongoose.connect(uri, {})

  await promise

  console.log(`connected to mongodb at ${uri}`)

  await createAdminUser(mongoose.connection)
  await migrate(mongoose.connection, { apply: true })
  const mongodb = await mongoose.connection.getClient()

  await updateConfiguration()

  return mongodb
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
const clientPromise = db()
export default clientPromise

export async function trashDocument(collectionName: string, documentId: string) {
  const db = mongoose.connection

  const collection = db.collection(collectionName)
  const document = await collection.findOne({ _id: new Types.ObjectId(documentId) })
  if (!document) throw new Error(`document ${documentId} not found in collection ${collectionName}`)
  // save document to "trash" collection
  const trashCollection = db.collection(`${collectionName}_trash`)
  await trashCollection.findOneAndUpdate({ _id: document._id }, { $set: document }, { upsert: true })
  await collection.deleteOne({ _id: document._id })
}

export async function getCollection<T extends Document=Document>(collection: string) {
  const db = (await clientPromise).db()
  return db.collection<T>(collection)
}

export async function getConfigCollection() {
  return getCollection<WithoutId<Config>>("configs")
}

export async function getUserCollection() {
  return getCollection<WithoutId<User>>("users")
}

export async function getTranslationCollection() {
  return getCollection<WithoutId<Translation>>("translations")
}

type MongoPoll = {
  secret: string
  adminSecret: string
  entriesCount: number
  date: Date
  school_id: ObjectId
  class: string
  year: string
  form: string
  closed: boolean
  createdBy: ObjectId
  createdAt: Date
}

export async function getPollCollection() {
  return getCollection<MongoPoll>("polls")
}