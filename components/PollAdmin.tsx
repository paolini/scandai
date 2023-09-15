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

export default function PollAdmin({poll, mutate, adminSecret}:{
    poll: IGetPoll,
    mutate: () => void,
    adminSecret: string|null,
}) {
    const [tick, setTick] = useState<number>(0)
    const user = useSessionUser()
    const addMessage = useAddMessage()
    const isSupervisor = user && (user.isAdmin || user._id === poll.createdByUser._id)
    const router = useRouter()
    const pollUrl = `/p/${poll.secret}` 
    const fullUrl = `${window.location.origin}${pollUrl}`
    const fullAdminUrl = poll.adminSecret ? composeAdminFullUrl(poll.adminSecret) : null

    useEffect(() => {
        if (!isSupervisor && !adminSecret) return
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

    if (!isSupervisor && !adminSecret) return null

    return <>
        <Card className="my-2">
            <Card.Header>
                <Card.Title>Sondaggio {questionary.forms[poll.form].name}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                { user?.isAdmin && <>Creato da <b>{ poll.createdByUser?.name || poll.createdByUser?.username || '???' }</b> <i>{poll.createdByUser?.email}</i> il {formatDate(poll.createdAt)}<br /></>}
                Scuola: <b>{poll?.school?.name} {poll?.school?.city && ` - ${poll?.school?.city}`}</b>, classe: <b>{poll.class}</b><br />
                Il sondaggio è: {poll.closed ? <b>chiuso</b> : <b>aperto</b>}<br/>
                { !poll.closed && <>indirizzo compilazione: <b onClick={share} style={{cursor:"copy"}}>{fullUrl}</b> <br /></> }
                { user?.isAdmin && poll.adminSecret && <>indirizzo somministrazione: <b onClick={shareAdmin} style={{cursor:"copy"}}>{fullAdminUrl}</b><br/></>}
                Questionari compilati: <b>{poll.entriesCount}</b> 
                { !poll.closed && <Tick tick={tick} /> } <br />
                { user?.isAdmin && !poll.adminSecret && <Button onClick={createAdminSecret}><FaShareAlt />crea link di somministrazione</Button> }<br />
                </Card.Text>
                <QRCode value={fullUrl} onClick={share} style={{cursor:"copy"}}/>
            </Card.Body>                
            <Card.Footer>
                <ButtonGroup>
                    { !poll.closed && 
                        <Button onClick={share}>
                            <FaShareAlt />compilazione
                        </Button>
                    }
                    { poll.closed && 
                        <a href={`/report?poll=${poll._id}&form=${poll.form}&adminSecret=${adminSecret}`} className="btn btn-primary">
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
                    { !adminSecret &&
                    <Link className="btn btn-primary" href="/">
                        elenco
                    </Link>
                    }
                    { !adminSecret && poll.closed &&
                        <Button variant="danger" disabled={poll.entriesCount>0} onClick={() => remove(poll)}>
                            elimina
                        </Button>
                    }
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <ul>
                <li> 
                    Devi condividere con gli studenti il <i>link (URL)</i> di compilazione del sondaggio
                    {} <a href={fullUrl} target="_blank">{ fullUrl } {}<FaExternalLinkAlt/> </a>.
                    Il link può essere copiato e condiviso oppure puoi 
                    mostrare o stampare il <i>QR-code</i> che contiene il link codificato.
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
                }, adminSecret || undefined)
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
        addMessage('success', `indirizzo compilazione (url) copiato: ${fullUrl}`)
    }

    function shareAdmin () {
        if (!fullAdminUrl) {
            addMessage('error', `impossibile copiare l'indirizzo di somministrazione`)
            return
        }
        copyToClipboard(fullAdminUrl)
        addMessage('success', `indirizzo somministrazione (url) copiato: ${fullAdminUrl}`)
    }

    function composeAdminFullUrl(adminSecret: string) {
        return `${window.location}?secret=${adminSecret}`
    }

    async function createAdminSecret () {
        try {
            const res = await patchPoll({ 
                _id: poll._id, 
                adminSecret: 1
            })
            const adminSecret = res.data.adminSecret
            const adminFullUrl = composeAdminFullUrl(adminSecret)
            copyToClipboard(adminFullUrl)
            addMessage('success', `admin secret copiato: ${adminFullUrl}`)
        } catch(err) {
            addMessage('error', `errore nella creazione del link di somministrazione: ${err}`)
        }
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