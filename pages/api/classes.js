import dbConnect from '../../lib/mongodb'
import Class from '../../models/Class'

export default async function handler(req, res) {
    await dbConnect
    try {
        const data = await Class.find({ hidden: false })
        res.status(200).json({ data })
    } catch (error) {
        console.log(`database error: ${error}`)
        res.status(400).json({ error })
    }
}
  
  