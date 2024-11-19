import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Polls from '@/components/Polls'
import SetProfile from '@/components/SetProfile'
import { useProfile, useProfileQuery } from '@/lib/api'
import { useTrans } from '@/lib/trans'
import Title from '@/components/Title'

type Config = {[key: string]: string}

export default function Index({config}:{
  config: Config
}) {
  const router = useRouter()
  const profile = useProfile()

  if (profile === undefined) return <Loading />
  
  if (profile === null) {
    router.push('/api/auth/signin')
    return <Loading />
  }

  if (profile.isViewer) {
    router.push('/report')
    return <Loading />
  }

  console.log(`Index config: ${JSON.stringify(config)}`)

  return <Home config={config}/>
}

function Home({config}:{config:Config}) {
  const profileQuery = useProfileQuery()
  const profile = profileQuery.data
  const _ = useTrans()

  if (profile===undefined) return <Loading/>

  if (!profile) {
    /* l'utente aveva una sessione ma evidentemente non esiste più nel db */
    signOut()
    return <Loading />
  }

  return <Page>
    <Title />
    {(!profile.name || !profile.isAdmin || !profile.isTeacher || !profile.isViewer) && <SetProfile profile={profile} mutate={profileQuery.mutate}/>}
    { profile.name
      && (profile.isTeacher || profile.isAdmin || profile.isViewer) 
      && <p>{_("Benvenuto %!", profile.name || profile.username || profile.email)}</p>}
    { (profile.isTeacher || profile.isAdmin) && <Polls /> }
  </Page>
}
