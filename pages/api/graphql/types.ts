import type { NextRequest } from "next/server"

export type User = {
  name: string,
  username: string,
  email: string,
  isAdmin: boolean,
  isSuper: boolean,
  isViewer: boolean,
  isTeacher: boolean,
  isStudent: boolean,
  image: string,
}
  
export type Context = {
    req: NextRequest
    res: Response|undefined
    user?: User
  }
  
export type Profile = {
    email: string
    admin: boolean
    authorized: boolean
    codes: string[]
  }