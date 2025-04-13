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
import { PollsQuery, ProfileQuery } from '@/lib/api'

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
    const pollQuery = useQuery(PollsQuery, {variables: {_id: poll_id, adminSecret}})
    const poll = pollQuery.data?.polls[0]
    const profileQuery = useQuery(ProfileQuery)
    const profile = profileQuery.data?.profile
    const isAdmin = profile?.isAdmin
    const isSupervisor = profile && (isAdmin || profile?._id === poll?.createdBy?._id)

    if (pollQuery.loading) return <Loading />
    if (!pollQuery.data) return <Error>{_("Errore")}: {`${pollQuery.error}`}</Error>

    if (pollQuery.data?.polls.length === 0) return <Error>{_("Errore")}: {_("sondaggio non trovato")}</Error>
    
    if (!poll) return <Loading />

    if (!pollQuery.data) return <Error>{_("Errore")}: {`${pollQuery.error}`}</Error>
    
    if (pollQuery.data.polls.length !== 1) return <Error>{_("Errore")}: {_("sondaggio non trovato")}</Error>

    if (!isSupervisor && !adminSecret) {
        return <Error>{_("Errore")}: {_("Non hai i permessi per visualizzare questo sondaggio")}</Error>
    }

    return <PollAdmin poll={poll} adminSecret={adminSecret} />
}

