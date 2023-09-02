import dbConnect from '../../lib/mongodb'
import User from '../../models/User'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    let body
    try {
        body = JSON.parse(req.body)
    } catch (error) {
        res.status(400).json({ error: `${error}` })
        return
    }
    console.log('>>> signup:', JSON.stringify(body))
    const { username, name, email, password } = body
    const invalid = [] 
    const messages = []
    if (!username) {
        invalid.push('username')
        messages.push('username richiesto')
    }
    if (!name) {
        invalid.push('name')
        messages.push('nome richiesto')
    }
    if (email.indexOf('@')<0) {
        invalid.push('email')
        messages.push('email non valida')
    }
    if (password.length < 5) {
        invalid.push('password')
        messages.push('password troppo corta')
    }
    if (invalid.length > 0) {
        res.status(400).json({ 
            error: messages.join(', '),
            invalid, 
        })
        return
    }
    await dbConnect
    try {
        const user1 = await User.find({username})
        console.log(`user1: ${JSON.stringify(user1)}`)
        if (user1.length > 0) {
            invalid.push('username')
        }
        const user2 = await User.find({email})
        console.log(`user2: ${JSON.stringify(user2)}`)
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
  
  