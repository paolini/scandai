
import authOptions from "./auth/[...nextauth]"

import getSessionUser from "@/lib/getSessionUser"

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