import type { NextApiRequest, NextApiResponse } from "next"
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/lib/auth"

// Disable body parsing for Better Auth
export const config = {
  api: {
    bodyParser: false,
  },
}

// Better Auth handler for Pages Router
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return toNodeHandler(auth)(req, res)
}
