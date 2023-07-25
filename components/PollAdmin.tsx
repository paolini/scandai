import { Card, ButtonGroup, Button } from "react-bootstrap"
import { useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import QRCode from "react-qr-code"
import { FaShareAlt } from "react-icons/fa"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import useSessionUser from "@/lib/useSessionUser"
import { patchPoll, deletePoll } from "@/lib/api"
import { useAddMessage } from "@/components/Messages"
import { formatDate } from "@/lib/utils"

export default function PollAdmin({poll, mutate}:{
    poll: IGetPoll,
    mutate: () => void,
}) {
    const user = useSessionUser()
    const addMessage = useAddMessage()
    const isSupervisor = user && (user.isAdmin || user._id === poll.createdBy._id)
    const router = useRouter()
    const pollUrl = `/p/${poll.secret}` 
    const fullUrl = `${window.location.origin}${pollUrl}`

    useEffect(() => {
        console.log('poll admin effect', isSupervisor)
        if (!isSupervisor) return
        const interval = setInterval(() => {
            console.log("tick")
            mutate()
        }, 1000 * 3)
        return () => clearInterval(interval)
    }, [isSupervisor, mutate])

    if (!isSupervisor) return null

    async function close(poll: IGetPoll, close=true) {
        try {
            await patchPoll({
                _id: poll._id, 
                closed: !!close,   
                })
            mutate()
        } catch(err) {
            addMessage('error', `errore nella chiusura del sondaggio: ${err}`)
        }
    }

    async function remove(poll: IGetPoll) {
        try {
            await deletePoll(poll)
            mutate()
            router.push('/')
        } catch(err) {
            addMessage('error', `errore nella cancellazione del sondaggio: ${err}`)
        }
    }

    return <>
        <Card className="my-2">
            <Card.Header>
                <Card.Title>Sondaggio</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                { user.isAdmin && <>Creato da <b>{poll.createdBy.name || poll.createdBy.username }</b> <i>{poll.createdBy.email}</i> il {formatDate(poll.createdAt)}<br /></>}
                Il sondaggio è: <b>{poll.closed ? 'chiuso' : 'aperto'}</b><br/>
                Questionari compilati: <b>{poll.entriesCount}</b>
                </Card.Text>
            </Card.Body>                
            <Card.Footer>
                <ButtonGroup>
                    <Link className="btn btn-primary" href="/">torna all&apos;elenco</Link>
                    { poll.closed && 
                        <a href={`/report?poll=${poll._id}&form=${poll.form}`} className="btn btn-success">vedi report</a>
                    }
                    { poll.closed 
                    ? <Button variant="warning" onClick={() => close(poll, false)}>riapri</Button>
                    : <Button variant="warning" onClick={() => close(poll)}>chiudi sondaggio</Button>
                    }
                    { poll.closed &&
                        <Button variant="danger" disabled={poll.entriesCount>0} onClick={() => remove(poll)}>elimina</Button>
                    }
                </ButtonGroup>
            </Card.Footer>
        </Card>
        { !poll.closed &&
        <div className="d-flex flex-column">
            <Button className="flex m-4" variant="success" size="lg" onClick={() => router.push(pollUrl)}>
                compila il sondaggio
            </Button>
            <Button className="flex m-4" size="lg" onClick={() => {
                copyToClipboard(fullUrl);
                addMessage('success', 'indirizzo (url) copiato')}}>
                <FaShareAlt /> copia il link (URL)
            </Button>
            <QRCode className="flex m-4 w-100" value={fullUrl} />
        </div>
        }
    </>
}