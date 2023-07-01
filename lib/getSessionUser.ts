import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function getSessionUser(
    req: NextApiRequest,
    res: NextApiResponse) {
    const token = await getToken({req})
    if (!token) return null
    // const session = await getServerSession(req, res, authOptions)
    return token.dbUser
  }
  