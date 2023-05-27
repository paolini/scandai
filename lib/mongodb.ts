import mongoose from 'mongoose'

async function connect() {
  const uri = process.env.MONGODB_URI
  const options = {}

  try {
    if (uri) {
      console.log(`connecting to mongodb at ${uri}`)
      await mongoose.connect(uri, options)
      console.log("connected to mongodb")
      return true
    } else {
      console.log("no mongodb connection: set MONGODB_URI environment variable")
      return false
    }
  } catch (err) {
    console.log("mongodb connection failed")
    console.log(err)
    return false
  }
}

let connectPromise = connect()

export default connectPromise
