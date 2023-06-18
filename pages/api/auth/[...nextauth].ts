import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"

import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

// augment next-auth types
declare module "next-auth" {
  interface User {
    roles?: string[]
  }

  interface Session {
    roles?: string[]
    user?: User
  }
}

declare module "next-auth/jwt" {
    interface JWT {
      roles?: string[];
    }
  }

let providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log(`adding google provider`)
    providers.push(GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }))
}

providers.push(CredentialsProvider({
    name: 'Credentials',
    credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        if (!credentials) return null

        await dbConnect
        const user = await User.findOne({ username: credentials.username })
        if (user) {
            const isValid = await compare(credentials.password, user.password)
            if (isValid) return {
                id: user._id,
                name: user.username,
                email: user.email || `${user.username}@local`,
                roles: user.roles,
            }
            console.error(`Password not valid for user ${credentials.username}`)
        } else {
            console.error(`User not found with username ${credentials.username}`)
        }
        throw new Error('Invalid username or password')
        return null
    }
}))

export default NextAuth({
    // Configure one or more authentication providers
    providers,

    callbacks: {
        async jwt({ token, user }) {
            console.log('jwt', token, user)
            if (user) {
                token.id = user.id
                token.roles = user.roles
            }
            return token
        },

        async session({session, token}) {
            console.log('session', session, token)
            if (token && session.user) {
                session.roles = token.roles
            }
            return session
        },
        /*
        async signIn(user, account, profile) {
            if (account.provider === 'google') {
                const { name, email, image } = profile
                await dbConnect
                const user = await User.findOne({ email })
                if (!user) {
                    const newUser = new User({
                        username: email,
                        email: email
                    })
                    await newUser.save()
                }
            }
            return true
        },
*/
    }
})