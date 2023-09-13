import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

import Page from '@/components/Page'
import useSessionUser from '@/lib/useSessionUser'
import Loading from '@/components/Loading'
import Polls from '@/components/Polls'
import SetUserName from '@/components/SetUserName'
import { useProfile } from '@/lib/api'

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
