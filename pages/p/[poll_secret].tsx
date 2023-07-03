import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Card } from 'react-bootstrap'
import { FaShareAlt } from 'react-icons/fa'
import QRCode from 'react-qr-code'
import copyToClipboard from 'copy-to-clipboard'

import Page from '@/components/Page'
import Questions from '@/components/Questions'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import {useAddMessage} from '@/components/Messages'
import { value, set } from '@/lib/State'

export default function Poll({}) {
    const secret = useRouter().query.poll_secret as string

    // secret can be undefined for a while: disable the query until it is set
    const pollQuery = usePolls({secret},secret!==undefined)
    const addMessage = useAddMessage()
    const state = useState<'init'|'started'|'completed'>('init')

    // pollQuery.data is set if loading completes with no error
    // but you get pollQuery.data undefined if the query is disabled (secret===undefined)
    if (pollQuery.isLoading || secret===undefined) return <Loading />
    if (!pollQuery.data) {
        return <Error>{pollQuery.error.message}</Error>
    }

    const [poll] = pollQuery.data.data

    const myUrl = window.location.href

    console.log(`state: ${value(state)}`)

    switch(value(state)) {
        case 'init': return <Page>
            <h1>Fotografia linguistica</h1>
            <div className="d-flex flex-column">
                <div className="mx-4"><b>Scuola:</b> { poll.school }</div>
                <div className="mx-4"><b>Classe:</b> { poll.class }</div>
                <Button className="flex m-4" variant="success" size="lg" onClick={() => set(state,'started')}>
                    compila il questionario
                </Button>
                <Button className="flex m-4" onClick={() => {copyToClipboard(myUrl);addMessage('success', 'indirizzo (url) copiato')}}>
                    <FaShareAlt /> copia l'indirizzo del questionario
                </Button>
                <QRCode className="flex m-4 w-100" value={myUrl} />
            </div>
        </Page>
        case 'started': return <Questions done={() => set(state, 'completed')} poll={poll} />
        case 'completed': return <Card>
            <Card.Body>
                <Card.Title>Grazie!</Card.Title>
                <Card.Text>
                    <p>Grazie per aver compilato il questionario!</p>
                    <p>Puoi chiudere questa pagina.</p>
                </Card.Text>
            </Card.Body>    
            <Card.Footer>
                <Button variant="danger" onClick={() => set(state, 'init')}>compila un altro questionario</Button>
            </Card.Footer>
        </Card>
    }
}