import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ClientSafeProvider, getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import authOptions from "./api/auth/[...nextauth]"
import { useSearchParams } from "next/navigation"
import { Button, Card } from "react-bootstrap"

import Error from '@/components/Error'

export default function SignIn({ providers, csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined
  const error = searchParams.get('error')

  return <Card>
      <Card.Header>
        <Card.Title>Fotografia linguistica</Card.Title>
      </Card.Header>
      <Card.Body>
        {error && <Error>{ error }</Error>}
        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
              <ProviderSection provider={provider} csrfToken={csrfToken} callbackUrl={callbackUrl}/>
          </div>
        ))}
      </Card.Body>
    </Card>
}

function ProviderSection({ provider, csrfToken, callbackUrl }: { 
    provider: ClientSafeProvider,
    csrfToken: string|undefined, 
    callbackUrl: string|undefined,
}) {
    const querystring = callbackUrl === undefined ? '' : `?callbackUrl=${encodeURIComponent(callbackUrl)}`
    // take the callback url from the query string
    switch(provider.type) {
        case 'oauth':
            return <div className="py-5">
              <Button onClick={() => signIn(provider.id,{callbackUrl})}>
                Entra con {provider.name}
              </Button>
            </div>
        case 'email':
            return <form method="post" action={`/api/auth/signin/email${querystring}`}>
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label>
                    Inserisci il tuo indirizzo email
                    {} <input type="email" id="email" name="email" />
                </label>
                {} <Button type="submit">Inviami Email</Button>
                <br />
                Ti invieremo un messaggio per entrare nel sito.
            </form>
        case 'credentials':
            return <form method="post" action={`/api/auth/callback/credentials${querystring}`}>
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label>
                Username
                {} <input name="username" type="text" />
                </label>
                <br />
                <label>
                Password
                {} <input name="password" type="password" />
                </label>
                <br/>
                <Button type="submit">Entra</Button>
            </form>
        default:
            return <>invalid provider {provider.name} {provider.type}</>
    }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
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
    },
  }
}