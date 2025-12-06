import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, Button, Table } from 'react-bootstrap'
import copyToClipboard from 'copy-to-clipboard'
import { FaShareAlt } from "react-icons/fa"
import { gql, useQuery, useMutation } from "@apollo/client"

import Page from '@/components/Page'
import { Poll, School, SchoolType } from '@/generated/graphql'
import Loading from '@/components/Loading'
import Input from '@/components/Input'
import { value, set, State } from '@/lib/State'
import { useAddMessage } from '@/components/Messages'
import Error from '@/components/Error'
import { formatDate, formatTime, currentSchoolYear } from '@/lib/utils'
import { useTrans } from '@/lib/trans'
import MutationButton from '@/components/MutationButton'
import { PollQuery } from '@/lib/api'
import { schoolType } from '@/lib/questionary'

function useRouterQuery(key: string): string | null {
    const router = useRouter()
    const val = router.query[key]
    if (!val) return null
    if (Array.isArray(val)) return null
    return val
}

const SchoolQuery = gql`
    query SchoolQuery($_id: ObjectId) {
        school(_id: $_id) {
            _id
            name
            city
            city_fu
            type
            reportSecret
        }
    }`

export default function SchoolId({}) {
    const q = useRouterQuery('school_id')
    const school_id = q && q !== '__new__' ? q : null
    return <Page>
        <Inner school_id={school_id} />
    </Page>
}

function Inner({school_id}:{school_id:string|null}) {
    const { data, loading, error } = useQuery(SchoolQuery, {
        variables:{_id: school_id}
    })
    const school = data?.school
    if (loading) return <Loading /> 
    if (!school) return <Error>{`${error}`}</Error>
    return <TheSchool school={school} />
}

const NewSchoolMutation = gql`
    mutation ($data: SchoolData!) {
        newSchool(data: $data) {
            _id
        }
    }`

const PatchSchoolMutation = gql`
    mutation ($_id: ObjectId!, $data: SchoolData!) {
        patchSchool(_id: $_id, data: $data) {
            _id
        }
    }`

function TheSchool({ school } : { 
    school: School
}) {
    const _ = useTrans()
    const createNew = !school._id
    const original_name = school.name || ''
    const nameState = useState<string>(original_name)
    const original_city = school.city || ''
    const cityState = useState<string>(original_city)
    const original_city_fu = school.city_fu || ''
    const cityFuState = useState<string>(original_city_fu)
    const typeState = useState<string>(school.type || 'second')
    const [edit, setEdit] = useState<boolean>(createNew)
    const modified = value(nameState) !== original_name || value(cityState) !== original_city || value(cityFuState) !== original_city_fu || value(typeState) !== (school.type || 'second')
    const router = useRouter()
    const addMessage = useAddMessage()
    const year = currentSchoolYear()
    const [mutate, {loading,error}] = useMutation(createNew ? NewSchoolMutation : PatchSchoolMutation)
    const secretMutationOptions={variables:{_id: school._id},refetchQueries:[SchoolQuery]}

    return <>
        <Card className="my-4">
            <Card.Header>
                <h2>{createNew 
                    ? _("Pagina creazione scuola")
                    : _("Pagina amministrazione scuola")
                }</h2>
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
                <p>{_("Grado")}: {}
                    { edit ? <SchoolTypeSelector state={typeState} /> : <b>{(schoolType[(school.type || 'second') as keyof typeof schoolType] as any)[_.locale]}</b> }
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
    { !createNew &&
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
                <Button onClick={() => router.push(reportUrl())}>
                    {_("visualizza")}
                </Button> 
            </Card.Footer>
        </Card> }

    { !createNew &&
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
                <MutationButton query={gql`mutation($_id:ObjectId!) {schoolCreateSecret(_id:$_id){_id}}`} options={secretMutationOptions}>
                    <FaShareAlt /> {_("crea indirizzo condivisione report")}
                </MutationButton>
                }
                { school.reportSecret &&
                <MutationButton query={gql`mutation($_id:ObjectId!) {schoolRemoveSecret(_id:$_id){_id}}`} options={secretMutationOptions} variant="danger">
                    {_("cancella indirizzo")}
                </MutationButton>
                }            
            </Card.Footer>
        </Card>}
    { !createNew && false &&
        <SchoolPolls school={school}/>
    }
    </>

    async function save() {
        const _id = school._id
        const data = {
            name: value(nameState),
            city: value(cityState),
            city_fu: value(cityFuState),
            type: value(typeState) as SchoolType,
        }

        if (createNew) {
            await mutate({
                variables: {data},
                onCompleted: () => router.push('/school')
            })
        } else {
            await mutate({
                variables: {_id, data},
                refetchQueries: [SchoolQuery]})
        }
        setEdit(false)
    }

    async function cancel() {
        setEdit(false)
        set(nameState, original_name)
        set(cityState, original_city)
        set(cityFuState, original_city_fu)
    }

    function reportUrl() {
        return `/report?school_id=${school._id}&year=${year}`
    }

    function reportAbsoluteUrl(form: string) {
        const secretPart = school.reportSecret ? `&schoolSecret=${school.reportSecret}` : ''
        return `${window.location.origin}${reportUrl()}${secretPart}`
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
}

function SchoolTypeSelector({state}:{state: State<string>}) {
    const _ = useTrans()
    return <select
        className="form-control"
        value={value(state)}
        onChange={e => set(state, e.target.value)}
        >
        <option value="primary">{schoolType['primary'][_.locale]}</option>
        <option value="first">{schoolType['first'][_.locale]}</option>
        <option value="second">{schoolType['second'][_.locale]}</option>
    </select>
}

function SchoolPolls({school}: {school: School}) {
    const _ = useTrans()
    const router = useRouter()
    const pollsQuery = useQuery(PollQuery, {variables:{school_id: school._id}})
    if (pollsQuery.loading) return <Loading />
    if (!pollsQuery.data) return <Error>{`${pollsQuery.error}`}</Error>
    const polls: Poll[] = pollsQuery.data.polls
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
