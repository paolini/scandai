import NextAuth, { DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email"
import { compare } from "bcrypt"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"

import clientPromise from "../../../lib/mongodb"
import User, { IGetUser } from '@/models/User'

// augment next-auth types
declare module "next-auth" {
    interface User {
        isAdmin: boolean
    }

    interface Session {
        id: string
        isAdmin?: boolean
        dbUser?: IGetUser
    }
}

declare module "next-auth/jwt/types" {
    interface JWT {
        uid: string;
        dbUser?: IGetUser
    }
}

let providers = []

if (process.env.SMTP_HOST) {
    console.log('adding email provider')
    const portString = process.env.SMTP_PORT || undefined
    const port = portString ? parseInt(portString) : undefined
    providers.push(EmailProvider({
        name: 'email',
        server: {
            host: process.env.SMTP_HOST,
            port,
            auth: {
              user: process.env.SMTP_AUTH_USER,
              pass: process.env.SMTP_AUTH_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        },
        from: process.env.EMAIL_FROM,
        // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
        sendVerificationRequest,
      }))
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log(`adding google provider`)
    providers.push(GoogleProvider({
        name: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }))
}

providers.push(CredentialsProvider({
    name: 'credentials',
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
                id: user._id.toString(),
                name: user?.name,
                username: user?.username,
                email: user?.email,
                isAdmin: user?.isAdmin,
                isSuper: user?.isSuper,
            }
            console.error(`Password not valid for user ${credentials.username}`)
        } else {
            console.error(`User not found with username ${credentials.username}`)
        }
        throw new Error('Invalid username or password')
    }
}))

export default NextAuth({
    // Configure one or more authentication providers
    providers,

    pages: {
        // error: '/error',
        error: '/login',
        signIn: '/login',
        verifyRequest: '/verify-request',
    },

    adapter: MongoDBAdapter(clientPromise),

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async jwt({ token, account }) {
            // console.log('* jwt', token, account)

            // account is present only the first time the user signs in
            // otherwise token already contains the user info
            if (!token.dbUser && token.sub) {
                const dbUser = await User.findById(token.sub)
                if (dbUser) {
                    token.dbUser = {
                        _id: dbUser._id.toString(),
                        name: dbUser?.name,
                        username: dbUser?.username,
                        email: dbUser?.email,
                        isViewer: dbUser?.isViewer,
                        isAdmin: dbUser?.isAdmin,
                        isSuper: dbUser?.isSuper,
                        image: dbUser?.image,
                        accounts: dbUser?.accounts,
                    }
                } else {
                    console.log(`User not found with id ${token.sub}`)
                }
            }
            return token
        },

        async session({ session, token }) {
            // console.log('* session', session, token)

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

import { createTransport } from "nodemailer"
import { SITE_TITLE } from "@/lib/config"

async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const { identifier, url, provider, theme } = params
  const { host } = new URL(url)
  // NOTE: You are not required to use `nodemailer`, use whatever you want.
  const transport = createTransport(provider.server)
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `login ${SITE_TITLE}`,
    text: email_text({ url, host }),
    html: email_html({ url, host }),
  })
  const failed = result.rejected.concat(result.pending).filter(Boolean)
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
  }
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function email_html(params: { url: string; host: string }) {
  const { url, host } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")

  const brandColor = "#346df1"
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  }

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Entra nel sito <strong>${SITE_TITLE}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Entra</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Se non hai richiesto tu questa email puoi tranquillamente ignorarla.
      </td>
    </tr>
  </table>
</body>
`
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function email_text({ url, host }: { url: string; host: string }) {
  return `Entra nel sito ${SITE_TITLE}:\n${url}\n\n`
}