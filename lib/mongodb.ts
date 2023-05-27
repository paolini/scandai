import mongoose from 'mongoose'

async function connect() {
  const uri = process.env.MONGODB_URI
  const options = {}

  if (uri) {
    console.log(`connecting to mongodb at ${uri}`)
    await mongoose.connect(uri, options)
    console.log("connected to mongodb")
  } else {
    console.log("no mongodb connection: set MONGODB_URI environment variable")
  }
}

let connectPromise = connect()

export default connectPromise
