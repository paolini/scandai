import { signIn } from 'next-auth/react'

import Page from '@/components/Page'
import useSessionUser from '@/lib/useSessionUser'
import Loading from '@/components/Loading'
import Polls from '@/components/Polls'
import SetUserName from '@/components/SetUserName'
import { useProfile } from '@/lib/api'

export default function Index({}) {
  const sessionUser = useSessionUser()

  if (sessionUser === undefined) return <Loading />
  
  if (sessionUser === null) return <AnonymousIndex />
  else return <UserIndex />

}

function UserIndex() {
  const profileRequest = useProfile()
  const profile = profileRequest.data
  if (!profile) return <Loading />

  return <Page>
    <h1>Fotografia linguistica</h1>
    {profile.name==='' && <SetUserName profile={profile} mutate={profileRequest.mutate}/>}
    <p>Benvenuto {profile.name || profile.username || profile.email }!</p>
    <Polls />  
  </Page>
}

function AnonymousIndex({}) {
  return <Page>
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
}