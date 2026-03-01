import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [
    magicLinkClient(),
    usernameClient(),
  ],
})

// Export commonly used functions
export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  getSession,
} = authClient
