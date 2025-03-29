import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import PollAdmin from '@/components/PollAdmin'
import { useTrans } from '@/lib/trans'
import { PollsQuery, PollQuery } from '@/lib/api'

export default function PollIdContainer() {
    const searchParams = useSearchParams()
    const adminSecret = searchParams.get('secret')
    return <Page header={!adminSecret}>
        <PollId adminSecret={adminSecret}/>
    </Page>
}

function PollId({adminSecret}:{
    adminSecret: string|null
}) {
    const _ = useTrans()
    const router = useRouter()
    const poll_id = router.query.poll_id as string
    const pollsQuery = useQuery(PollsQuery, {
        variables: {
            _id: poll_id,
            adminSecret
        }
    })

    // secret can be undefined for a while: disable the query until it is set
    const pollQuery = usePolls(adminSecret
            ?{_id: poll_id, adminSecret}
            :{_id: poll_id}, 
        !!poll_id)

    // pollQuery.data is set if loading completes with no error
    // but you get pollQuery.data undefined if the query is disabled (secret===undefined)
    if (pollQuery.isLoading || poll_id===undefined) return <Loading />

    let poll;
    if (!pollQuery.data) {
        return <Error>{_("Errore")}: {pollQuery.error.message}</Error>
    } else if (pollQuery.data.data.length !== 1) {
        return <Error>{_("Errore")}: {_("sondaggio non trovato")}</Error>
    } else {
        poll = pollQuery.data.data[0]
    }
    return <Page header={!adminSecret}>
        <PollAdmin poll={poll} mutate={pollQuery.mutate} adminSecret={adminSecret} />
    </Page>
}

