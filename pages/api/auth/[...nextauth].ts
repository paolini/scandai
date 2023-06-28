import NextAuth, {DefaultSession} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"

import clientPromise from "../../../lib/mongodb"
import User, {IUser} from '@/models/User'

// augment next-auth types
declare module "next-auth" {
  interface User {
    roles?: string[]
  }

  interface Session {
    id: string;
    roles?: string[]
    dbUser?: IUser
  }
}

declare module "next-auth/jwt/types" {
    interface JWT {
      uid: string;  
      dbUser?: IUser
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

        await clientPromise
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

    adapter: MongoDBAdapter(clientPromise),

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async jwt({ token, account }) {
            console.log('* jwt', token, account)
            // account is present only the first time the user signs in
            // otherwise token already contains the user info
            if (!token.dbUser && token.sub) {
                const dbUser = await User.findById(token.sub)
                if (dbUser) {
                    token.dbUser = dbUser
                } else {
                    console.log(`User not found with id ${token.sub}`)
                }
            }
            return token
        },
        
        async session({session, token}) {
            console.log('* session', session, token)
            if (token && token.dbUser) {
                session.dbUser = token.dbUser
            }
            return session
        },
    

        /**
        async signIn({user, account, profile, email, credentials}) {
            if (account?.provider === 'google') {
                assert(profile)
                const { name, email, image } = profile
                await clientPromise
                const user = await User.findOne({ email })
                if (user) {
                    user.
                } else {
                    const newUser = new User({
                        username: email,
                        email: email
                    })
                    await newUser.save()
                }
            }
            return true
        },**/
    }
})