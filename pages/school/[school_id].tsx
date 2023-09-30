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
    const createNew = school._id === '__new__'
    const nameState = useState<string>(school.name)
    const cityState = useState<string>(school.city)
    const [edit, setEdit] = useState<boolean>(createNew)
    const modified = value(nameState) !== school.name || value(cityState) !== school.city
    const router = useRouter()
    const addMessage = useAddMessage()
    const user = useSessionUser()
    const [share, setShare] = useState<boolean>(false)

    return <>
        <Card className="my-4">
            <Card.Header>
                <h2>Pagina amministrazione scuola</h2>
            </Card.Header>
            <Card.Body>
                <p>Nome: {}                 
                    { edit ? <Input state={nameState} /> : <b>{school.name}</b> }
                </p>
                <p>Città: {}
                    { edit ? <Input state={cityState} /> : <b>{school.city}</b> }
                </p>
            </Card.Body>
            <Card.Footer>
                { !edit && 
                <Button className="mx-2" onClick={() => setEdit(true)} variant="danger">
                    Modifica
                </Button>}
                { edit && 
                <Button className="mx-2" onClick={save} disabled={!modified}>
                    {createNew?"Crea nuovo":"Salva modifiche"}
                </Button> }
                { edit && 
                <Button className="mx-2" onClick={cancel}>
                        Annulla modifiche
                </Button>
                }
            </Card.Footer>
        </Card>

        <Card className="my-4">
            <Card.Header>
                <h2>Visualizza i questionari compilati</h2>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    Visualizza i report di ogni classe e i dati aggregati della scuola.
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button onClick={() => router.push(reportUrl("full"))}>
                    visualizza
                </Button> 
            </Card.Footer>
        </Card>

        <Card className="my-4">
            <Card.Header>
                <h2>Condividi i questionari compilati</h2>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    Crea un link per condividere i report di ogni classe e i dati aggregati della scuola.
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
                    <FaShareAlt /> crea indirizzo condivisione report
                </Button>
                }
                { school.reportSecret &&
                <Button onClick={createReportSecret} variant="danger">
                    cancella indirizzo
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
                city: value(cityState)
            })
        } else {
            await patchSchool({
                _id: school._id,
                name: value(nameState),
                city: value(cityState)
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
    }

    async function remove() {
        await deleteSchool(school)
        await addMessage("warning", `Scuola ${school.name} eliminata`)
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
                addMessage('error', `impossibile copiare l'indirizzo di condivisione report`)
                return
            }
            const absoluteUrl = reportAbsoluteUrl(form)
            copyToClipboard(absoluteUrl)
            addMessage('success', `indirizzo somministrazione (url) copiato: ${absoluteUrl}`)
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
            addMessage('error', `errore nella creazione/rimozione del link di condivisione report: ${err}`)
        }
    }
}

function SchoolPolls({school}: {school: IGetSchool}) {
    const router = useRouter()
    const pollsQuery = usePolls({school_id: school._id})
    if (pollsQuery.isLoading) return <Loading />
    if (!pollsQuery.data) return <Error>{pollsQuery.error}</Error>
    const polls = pollsQuery.data.data
    if (polls.length === 0) return <p>Nessun questionario</p>
    return <Card className="my-2 table-responsive">
        <Card.Header>
            <h2>questionari</h2>
        </Card.Header>
        <Card.Body>
        <Table hover>
            <thead>
                <th></th>
                <th>tipo</th>
                <th>data</th>
                <th>ora</th>
                <th>classe</th>
                <th>conteggio</th>
                <th>report</th>
            </thead>
            <tbody>
                {polls.map(poll =>
                    <tr key={poll._id} onClick={()=>router.push(`/poll/${poll._id}`)}>
                        <td>{poll.closed?'':'•'}</td>
                        <td>{poll.form}</td>
                        <td>{formatDate(poll.date)}</td>
                        <td>{formatTime(poll.date)}</td>
                        <td>{poll.class}</td>
                        <td>{poll.entriesCount}</td>
                        <td>{poll.closed && <Button onClick={() => router.push(`/report?form=${poll.form}&poll=${poll._id}`)}>report</Button>}</td>
                    </tr>
                )}
            </tbody>
        </Table>
        </Card.Body>
    </Card>
}
