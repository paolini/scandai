import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ClientSafeProvider, getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import authOptions from "./api/auth/[...nextauth]";

export default function SignIn({ providers, csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
            <ProviderSection provider={provider} csrfToken={csrfToken}/>
        </div>
      ))}
    </>
  )
}

function ProviderSection({ provider, csrfToken }: { 
    provider: ClientSafeProvider,
    csrfToken: string|undefined, 
}) {
    switch(provider.type) {
        case 'oauth':
            return <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        case 'email':
            return <form method="post" action="/api/auth/signin/email">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label>
                    Email address
                    <input type="email" id="email" name="email" />
                </label>
                <button type="submit">Sign in with Email</button>
            </form>
        case 'credentials':
            return <form method="post" action="/api/auth/callback/credentials">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label>
                Username
                <input name="username" type="text" />
                </label>
                <label>
                Password
                <input name="password" type="password" />
                </label>
                <button type="submit">Sign in</button>
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