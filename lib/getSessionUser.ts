import { NextApiRequest } from 'next'
import { ObjectId } from 'mongodb'
import { getUserCollection } from './mongodb'
import { auth } from './auth'
import { fromNodeHeaders } from 'better-auth/node'

export default async function getSessionUser(req: NextApiRequest) {
    // Better Auth requires headers in the correct format
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    if (!session?.user?.id) return null

    const collection = await getUserCollection()
    const user = collection.findOne({_id: new ObjectId(session.user.id)})
    return user
  }
  