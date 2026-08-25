import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { magicLink } from "better-auth/plugins"
import { username } from "better-auth/plugins"
import { compare, hash } from "bcrypt"
import { createTransport } from "nodemailer"

import { getConfigCollection } from "./mongodb"

// Get MongoDB connection
const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const client = new MongoClient(uri)
const db = client.db()

// Build auth configuration
const plugins: any[] = []

// Add magic link plugin if SMTP is configured
if (process.env.SMTP_HOST) {
  const portString = process.env.SMTP_PORT || undefined
  const port = portString ? parseInt(portString) : undefined

  plugins.push(magicLink({
    sendMagicLink: async ({ email, token, url }, ctx) => {
      const transport = createTransport({
        host: process.env.SMTP_HOST,
        port,
        auth: {
          user: process.env.SMTP_AUTH_USER,
          pass: process.env.SMTP_AUTH_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      const config = await getConfigCollection().then(col => col.findOne({}))
      const { host } = new URL(url)
      
      await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `login ${config?.siteTitle?.it || ''}`,
        text: email_text({ url, host, config }),
        html: email_html({ url, host, config }),
      })
    }
  }))
}

// Add username plugin for username/password auth
plugins.push(username())

// Configure social providers
const socialProviders: any = {}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  database: mongodbAdapter(db, { client }),
  
  // Custom table names to match existing MongoDB collections
  user: {
    modelName: "users",
    additionalFields: {
      username: { type: "string", required: false },
      isAdmin: { type: "boolean", required: false, defaultValue: false },
      isSuper: { type: "boolean", required: false, defaultValue: false },
      isViewer: { type: "boolean", required: false, defaultValue: false },
      isTeacher: { type: "boolean", required: false, defaultValue: false },
      isStudent: { type: "boolean", required: false, defaultValue: false },
    }
  },

  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },

  emailAndPassword: {
    enabled: true,
    // Custom password verification to use bcrypt for existing passwords
    password: {
      verify: async ({ password, hash: storedHash }) => {
        return compare(password, storedHash)
      },
      hash: async (password) => {
        return hash(password, 10)
      }
    },
  },

  socialProviders,
  plugins,
  
  pages: {
    error: '/login',
    signIn: '/login',
  },
})

// Export auth type for client
export type Auth = typeof auth

// Email templates
type Config = {
  siteTitle?: {
    it?: string;
    en?: string;
    fu?: string;
  }
} | null

function email_html(params: { url: string; host: string; config: Config }) {
  const { url, config } = params

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
        Entra nel sito <strong>${config?.siteTitle?.it || '<unconfigured>'}</strong>
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

function email_text({ url, config }: { url: string; host: string; config: Config }) {
  return `Entra nel sito ${config?.siteTitle?.it || '<unconfigured>'}:\n${url}\n\n`
}
