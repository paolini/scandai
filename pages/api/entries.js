import dbConnect from '../../lib/mongodb'
import Entry from '../../models/Entry'

export default async function handler(req, res) {
    await dbConnect
    try {
        const data = await Entry.find({})
        res.status(200).json({ data })
    } catch (error) {
        console.log(`database error: ${error}`)
        res.status(400).json({ error })
    }
}
