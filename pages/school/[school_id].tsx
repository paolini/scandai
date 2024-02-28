import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, Button, ButtonGroup, Table } from 'react-bootstrap'
import copyToClipboard from 'copy-to-clipboard'
import { FaShareAlt } from "react-icons/fa"

import Page from '@/components/Page'
import { useSchool, patchSchool, postSchool, deleteSchool, usePolls } from '@/lib/api'
import { IGetSchool } from '@/models/School'
import Loading from '@/components/Loading'
import Input from '@/components/Input'
import { value, set } from '@/lib/State'
import { useAddMessage } from '@/components/Messages'
import Error from '@/components/Error'
import questionary from '@/lib/questionary'
import useSessionUser from '@/lib/useSessionUser'
import { formatDate, formatTime } from '@/lib/utils'
import { useTrans } from '@/lib/trans'

function useRouterQuery(key: string): string | null {
    const router = useRouter()
    const val = router.query[key]
    if (!val) return null
    if (Array.isArray(val)) return null
    return val
}

export default function SchoolId({}) {
    const school_id = useRouterQuery('school_id')
    console.log(`SchoolId: ${school_id}`)
    const { data: school, isLoading, error, mutate } = useSchool(school_id)
    if (isLoading) return <Loading /> 
    if (!school) return <Error>{`${error}`}</Error>
    return <Page>
        <School school={school} mutate={mutate} />
    </Page>
}

function School({ school, mutate } : { 
    school: IGetSchool, mutate: () => void 
}) {
    const _ = useTrans()
    const createNew = school._id === '__new__'
    const nameState = useState<string>(school.name)
    const cityState = useState<string>(school.city)
    const cityFuState = useState<string>(school.city_fu)
    const [edit, setEdit] = useState<boolean>(createNew)
    const modified = value(nameState) !== school.name || value(cityState) !== school.city || value(cityFuState) !== school.city_fu
    const router = useRouter()
    const addMessage = useAddMessage()

    return <>
        <Card className="my-4">
            <Card.Header>
                <h2>{_("Pagina amministrazione scuola")}</h2>
            </Card.Header>
            <Card.Body>
                <p>{_("Nome")}: {}                 
                    { edit ? <Input state={nameState} /> : <b>{school.name}</b> }
                </p>
                <p>{_("Città (in italiano)")}: {}
                    { edit ? <Input state={cityState} /> : <b>{school.city}</b> }
                </p>
                <p>{_("Città (in friulano)")}: {}
                    { edit ? <Input state={cityFuState} /> : <b>{school.city_fu}</b> }
                </p>
            </Card.Body>
            <Card.Footer>
                { !edit && 
                <Button className="mx-2" onClick={() => setEdit(true)} variant="danger">
                    {_("Modifica")}
                </Button>}
                { edit && 
                <Button className="mx-2" onClick={save} disabled={!modified}>
                    {createNew?_("Crea nuovo"):_("Salva modifiche")}
                </Button> }
                { edit && 
                <Button className="mx-2" onClick={cancel}>
                        {_("Annulla modifiche")}
                </Button>
                }
            </Card.Footer>
        </Card>

        <Card className="my-4">
            <Card.Header>
                <h2>{_("Visualizza i questionari compilati")}</h2>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    {_("Visualizza i report di ogni classe e i dati aggregati della scuola.")}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button onClick={() => router.push(reportUrl("full"))}>
                    {_("visualizza")}
                </Button> 
            </Card.Footer>
        </Card>

        <Card className="my-4">
            <Card.Header>
                <h2>{_("Condividi i questionari compilati")}</h2>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    {_("Crea un link per condividere i report di ogni classe e i dati aggregati della scuola.")}
                </Card.Text>
                { school.reportSecret &&
                <p>
                    <b onClick={shareReport("full")} style={{cursor:"copy"}}>{reportAbsoluteUrl("full")}</b>
                </p>
                }
            </Card.Body>
            <Card.Footer>
                { !school.reportSecret &&
                <Button onClick={createReportSecret}>
                    <FaShareAlt /> {_("crea indirizzo condivisione report")}
                </Button>
                }
                { school.reportSecret &&
                <Button onClick={createReportSecret} variant="danger">
                    {_("cancella indirizzo")}
                </Button>
                }            
            </Card.Footer>
        </Card>
    { !createNew && false &&
        <SchoolPolls school={school}/>
    }
    </>

    async function save() {
        if (createNew) {
            await postSchool({
                name: value(nameState),
                city: value(cityState),
                city_fu: value(cityFuState),
            })
        } else {
            await patchSchool({
                _id: school._id,
                name: value(nameState),
                city: value(cityState),
                city_fu: value(cityFuState),
            })
        }
        await mutate()
        setEdit(false)
        if (createNew) {
            router.push('/school')
        }
    }

    async function cancel() {
        setEdit(false)
        set(nameState, school.name)
        set(cityState, school.city)
        set(cityFuState, school.city_fu)
    }

    async function remove() {
        await deleteSchool(school)
        await mutate()
        router.push('/school')
    }

    function reportUrl(form: string) {
        return `/report?form=${form}&school_id=${school._id}`
    }

    function reportAbsoluteUrl(form: string) {
        const secretPart = school.reportSecret ? `&schoolSecret=${school.reportSecret}` : ''
        return `${window.location.origin}${reportUrl(form)}${secretPart}`
    }

    function shareReport(form: string) {
        return () => {
            if (!school.reportSecret) {
                addMessage('error', _("impossibile copiare l'indirizzo di condivisione report"))
                return
            }
            const absoluteUrl = reportAbsoluteUrl(form)
            copyToClipboard(absoluteUrl)
            addMessage('success', _("indirizzo somministrazione (url) copiato") + `: ${absoluteUrl}`)
        }
    }

    async function createReportSecret () {
        try {
            const res = await patchSchool({ 
                _id: school._id, 
                reportSecret: school.reportSecret ? '0' : '1',
            })
            await mutate()
        } catch(err) {
            addMessage('error', _("errore nella creazione/rimozione del link di condivisione report")+`: ${err}`)
        }
    }
}

function SchoolPolls({school}: {school: IGetSchool}) {
    const _ = useTrans()
    const router = useRouter()
    const pollsQuery = usePolls({school_id: school._id})
    if (pollsQuery.isLoading) return <Loading />
    if (!pollsQuery.data) return <Error>{pollsQuery.error}</Error>
    const polls = pollsQuery.data.data
    if (polls.length === 0) return <p>{_("Nessun questionario")}</p>
    return <Card className="my-2 table-responsive">
        <Card.Header>
            <h2>{_("questionari")}</h2>
        </Card.Header>
        <Card.Body>
        <Table hover>
            <thead>
                <th></th>
                <th>{_("tipo")}</th>
                <th>{_("data")}</th>
                <th>{_("ora")}</th>
                <th>{_("classe")}</th>
                <th>{_("conteggio")}</th>
                <th>{_("report")}</th>
            </thead>
            <tbody>
                {polls.map(poll =>
                    <tr key={poll._id} onClick={()=>router.push(`/poll/${poll._id}`)}>
                        <td>{poll.closed?'':'•'}</td>
                        <td>{poll.form}</td>
                        <td>{formatDate(poll.date)}</td>
                        <td>{formatTime(poll.date)}</td>
                        <td>{poll?.year}&nbsp;{poll.class}</td>
                        <td>{poll.entriesCount}</td>
                        <td>{poll.closed && <Button onClick={() => router.push(`/report?form=${poll.form}&poll=${poll._id}`)}>{_("report")}</Button>}</td>
                    </tr>
                )}
            </tbody>
        </Table>
        </Card.Body>
    </Card>
}
