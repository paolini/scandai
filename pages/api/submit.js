import dbConnect from '../../lib/mongodb'
import Entry from '../../models/Entry'

export default async function handler(req, res) {
    console.log('submit')
    await dbConnect
    try {
        await Entry.create({
            answers: req.body.answers,
            pollId: req.body.pollId,
        })
        res.status(200).json({ data: 'ok' })
    } catch (error) {
        console.log(`submit error: ${error}`)
        res.status(400).json({ error: error.message })
    }
}
  
  