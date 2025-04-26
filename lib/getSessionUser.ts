import { getToken } from 'next-auth/jwt'
import { NextApiRequest } from 'next'
import { ObjectId } from 'mongodb'
import { getUserCollection } from './mongodb'

export default async function getSessionUser(req: NextApiRequest) {
    const token = await getToken({req})
    if (!token) return null
    // console.log(JSON.stringify({token}))
    const collection = await getUserCollection()
    const user = collection.findOne({_id: new ObjectId(token.sub)})
    return user
  }
  