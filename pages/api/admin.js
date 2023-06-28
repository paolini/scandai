import { getServerSession } from 'next-auth' 
import { getToken } from 'next-auth/jwt'

import authOptions from "./auth/[...nextauth]"

async function getSessionUser(req, res) {
  const token = await getToken({req})
  const session = await getServerSession(req, res, authOptions)
  return token.dbUser
}

export default async (req, res) => {
    const user = await getSessionUser(req, res, authOptions)
    console.log(`* admin ${JSON.stringify(user)}`)


    if (user) {
        res.send({
          content:
            "This is protected content. You can access this content because you are signed in.",
          user,
        })
      } else {
        res.send({
          error: "You must be signed in to view the protected content on this page.",
          user,
        })
      }
    }