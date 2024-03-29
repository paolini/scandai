import { useState } from 'react'
import { useRouter } from 'next/router'

import Page from '@/components/Page'
import Questionary from '@/components/Questionary'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { IAnswers } from '@/components/Question'
import { useTrans } from '@/lib/trans'

export default function PollSecret({}) {
    const _ = useTrans()
    const router = useRouter()
    const secret = router.query.poll_secret as string

    // secret can be undefined for a while: disable the query until it is set
    const pollQuery = usePolls({secret},secret!==undefined)
    const langState = useState('')
    const answersState = useState<IAnswers>({})
    const [timestamp, setTimestamp] = useState(Date.now())

    // pollQuery.data is set if loading completes with no error
    // but you get pollQuery.data undefined if the query is disabled (secret===undefined)
    if (pollQuery.isLoading || secret===undefined) return <Loading />

    let poll;
    if (!pollQuery.data) {
        return <Page>
            <Error>{_("Errore")}: {pollQuery.error.message}</Error>
        </Page>
    } else if (pollQuery.data.data.length !== 1) {
        return <Page>
            <Error>{_("Errore: sondaggio non trovato")}</Error>
        </Page>
    } else {
        poll = pollQuery.data.data[0]
    }

    return <Page header={false}>
        <Questionary 
            poll={poll} 
            form={poll.form}
            langState={langState}
            answersState={answersState}
            mutate={pollQuery.mutate}
            timestamp={timestamp}
            />
    </Page>}

