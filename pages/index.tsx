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
  const _ = useTrans()

  if (loading) return <Loading />
  if (!data) return <Error>{`${error}`}</Error>

  if (session.status === "unauthenticated") {
    router.push('/api/auth/signin')
    return <Loading/>
  }
  const profile = data.profile

  // finché session.status === "loading" risulta data.profile === null 

  if (loading) return <Loading />
  if (error) return <Error>{`${error}`}</Error>

  if (session.status === "authenticated" && !profile) {
    /* l'utente aveva una sessione ma evidentemente non esiste più nel db */
    signOut()
    return <Loading />
  }

  // profile potrebbe non esserci se la sessione è "loading"
  // controlliamo entrambe per far contento il type checker
  if (session.status === "loading" || !profile) return <Loading />

  if (profile.isViewer) {
    router.push('/report')
    return <Loading />
  }

  return <Page>
    <Title />
    {(!profile.name || !profile.isAdmin || !profile.isTeacher || !profile.isViewer) && <SetProfile profile={profile}/>}
    { profile.name
      && (profile.isTeacher || profile.isAdmin || profile.isViewer) 
      && <p>{_("Benvenuto %!", profile.name || profile.username || profile.email)}</p>}
    {(profile.isTeacher || profile.isAdmin) && <Polls />}
  </Page>
}
