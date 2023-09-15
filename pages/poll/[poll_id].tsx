import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'

import Page from '@/components/Page'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import PollAdmin from '@/components/PollAdmin'

export default function PollId({}) {
    const router = useRouter()
    const poll_id = router.query.poll_id as string
    const searchParams = useSearchParams()
    const adminSecret = searchParams.get('secret')

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
        return <Page>
            <Error>Errore: {pollQuery.error.message}</Error>
        </Page>
    } else if (pollQuery.data.data.length !== 1) {
        return <Page>
            <Error>Errore: sondaggio non trovato</Error>
        </Page>
    } else {
        poll = pollQuery.data.data[0]
    }
    return <Page header={!adminSecret}>
        <PollAdmin poll={poll} mutate={pollQuery.mutate} adminSecret={adminSecret} />
    </Page>
}

