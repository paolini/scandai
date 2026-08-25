import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSearchParams } from "next/navigation"
import { Button, Card } from "react-bootstrap"
import { useState } from "react"

import Error from '@/components/Error'
import { useTrans } from '@/lib/trans'
import clientPromise from "@/lib/mongodb"
import { authClient } from "@/lib/auth-client"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function SignIn({ siteTitle, hasGoogle, hasMagicLink }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const error = searchParams.get('error')
  const invalidCredentials = error === 'Invalid username or password'
  const oAuthAccountNotLinkedError = error === 'OAuthAccountNotLinked'
  const [expanded, setExpanded] = useState(invalidCredentials)

  return <>
    <Card> 
      <Card.Header>
        <Card.Title>{siteTitle.it}: autenticazione</Card.Title>
      </Card.Header>
      <Card.Body>
        {error && !invalidCredentials && <Error>{ error }</Error>}
        {oAuthAccountNotLinkedError && <Error>Il tuo account non è collegato a nessun account locale. Chiedi l&apos;intervento di un amministratore.</Error>}
        {hasMagicLink && <EmailLogin callbackUrl={callbackUrl} />}
        {expanded ? <>
          <hr />
          {hasGoogle && <GoogleLogin callbackUrl={callbackUrl}/>}
          <hr />
          { invalidCredentials && <Error>Username o password errati</Error>}
          <CredentialsLogin callbackUrl={callbackUrl}/>
        </> : <>
          <br className="py-2"/>
          <p><a href="#" onClick={() => setExpanded(true)}>[accedi tramite credenziali]</a></p>
        </>}
      </Card.Body>
    </Card>
    <Card> 
      <Card.Body>
        La Lavagne Plurilengâl <br />
        Rete per la promozione dell&apos;educazione plurilingue<br />
        e il CLIL in lingua friulana nella scuola superiore di secondo grado<br />
        <br /><br />
        Progetto realizzato con il sostegno dell&apos;ARLeF<br />
        Agenzia regionale per la lingua friulana      
      </Card.Body>
    </Card>
</> 
}

function EmailLogin({ callbackUrl }: {
  callbackUrl: string,
}) {
  const _ = useTrans()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      })
      setSent(true)
    } catch (err) {
      console.error('Magic link error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return <div>
      <p>Ti abbiamo inviato un&apos;email con un link per entrare nel sito.</p>
      <p>Controlla la tua casella di posta.</p>
    </div>
  }

  return <form onSubmit={handleSubmit}>
    <label htmlFor="email">
        Inserisci il tuo indirizzo email<br/>
        <input type="email" id="email" name="email" value={email} onChange={evt => setEmail(evt.target.value)}/>
    </label>
    <br />
    <Button disabled={!email.includes('@') || loading} type="submit">
      {loading ? 'Invio...' : 'Inviami Email'}
    </Button>
    <br />
    Ti invieremo un messaggio per entrare nel sito.
  </form>
}

function GoogleLogin({ callbackUrl }: {
  callbackUrl: string,
}) {
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    })
  }

  return <div className="py-2">
    <Button onClick={handleGoogleLogin}>
      Entra con un account google
    </Button>
  </div>
}

function CredentialsLogin({ callbackUrl } : {
    callbackUrl: string,
  }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Try username login first
      const result = await authClient.signIn.username({
        username,
        password,
      })
      if (result.error) {
        setError(result.error.message || 'Username o password errati')
      } else {
        window.location.href = callbackUrl
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={handleSubmit}>
    {error && <Error>{error}</Error>}
    <label className="my-2" htmlFor="username">
    Username <br/>
    <input name="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
    </label>
    <br/>
    <label className="my-2" htmlFor="password">
    Password <br/>
    <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    </label>
    <br/>
    <Button type="submit" disabled={loading}>
      {loading ? 'Accesso...' : 'Entra'}
    </Button>
  </form>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const db = (await clientPromise).db()

  const result = await db.collection("configs").findOne({});
  const siteTitle = result?.siteTitle || { it: "*** titolo non configurato ***" }

  // Check which providers are available
  const hasGoogle = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)
  const hasMagicLink = !!process.env.SMTP_HOST

  return {
    props: { 
        siteTitle,
        hasGoogle,
        hasMagicLink,
    },
  }
}
