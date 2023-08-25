import { signIn } from 'next-auth/react'

import Page from '@/components/Page'
import useSessionUser from '@/lib/useSessionUser'
import Loading from '@/components/Loading'
import Polls from '../components/Polls'

export default function Index({}) {
  const sessionUser = useSessionUser()

  if (sessionUser === undefined) return <Loading />
  
  if (sessionUser === null) return <Page>
    <h1>Fotografia linguistica</h1>
    <p>se vuoi somministrare il questionario ad una classe 
    devi <a
          href={`/api/auth/signin`}
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}>fare il login</a>.
    </p>
  </Page>

  return <Page>
    <h1>Fotografia linguistica</h1>
    <p>Benvenuto {sessionUser.name || sessionUser.username || sessionUser.email }!</p>
    <Polls />  
  </Page>
}
