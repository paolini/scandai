import dbConnect from '../../lib/mongodb'
import User from '../../models/User'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    console.log('>>> signup:', JSON.stringify(req.body))
    const username = req.body.username
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    await dbConnect
    try {
        const invalid = [] 
        const user1 = await User.find({username})
        if (user1.length > 0) {
            invalid.push('username')
        }
        const user2 = await User.find({email})
        if (user2.length > 0) {
            invalid.push('email')
        }
        if (invalid.length > 0) {
            res.status(400).json({ 
                error: `${invalid.join(' and ')} already exists`,
                invalid: ['username'],
            })
            return
        }
        const newUser = await User.create({
            username,
            name,
            email,
            password,
            isAdmin: false,
            verified: false,

        })
        res.status(200).json({ data: 'ok' })
    } catch (error) {
        console.log(`submit error: ${error}`)
        res.status(400).json({ error: `${error}` })
    }
}
  
  