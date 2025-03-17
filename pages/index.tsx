import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import Polls from '@/components/Polls'
import SetProfile from '@/components/SetProfile'
import { ProfileQuery } from '@/lib/api'
import { useTrans } from '@/lib/trans'
import Title from '@/components/Title'
import Provider from '@/components/Provider'
import { useSession } from 'next-auth/react'

export default function Index() {
  return <Provider>
    <Home/>  
  </Provider>
}

function Home() {
  const session = useSession()
  const router = useRouter()
  const { data, loading, error } = useQuery(ProfileQuery)
  if (loading) return <Loading />
  if (!data) return <Error>{`${error}`}</Error>

  const profile = data.profile

  if (!session) {
    router.push('/api/auth/signin')
    return <Loading>redirecting...</Loading>
  }

  if (profile.isViewer) {
    router.push('/report')
    return <Loading />
  }

  const _ = useTrans()

  if (!profile) {
    /* l'utente aveva una sessione ma evidentemente non esiste più nel db */
    signOut()
    return <Loading />
  }

  return <Page>
    <Title />
    {(!profile.name || !profile.isAdmin || !profile.isTeacher || !profile.isViewer) && <SetProfile profile={profile}/>}
    { profile.name
      && (profile.isTeacher || profile.isAdmin || profile.isViewer) 
      && <p>{_("Benvenuto %!", profile.name || profile.username || profile.email)}</p>}
    { (profile.isTeacher || profile.isAdmin) && <Polls /> }
  </Page>
}
