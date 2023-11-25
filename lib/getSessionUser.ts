import { getToken } from 'next-auth/jwt'
import { NextApiRequest } from 'next'
import { ObjectId } from 'mongodb'

import User from '@/models/User'

export default async function getSessionUser(req: NextApiRequest) {
    const token = await getToken({req})
    if (!token) return null
    // console.log(JSON.stringify({token}))
    const user = User.findOne({_id: new ObjectId(token.sub)})
    return user
  }
  