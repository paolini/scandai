"use client"
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import type { ObjectId } from 'mongodb'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import PollAdmin from '@/components/PollAdmin'
import { useTrans } from '@/lib/trans'
import { ProfileQuery, PollQuery } from '@/lib/api'

export default function PollIdContainer() {
    const searchParams = useSearchParams()
    const adminSecret = searchParams.get('secret') || undefined
    const router = useRouter()
    const poll_id = router.query.poll_id as ObjectId | undefined
    return <Page header={!adminSecret}>
        <PollId adminSecret={adminSecret} poll_id={poll_id}/>
    </Page>
}

function PollId({adminSecret, poll_id}:{
    adminSecret?: string,
    poll_id?: ObjectId|undefined,
}) {
    const _ = useTrans()
    const pollQuery = useQuery(PollQuery, {variables: {_id: poll_id, adminSecret}})
    const poll = pollQuery.data?.poll
    const profileQuery = useQuery(ProfileQuery)
    const profile = profileQuery.data?.profile
    const isAdmin = profile?.isAdmin
    const isSupervisor = profile && (isAdmin || profile?._id === poll?.createdBy?._id)

    if (pollQuery.loading) return <Loading />
    if (!pollQuery.data) return <Error>{_("Errore")}: {`${pollQuery.error}`}</Error>

    if (!poll) return <Error>{_("Errore")}: {_("sondaggio non trovato")}</Error>
    
    return <PollAdmin poll={poll} adminSecret={adminSecret} />
}

