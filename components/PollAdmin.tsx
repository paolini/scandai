import { Card, ButtonGroup, Button } from "react-bootstrap"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import QRCode from "react-qr-code"
import { FaShareAlt, FaExternalLinkAlt } from "react-icons/fa"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import useSessionUser from "@/lib/useSessionUser"
import { patchPoll, deletePoll } from "@/lib/api"
import { useAddMessage } from "@/components/Messages"
import { formatDate } from "@/lib/utils"
import questionary from "@/lib/questionary"

export default function PollAdmin({poll, mutate}:{
    poll: IGetPoll,
    mutate: () => void,
}) {
    const [tick, setTick] = useState<number>(0)
    const user = useSessionUser()
    const addMessage = useAddMessage()
    const isSupervisor = user && (user.isAdmin || user._id === poll.createdByUser._id)
    const router = useRouter()
    const pollUrl = `/p/${poll.secret}` 
    const fullUrl = `${window.location.origin}${pollUrl}`

    useEffect(() => {
        console.log('poll admin effect', isSupervisor)
        if (!isSupervisor) return
        const interval = setInterval(() => {
            setTick(tick => {
                if (tick % 6 === 0) {
                    console.log("polling")
                    mutate()
                }
                return tick+1
            })
        }, 1000 / 2)
        return () => clearInterval(interval)
    }, [isSupervisor, mutate])

    if (!isSupervisor) return null

    return <>
        <Card className="my-2">
            <Card.Header>
                <Card.Title>Sondaggio {questionary.forms[poll.form].name}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                { user.isAdmin && <>Creato da <b>{ poll.createdByUser?.name || poll.createdByUser?.username || '???' }</b> <i>{poll.createdByUser?.email}</i> il {formatDate(poll.createdAt)}<br /></>}
                Scuola: <b>{poll?.school?.name} {poll?.school?.city && ` - ${poll?.school?.city}`}</b>, classe: <b>{poll.class}</b><br />
                Il sondaggio è: {poll.closed ? <b>chiuso</b> : <b>aperto</b>}<br/>
                { !poll.closed && <>indirizzo: <b onClick={share} style={{cursor:"copy"}}>{fullUrl}</b> <br /></> }
                Questionari compilati: <b>{poll.entriesCount}</b> 
                { !poll.closed && <Tick tick={tick} /> }
                </Card.Text>
                <QRCode value={fullUrl} onClick={share} style={{cursor:"copy"}}/>
            </Card.Body>                
            <Card.Footer>
                <ButtonGroup>
                    { false && !poll.closed &&
                        <Button onClick={() => window.open(pollUrl,"_blank")}>
                            compila
                        </Button>
                    }
                    { !poll.closed && 
                        <Button onClick={share}>
                            <FaShareAlt /> condividi
                        </Button>
                    }
                    { poll.closed && 
                        <a href={`/report?poll=${poll._id}&form=${poll.form}`} className="btn btn-primary">
                            report
                        </a>
                    }
                    { poll.closed 
                    ? <Button onClick={() => close(poll, false)}>
                        riapri
                      </Button>
                    : <Button onClick={() => close(poll)}>
                        chiudi
                      </Button>
                    }
                    <Link className="btn btn-primary" href="/">
                        elenco
                    </Link>
                    { poll.closed &&
                        <Button variant="danger" disabled={poll.entriesCount>0} onClick={() => remove(poll)}>
                            elimina
                        </Button>
                    }
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <ul>
                <li> 
                    Devi condividere con gli studenti il <i>link (URL)</i> del sondaggio
                    {} <a href={fullUrl} target="_blank">{ fullUrl } {}<FaExternalLinkAlt/> </a>.
                    Il link può essere copiato e condiviso oppure puoi 
                    mostrare o stampare il <i>QR-code</i> che contiene il link codificato.
                    Premendo il pulsante <i>compila</i>
                    {} puoi vedere il sondaggio come lo vedono gli studenti
                    (ma solo gli studenti devono inviare il sondaggio).
                </li>
                <li>
                    Quando tutti gli studenti hanno compilato il questionario puoi chiudere il sondaggio.
                    Chi ha iniziato a compilare il questionario prima della 
                    chiusura potrà comunque concludere la compilazione.
                </li>
                <li>
                    A sondaggio chiuso si potranno vedere i report.
                    Puoi cancellare il sondaggio solo se non ci sono questionari compilati
                    e dopo averlo chiuso.
                </li>
        </ul>
    </>

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

    function share () {
        copyToClipboard(fullUrl);
        addMessage('success', `indirizzo (url) copiato: ${fullUrl}`)
    }
}

function Tick({tick}:{tick:number}) {
    let s = [
        '\u2022\u00b7\u00b7',
        '\u00b7\u00b7\u00b7',
        '\u00b7\u2022\u00b7',
        '\u00b7\u00b7\u00b7',
        '\u00b7\u00b7\u2022',
        '\u00b7\u00b7\u00b7',
    ][tick % 6]
    return <span className="mx-2" style={{fontFamily: 'monospace'}}>{s}</span>
}