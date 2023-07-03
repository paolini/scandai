import { getToken } from 'next-auth/jwt'
import { NextApiRequest } from 'next'

export default async function getSessionUser(req: NextApiRequest) {
    const token = await getToken({req})
    if (!token) return null
    return token.dbUser
  }
  