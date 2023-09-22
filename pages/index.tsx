import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

import Page from '@/components/Page'
import useSessionUser from '@/lib/useSessionUser'
import Loading from '@/components/Loading'
import Polls from '@/components/Polls'
import SetUserName from '@/components/SetUserName'
import { useProfile } from '@/lib/api'
import { SITE_TITLE } from '@/lib/config'

export default function Index({}) {
  const router = useRouter()
  const sessionUser = useSessionUser()

  if (sessionUser === undefined) return <Loading />
  
  if (sessionUser === null) {
    router.push('/api/auth/signin')
    return <Loading />
  }
  return <UserIndex />

}

function UserIndex() {
  const router = useRouter()
  const profileRequest = useProfile()
  const profile = profileRequest.data
  if (!profile) return <Loading/>
  if (!profile._id) {
    /* l'utente aveva una sessione ma evidentemente non esiste più nel db */
    signOut()
    return <Loading />
  }

  return <Page>
    <h1>{SITE_TITLE}</h1>
    {!profile.name && <SetUserName profile={profile} mutate={profileRequest.mutate}/>}
    <p>Benvenuto {profile.name || profile.username || profile.email }!</p>
    <Polls />  
  </Page>
}
