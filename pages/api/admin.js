import { getServerSession } from 'next-auth' 

import authOptions from "./auth/[...nextauth]"

async function getSessionUser(req, res) {
  const session = await getServerSession(req, res, authOptions)
  return session
}

export default async (req, res) => {
    const session = await getSessionUser(req, res, authOptions)
    console.log(`* admin ${JSON.stringify(session)}`)


    if (session) {
        res.send({
          content:
            "This is protected content. You can access this content because you are signed in.",
          session,
        })
      } else {
        res.send({
          error: "You must be signed in to view the protected content on this page.",
          session,
        })
      }
    }