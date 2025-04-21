import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import Page from '@/components/Page'
import Questionary from '@/components/Questionary'
import { PollQuery } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { IAnswers } from '@/components/Question'
import { useTrans } from '@/lib/trans'

export default function PollSecretContainer({}) {
    const router = useRouter()
    const secret = router.query.poll_secret

    if (secret==undefined) return <Loading/>
    if (Array.isArray(secret)) return <Error>invalid secret</Error>

    return <Page header={false}>
        <PollSecret secret={secret}/>
    </Page> 
}

function PollSecret({secret}:{secret:string}) {
    const _ = useTrans()
    const langState = useState('')
    const answersState = useState<IAnswers>({})
    const [timestamp, setTimestamp] = useState(Date.now())
    const pollQuery = useQuery(PollQuery, {variables:{secret}})
    const poll = pollQuery.data?.poll

    if (pollQuery.loading) return <Loading />

    if (!poll) return <Page>
        <Error>{_("Errore")}: {`${pollQuery.error}`}</Error>
    </Page>
    
    return <Page header={false}>
        <Questionary 
            poll={poll} 
            form={poll.form}
            langState={langState}
            answersState={answersState}
            timestamp={timestamp}
            />
    </Page>}

