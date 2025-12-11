import {Document, ObjectId, InferIdType, MongoClient, Collection} from 'mongodb'

import migrate from './migrations'
import createAdminUser from './createAdminUser'
import updateConfiguration from './updateConfiguration'

async function db() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  console.log(`connecting to mongodb at ${uri}...`)

  const mongoClient = new MongoClient(uri)
  const client = await mongoClient.connect()
  const db = client.db()

  console.log(`connected to mongodb at ${uri}`)

  await createAdminUser(db)
  await migrate(db, { apply: true })

  await updateConfiguration(db)

  return client
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
const clientPromise = db()
export default clientPromise

export async function trashDocument<T extends Document>(collection: Collection<T>, _id: InferIdType<T>) {
  const collectionName = collection.collectionName
  console.log(`trashDocument ${collectionName} ${_id}`)
  const db = (await clientPromise).db()

  // non sono riuscito a trovare un modo per fare il cast di _id in modo che funzioni con il tipo di mongoose
  const document = await collection.findOne<T>({ _id: _id as unknown as T["_id"] })
  if (!document) throw new Error(`document ${_id} not found in collection ${collectionName}`)
  // save document to "trash" collection
  const trashCollection = db.collection(`${collectionName}_trash`)
  const trashedAt = new Date()
  await trashCollection.findOneAndUpdate({ _id: document._id }, { 
    $set: {
      ...document, 
      trashedAt,
    }}, { upsert: true })

    // anche qui non sono riuscito a trovare un modo per fare il cast di _id in modo che funzioni con il tipo di mongoose
  await collection.deleteOne({ _id: document._id as unknown as T["_id"] })
}

export async function getCollection<T extends Document=Document>(collection: string) {
  const client = await clientPromise
  const db = client.db()
  return db.collection<T>(collection)
}

type MongoConfig = {
    siteTitle: {
        en: string;
        fu: string;
        it: string;
    }
}

export async function getConfigCollection() {
  return getCollection<MongoConfig>("configs")
}

export type MongoUser = {
    email: string,
    name?: string,
    username?: string,
    isAdmin?: boolean,
    isSuper?: boolean,
    isViewer?: boolean,
    isTeacher?: boolean,
    isStudent?: boolean,
    image?: string,
    password?: string,
    verified?: boolean,
}

export async function getUserCollection() {
  return getCollection<MongoUser>("users")
}

type MongoTranslation = {
  source: string,
  map: {
      it?: string,
      en?: string,
      fu?: string,
  },
}

export async function getTranslationCollection() {
  return getCollection<MongoTranslation>("translations")
}

export type QuestionCode = string
export type LanguageAnswer = string[]
export type MapLanguageToCompetenceAnswer = {[key: string]: {[key: string]: string}}
export type MapLanguageToAgeAnswer = {[key: string]: string}
export type Answer = LanguageAnswer | MapLanguageToAgeAnswer | MapLanguageToCompetenceAnswer

export interface MongoEntry {
    pollId: ObjectId,
    answers: {
        [key: QuestionCode]: Answer
    },
    lang: string,
    IP: string,
    clientTimestamp: number,
    createdAt: Date,
}

export async function getEntryCollection() {
  return getCollection<MongoEntry>("entries")
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
  updatedBy: ObjectId
  updatedAt: Date
}

export async function getPollCollection() {
  return getCollection<MongoPoll>("polls")
}

export type SchoolTypeString = "primary" | "first" | "second"
// "primary" (elementare), "first" (media), "second" (superiore)

type MongoSchool = {
    name: string,
    city: string,
    city_fu: string,
    reportSecret?: string,
    type: SchoolTypeString, 
}

export async function getSchoolCollection() {
  return getCollection<MongoSchool>("schools")
}

type MongoAccount = {
    provider: string,
    type: string,
    providerAccountId: string,
    userId: ObjectId,
}

export async function getAccountCollection() {
  return getCollection<MongoAccount>("accounts")
}

export type MongoDict = {
    lang: string,
    map: string,
    createdAt: Date,
    updatedAt: Date,
}

export async function getDictCollection() {
  return getCollection<MongoDict>("dicts")
}