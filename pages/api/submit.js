import dbConnect from '../../lib/dbConnect'
import Entry from '../../models/Entry'

export default function handler(req, res) {
    console.log('submit')
    console.log(req.body)
    res.status(200).json({ data: 'ok' })
}
  
  