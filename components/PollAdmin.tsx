import { Card, ButtonGroup, Button } from "react-bootstrap"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useQuery, useMutation, gql } from "@apollo/client"
import Link from "next/link"
import QRCode from "react-qr-code"
import { FaShareAlt, FaExternalLinkAlt } from "react-icons/fa"
import copyToClipboard from 'copy-to-clipboard'

import { ProfileQuery, PollsQuery } from "@/lib/api"
import { patchPoll, deletePoll } from "@/lib/api"
import { useAddMessage } from "@/components/Messages"
import { formatDate, upperFirst } from "@/lib/utils"
import questionary from "@/lib/questionary"
import { useTrans } from "@/lib/trans"
import { Poll } from "@/generated/graphql"
import Error from '@/components/Error'

const PollSetAdminSecretMutation = gql`
    mutation ($_id: ObjectId!, $secret: Boolean) {
        patchPoll(_id: $_id, secret: $secret) {
            adminSecret
        }
    }
`

const PollSetCloseMutation = gql`
    mutation ($_id: ObjectId!, $adminSecret: String, $closed: Boolean) {
        patchPoll(_id: $_id, secret: $adminSecret, closed: $closed) {
            closed
        }
    }
`

export default function PollAdmin({poll, adminSecret}:{
    poll: Poll,
    adminSecret?: string,
}) {
    const [tick, setTick] = useState<number>(0)
    const addMessage = useAddMessage()
    const profileQuery = useQuery(ProfileQuery)
    const profile = profileQuery.data?.profile
    const isAdmin = profile?.isAdmin
    const isSupervisor = profile && (isAdmin || profile?._id === poll.createdBy?._id)
    const router = useRouter()
    const pollUrl = `/p/${poll.secret}` 
    const fullUrl = `${window.location.origin}${pollUrl}`
    const fullAdminUrl = poll.adminSecret ? composeAdminFullUrl(poll.adminSecret) : null
    const _ = useTrans()
    const [setCloseMutation, {loading: loadingClose, error: errorClose}] = useMutation(PollSetCloseMutation)
    const [setAdminSecret, {loading: loadingAdminSecret, error: errorAdminSecret}] = useMutation(PollSetAdminSecretMutation)
    const pollQuery = useQuery(PollsQuery, {
        variables: {
            _id: poll._id,
            adminSecret
        },
        //pollInterval: 1000,
        skip: !isSupervisor && !adminSecret,
    })
    useEffect(() => {
        const interval = setInterval(() => setTick(tick => tick+1), 1000 / 2)
        return () => clearInterval(interval)
    }, [])

    return <>
        <Card className="my-2">
            <Card.Header>
                <Card.Title>{_("Pagina di amministrazione")}: {_("Sondaggio")} {poll.form && questionary.forms[poll.form].name[_.locale]}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                { isAdmin && <>{_("Creato da")} <b>{ poll.createdBy?.name || poll.createdBy?.username || '???' }</b> <i>{poll.createdBy?.email}</i> {_("il (data)")} {formatDate(poll.createdAt)}<br /></>}
                {upperFirst(_("scuola"))}: <b>{poll?.school?.name} {poll?.school?.city && ` - ${poll?.school?.city}`}</b>, {}
                {_("classe")}: <b>{poll.class}</b><br />
                {_("Il sondaggio è:")} {poll.closed ? <b>{_("chiuso")}</b> : <b>{_("aperto")}</b>}<br/>
                { !poll.closed && <>{_("indirizzo compilazione:")} <b onClick={share} style={{cursor:"copy"}}>{fullUrl}</b> <br /></> }
                { isAdmin && poll.adminSecret && <>{_("indirizzo somministrazione")}: <b onClick={shareAdmin} style={{cursor:"copy"}}>{fullAdminUrl}</b><br/></>}
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
                { errorClose && <Error>{`${errorClose}`}</Error>}
                <ButtonGroup>
                    { !poll.closed && 
                        <Button onClick={share}>
                            <FaShareAlt />{_("compilazione")}
                        </Button>
                    }
                    { poll.closed && 
                        <a href={`/report?poll=${poll._id}${adminSecret?"&adminSecret="+adminSecret:""}`} className="btn btn-primary">
                            {_("report")}
                        </a>
                    }
                    { poll.closed 
                    ? <Button disabled={loadingClose} onClick={() => close(poll, false)}>
                        {_("riapri")}
                      </Button>
                    : <Button disabled={loadingClose} onClick={() => close(poll)}>
                        {_("chiudi")}
                      </Button>
                    }
                    { !adminSecret &&
                    <Link className="btn btn-primary" href="/">
                        {_("elenco")}
                    </Link>
                    }
                    { !adminSecret && poll.closed &&
                        <Button variant="danger" disabled={poll.entriesCount!==null && poll.entriesCount>0 && !isAdmin} onClick={() => remove(poll)}>
                            {_("elimina")}
                        </Button>
                    }
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <Card>
            <Card.Header>
                <Card.Title>{_("Istruzioni")}</Card.Title>
            </Card.Header>
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
                        { isAdmin && <>{} {_("Puoi cancellare un sondaggio chiuso perché sei un utente amministratore.")}</>}
                    </li>
            </ul>                    
        </Card>
    </>

    async function close(poll: Poll, close=true) {
        setCloseMutation({
            variables: {_id: poll._id, adminSecret, closed: !!close},
            refetchQueries: [PollsQuery]
        })
    }

    async function remove(poll: Poll) {
        // TODO: convert to GRAPHQL
        /*
        try {
            await deletePoll(poll)
            mutate()
            router.push('/')
        } catch(err) {
            addMessage('error', `${err}`)
        }
        */
    }

    function share () {
        copyToClipboard(fullUrl);
        addMessage('success', `${_("indirizzo compilazione (url) copiato")}: ${fullUrl}`)
    }

    function shareAdmin () {
        if (!fullAdminUrl) {
            addMessage('error', _("errore"))
            return
        }
        copyToClipboard(fullAdminUrl)
        addMessage('success', `${_("indirizzo somministrazione (url) copiato")}: ${fullAdminUrl}`)
    }

    function composeAdminFullUrl(adminSecret: string) {
        return `${window.location}?secret=${adminSecret}`
    }

    async function createAdminSecret () {
        // TODO: convert to GRAPHQL
        /*
        try {
            const res = await patchPoll({ 
                _id: poll._id, 
                adminSecret: poll.adminSecret ? 0 : 1
            })
            await mutate()
        } catch(err) {
            addMessage('error', `${err}`)
        }
        */
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