import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card } from 'react-bootstrap'

import Page from '@/components/Page'
import Questionary from '@/components/Questionary'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { value, set } from '@/lib/State'
import PollSplash from '@/components/PollSplash'
import { getPhrase } from '@/lib/questionary'

export default function PollSecret({}) {
    const router = useRouter()
    const secret = router.query.poll_secret as string

    // secret can be undefined for a while: disable the query until it is set
    const pollQuery = usePolls({secret},secret!==undefined)
    const state = useState<'init'|'started'|'completed'>('init')
    const langState = useState('it')

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
        case 'init': return <PollSplash poll={poll} mutate={pollQuery.mutate} langState={langState} start={() => set(state,'started')} />
        case 'started': return <Questionary 
            poll={poll} 
            form={poll.form}
            lang={value(langState)}
            done={() => set(state, 'completed')} 
            />
        case 'completed': return <Page header={false}>
            <Card>
                <Card.Body>
                    <Card.Title>{getPhrase('thanksTitle', value(langState))}</Card.Title>
                    <Card.Text>
                        <p>{getPhrase('thanks', value(langState))}</p>
                        <p>{getPhrase('closeThisPage', value(langState))}</p>
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

