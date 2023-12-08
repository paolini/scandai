import { Card, ButtonGroup, Button } from "react-bootstrap"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import QRCode from "react-qr-code"
import { FaShareAlt, FaExternalLinkAlt } from "react-icons/fa"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import { useProfile } from "@/lib/api"
import { patchPoll, deletePoll } from "@/lib/api"
import { useAddMessage } from "@/components/Messages"
import { formatDate } from "@/lib/utils"
import questionary from "@/lib/questionary"
import { useTrans } from "@/lib/trans"

export default function PollAdmin({poll, mutate, adminSecret}:{
    poll: IGetPoll,
    mutate: () => void,
    adminSecret: string|null,
}) {
    const [tick, setTick] = useState<number>(0)
    const profile = useProfile()
    const addMessage = useAddMessage()
    const isAdmin = profile?.isAdmin
    const isSupervisor = profile && (isAdmin || profile._id === poll.createdByUser?._id)
    const router = useRouter()
    const pollUrl = `/p/${poll.secret}` 
    const fullUrl = `${window.location.origin}${pollUrl}`
    const fullAdminUrl = poll.adminSecret ? composeAdminFullUrl(poll.adminSecret) : null
    const _ = useTrans()

    useEffect(() => {
        if (!isSupervisor && !adminSecret) return
        const interval = setInterval(() => {
            setTick(tick => {
                if (tick % 6 === 0) {
                    // console.log("polling")
                    mutate()
                }
                return tick+1
            })
        }, 1000 / 2)
        return () => clearInterval(interval)
    }, [isSupervisor, adminSecret, mutate])

    if (!isSupervisor && !adminSecret) return null

    return <>
        <Card className="my-2">
            <Card.Header>
                <Card.Title>{_("Sondaggio")} {questionary.forms[poll.form].name[_.locale]}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                { isAdmin && <>{_("Creato da")} <b>{ poll.createdByUser?.name || poll.createdByUser?.username || '???' }</b> <i>{poll.createdByUser?.email}</i> {_("il (data)")} {formatDate(poll.createdAt)}<br /></>}
                Scuola: <b>{poll?.school?.name} {poll?.school?.city && ` - ${poll?.school?.city}`}</b>, classe: <b>{poll.class}</b><br />
                {_("Il sondaggio è:")} {poll.closed ? <b>{_("chiuso")}</b> : <b>{_("aperto")}</b>}<br/>
                { !poll.closed && <>{_("indirizzo compilazione:")} <b onClick={share} style={{cursor:"copy"}}>{fullUrl}</b> <br /></> }
                { isAdmin && poll.adminSecret && <>{_("indirizzo somministrazione:")} <b onClick={shareAdmin} style={{cursor:"copy"}}>{fullAdminUrl}</b><br/></>}
                {_("Questionari compilati:")} <b>{poll.entriesCount}</b> 
                { !poll.closed && <Tick tick={tick} /> } <br />
                { isAdmin && !poll.adminSecret && 
                    <Button onClick={createAdminSecret}>
                        <FaShareAlt />{_("crea link di somministrazione")}
                    </Button> }
                { isAdmin && poll.adminSecret &&
                    <Button onClick={createAdminSecret} variant="danger">
                        {_("elimina link di somministrazione")}
                    </Button> }
                <br />
                </Card.Text>
                {
                <QRCode value={fullUrl} onClick={share} style={{cursor:"copy"}}/>
                }
            </Card.Body>                
            <Card.Footer>
                <ButtonGroup>
                    { !poll.closed && 
                        <Button onClick={share}>
                            <FaShareAlt />{_("compilazione")}
                        </Button>
                    }
                    { poll.closed && 
                        <a href={`/report?poll=${poll._id}&form=${poll.form}${adminSecret?"&adminSecret="+adminSecret:""}`} className="btn btn-primary">
                            {_("report")}
                        </a>
                    }
                    { poll.closed 
                    ? <Button onClick={() => close(poll, false)}>
                        {_("riapri")}
                      </Button>
                    : <Button onClick={() => close(poll)}>
                        {_("chiudi")}
                      </Button>
                    }
                    { !adminSecret &&
                    <Link className="btn btn-primary" href="/">
                        {_("elenco")}
                    </Link>
                    }
                    { !adminSecret && poll.closed &&
                        <Button variant="danger" disabled={poll.entriesCount>0} onClick={() => remove(poll)}>
                            {_("elimina")}
                        </Button>
                    }
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <ul>
                {
                    !adminSecret && fullAdminUrl && 
                    <li>
                    {_("(precede link di somministrazione)")}
                    {} <a href={fullAdminUrl} target="_blank">{ fullAdminUrl } {}<FaExternalLinkAlt/> </a>
                    {_("(segue link di somministrazione)")}
                    </li>
                }
                <li> 
                    {_("Devi condividere con gli studenti il")} <i>{_("link (URL)")}</i> {_("di compilazione del sondaggio")}
                    {} <a href={fullUrl} target="_blank">{ fullUrl } {}<FaExternalLinkAlt/> </a>.
                    {} {_("Il link può essere copiato e condiviso oppure puoi mostrare o stampare il")} <i>{_("QR-code")}</i> {_("che contiene il link codificato.")}
                </li>
                <li>
                    {_("(frase 3)")}</li>
                <li>
                    {_("(frase 4)")}
                    { isSupervisor && !adminSecret && <>
                        {} {_("Puoi cancellare il sondaggio solo se non ci sono questionari compilati e dopo averlo chiuso.")}
                    </>}
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
            addMessage('error', `${err}`)
        }
    }

    async function remove(poll: IGetPoll) {
        try {
            await deletePoll(poll)
            mutate()
            router.push('/')
        } catch(err) {
            addMessage('error', `${err}`)
        }
    }

    function share () {
        copyToClipboard(fullUrl);
        addMessage('success', `${_("indirizzo compilazione (url) copiato:")} ${fullUrl}`)
    }

    function shareAdmin () {
        if (!fullAdminUrl) {
            addMessage('error', _("errore"))
            return
        }
        copyToClipboard(fullAdminUrl)
        addMessage('success', `${_("indirizzo somministrazione (url) copiato:")} ${fullAdminUrl}`)
    }

    function composeAdminFullUrl(adminSecret: string) {
        return `${window.location}?secret=${adminSecret}`
    }

    async function createAdminSecret () {
        try {
            const res = await patchPoll({ 
                _id: poll._id, 
                adminSecret: poll.adminSecret ? 0 : 1
            })
            await mutate()
        } catch(err) {
            addMessage('error', `${err}`)
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