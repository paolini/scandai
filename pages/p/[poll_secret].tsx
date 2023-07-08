import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card } from 'react-bootstrap'

import Page from '@/components/Page'
import Questions from '@/components/Questions'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { value, set } from '@/lib/State'
import Poll from '@/components/Poll'

export default function PollSecret({}) {
    const router = useRouter()
    const secret = router.query.poll_secret as string

    // secret can be undefined for a while: disable the query until it is set
    const pollQuery = usePolls({secret},secret!==undefined)
    const state = useState<'init'|'started'|'completed'>('init')

    // pollQuery.data is set if loading completes with no error
    // but you get pollQuery.data undefined if the query is disabled (secret===undefined)
    if (pollQuery.isLoading || secret===undefined) return <Loading />

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
    
    const myUrl = window.location.href

    switch(value(state)) {
        case 'init': return <Poll poll={poll} mutate={pollQuery.mutate} start={() => set(state,'started')} />
        case 'started': return <Questions done={() => set(state, 'completed')} poll={poll} />
        case 'completed': return <Page>
            <Card>
                <Card.Body>
                    <Card.Title>Grazie!</Card.Title>
                    <Card.Text>
                        <p>Grazie per aver compilato il questionario!</p>
                        <p>Puoi chiudere questa pagina.</p>
                    </Card.Text>
                </Card.Body> 
                {/*   
                <Card.Footer>
                    <Button variant="danger" onClick={() => set(state, 'init')}>compila un altro questionario</Button>
                </Card.Footer>
                */}
            </Card>
        </Page>
    }
}

