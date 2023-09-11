import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, Button, ButtonGroup } from 'react-bootstrap'

import Page from '@/components/Page'
import { useSchool, patchSchool, deleteSchool } from '@/lib/api'
import { IGetSchool } from '@/models/School'
import Loading from '@/components/Loading'
import Input from '@/components/Input'
import { value } from '@/lib/State'
import { useAddMessage } from '@/components/Messages'
import Error from '@/components/Error'

function useRouterQuery(key: string): string | null {
    const router = useRouter()
    const val = router.query[key]
    if (!val) return null
    if (Array.isArray(val)) return ''
    return val
}

export default function SchoolId({}) {
    const school_id = useRouterQuery('school_id')
    const { data: school, error, mutate } = useSchool(school_id==='new' ? null : school_id)
    if (error) return <Error>{JSON.stringify(error.message)}</Error>
    if (!school) return <Loading /> 
    return <Page>
        <School school={school} mutate={mutate} />
    </Page>
}

function School({ school, mutate } : { 
    school: IGetSchool, mutate: () => void 
}) {
    const nameState = useState<string>(school.name)
    const cityState = useState<string>(school.city)
    const [edit, setEdit] = useState<boolean>(false)
    const modified = value(nameState) !== school.name ||  value(cityState) !== school.city
    const router = useRouter()
    const addMessage = useAddMessage()

    return <Card>
        <Card.Header>
            <h2>Scuola</h2>
        </Card.Header>
        <Card.Body>
            <p><b>Nome:</b> {}                 
                { edit ? <Input state={nameState} /> : school.name }
            </p>
            <p><b>Città:</b> {}
                { edit ? <Input state={cityState} /> : school.city }
            </p>
        </Card.Body>
        <Card.Footer>
            <ButtonGroup>
                <Button onClick={() => router.push('/school')}>Elenco</Button>
                { !edit && <Button onClick={() => setEdit(true)} variant="danger">Modifica</Button>}
                { edit && <Button onClick={save} disabled={!modified}>Salva modifiche</Button> }
                { edit && <Button variant="danger" onClick={remove}>Elimina</Button> }
            </ButtonGroup>
        </Card.Footer>
    </Card>

    async function save() {
        await patchSchool({
            _id: school._id,
            name: value(nameState),
            city: value(cityState)
        })
        await mutate()
        setEdit(false)
    }

    async function remove() {
        await deleteSchool(school)
        await addMessage("warning", `Scuola ${school.name} eliminata`)
        router.push('/school')
    }

}
