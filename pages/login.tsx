import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ClientSafeProvider, getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import authOptions from "./api/auth/[...nextauth]"
import { useSearchParams } from "next/navigation"
import { Button, Card } from "react-bootstrap"
import { useState } from "react"

import Error from '@/components/Error'
import { useTrans } from '@/lib/trans'
import clientPromise from "@/lib/mongodb"

export default function SignIn({ providers, csrfToken, siteTitle }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined
  const error = searchParams.get('error')
  const invalidCredentials = error === 'Invalid username or password'
  const oAuthAccountNotLinkedError = error === 'OAuthAccountNotLinked'
  const querystring = callbackUrl === undefined ? '' : `?callbackUrl=${encodeURIComponent(callbackUrl)}`
  const google = Object.values(providers).find((provider) => provider.name === 'google')
  const [expanded, setExpanded] = useState(invalidCredentials)

  return <>
    <Card> 
      <Card.Header>
        <Card.Title>{siteTitle.it}: autenticazione</Card.Title>
      </Card.Header>
      <Card.Body>
        {error && !invalidCredentials && <Error>{ error }</Error>}
        {oAuthAccountNotLinkedError && <Error>Il tuo account non è collegato a nessun account locale. Chiedi l&aps;intervento di un amministratore.</Error>}
        <EmailLogin csrfToken={csrfToken} querystring={querystring} />
        {expanded ? <>
          <hr />
          {google && <GoogleLogin provider={google} callbackUrl={callbackUrl}/>}
          <hr />
          { invalidCredentials && <Error>Username o password errati</Error>}
          <CredentialsLogin querystring={querystring} callbackUrl={callbackUrl} csrfToken={csrfToken}/>
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

function EmailLogin({querystring, csrfToken}: {
  querystring: string,
  csrfToken: string|undefined,
}) {
  const _ = useTrans()
  const [email, setEmail] = useState("")

  return <form method="post" action={`/api/auth/signin/email${querystring}`}>
    <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
    <label htmlFor="email">
        Inserisci il tuo indirizzo email<br/>
        <input type="email" id="email" name="email" value={email} onChange={evt => setEmail(evt.target.value)}/>
    </label>
    <br />
    <Button disabled={!email.includes('@')} type="submit">Inviami Email</Button>
    <br />
    Ti invieremo un messaggio per entrare nel sito.
  </form>
}

function GoogleLogin({provider, callbackUrl}: {
  provider: ClientSafeProvider,
  callbackUrl: string|undefined,
}) {
  return <div className="py-2">
    <Button onClick={() => signIn(provider.id,{callbackUrl})}>
      Entra con un account google
    </Button>
  </div>
}

function CredentialsLogin({querystring,callbackUrl,csrfToken} : {
    querystring: string,
    callbackUrl: string|undefined,
    csrfToken: string|undefined,
  }) {
  return <form method="post" action={`/api/auth/callback/credentials${querystring}`}>
    <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
    <label className="my-2" htmlFor="username">
    Username <br/>
    <input name="username" type="text" />
    </label>
    <br/>
    <label className="my-2" htmlFor="password">
    Password <br/>
    <input name="password" type="password" />
    </label>
    <br/>
    <Button type="submit">Entra</Button>
  </form>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  const db = (await clientPromise).db()

  const result = await db.collection("configs").findOne({});
  const siteTitle = result?.siteTitle || "*** titolo non configurato ***"

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!

  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context)

  return {
    props: { 
        providers: providers ?? [],
        csrfToken,
        siteTitle,
    },
  }
}
