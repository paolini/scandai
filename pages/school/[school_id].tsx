import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, Button, ButtonGroup } from 'react-bootstrap'
import copyToClipboard from 'copy-to-clipboard'
import { FaShareAlt } from "react-icons/fa"

import Page from '@/components/Page'
import { useSchool, patchSchool, postSchool, deleteSchool } from '@/lib/api'
import { IGetSchool } from '@/models/School'
import Loading from '@/components/Loading'
import Input from '@/components/Input'
import { value } from '@/lib/State'
import { useAddMessage } from '@/components/Messages'
import Error from '@/components/Error'
import questionary from '@/lib/questionary'
import useSessionUser from '@/lib/useSessionUser'


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

    return <Card>
        <Card.Header>
            <h2>Scuola</h2>
        </Card.Header>
        <Card.Body>
            <p>Nome: {}                 
                { edit ? <Input state={nameState} /> : <b>{school.name}</b> }
            </p>
            <p>Città: {}
                { edit ? <Input state={cityState} /> : <b>{school.city}</b> }
            </p>
            { school.reportSecret &&
             Object.keys(questionary.forms).map(form =>
                <p>indirizzo condivisione report {form}: {}
                <b onClick={shareReport(form)} style={{cursor:"copy"}}>{reportAbsoluteUrl(form)}</b>
                </p>)
            }
            { school.reportSecret &&
                <Button onClick={createReportSecret} variant="danger">
                    cancella indirizzo condivisione report "full"
                </Button>
            }
            { !school.reportSecret &&
                <Button onClick={createReportSecret}>
                            <FaShareAlt /> crea indirizzo condivisione report "full"
                </Button>
            }
        </Card.Body>
        <Card.Footer>
            <ButtonGroup>
                <Button onClick={() => router.push('/school')}>
                    {createNew?"Annulla":"Elenco"}
                </Button>
                { Object.keys(questionary.forms).map(form => 
                    <Button key={form} onClick={() => router.push(reportUrl(form))}>
                    report {form}
                    </Button>)}
                { !edit && <Button onClick={() => setEdit(true)} variant="danger">
                    Modifica
                </Button>}
                { edit && <Button onClick={save} disabled={!modified}>
                    {createNew?"Crea nuovo":"Salva modifiche"}
                </Button> }
                { edit && !createNew && <Button variant="danger" onClick={remove}>
                    Elimina
                </Button> }
            </ButtonGroup>
        </Card.Footer>
    </Card>

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
