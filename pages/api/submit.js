import dbConnect from '../../lib/mongodb'
import Entry from '../../models/Entry'

export default async function handler(req, res) {
    console.log('submit')
    console.log(req.body)
    console.log('connecting to db')
    await dbConnect
    console.log('connected to db')
    try {
        console.log('creating entry')
        await Entry.create({ answers: req.body })
        console.log('created entry')
        res.status(200).json({ data: 'ok' })
    } catch (error) {
        console.log(`submit error: ${error}`)
        res.status(400).json({ error })
    }
}
  
  