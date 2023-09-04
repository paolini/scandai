import Switch from "react-switch"
import { Button, ButtonGroup, Card } from "react-bootstrap"
import { FaCirclePlus, FaTrash } from "react-icons/fa6"
import { useState } from "react"

import { useSchools, postSchool, deleteSchool, patchSchool } from '@/lib/api'
import { IGetSchool, IPostSchool } from '@/models/School'
import { useAddMessage } from '@/components/Messages'
import useSessionUser from '@/lib/useSessionUser'
import { value, set, get } from '@/lib/State'
import Input from '@/components/Input'
import Page from '@/components/Page'
import Loading from '@/components/Loading'

export default function Schools() {
    const sessionUser = useSessionUser()
    const schoolsQuery = useSchools()
    const addMessage = useAddMessage()
    const newSchoolState = useState<boolean>(false)
    const showDeleteState = useState<boolean>(false)

    if (schoolsQuery.isLoading) return <Loading />
    if (!schoolsQuery.data) return <div>{schoolsQuery.error.message}</div>
    const schools = schoolsQuery.data.data

    function newSchoolDone() {
        set(newSchoolState, false)
        schoolsQuery.mutate()
    }

    return <Page>
        <h2>Scuole</h2>
        { value(newSchoolState) 
        ? <NewSchool done={newSchoolDone}/> 
        : <ButtonGroup>
            { !value(newSchoolState)
            && <Button onClick={() => set(newSchoolState, true)}>
                <FaCirclePlus className="m-1 bg-blue-300" onClick={() => set(newSchoolState,true)}/>
                aggiungi scuola
            </Button> }
            { value(showDeleteState)
            ? <Button variant="warning" onClick={() => set(showDeleteState, false)}>
                annulla
            </Button>
            : <Button variant="danger" onClick={() => set(showDeleteState, true)}>
                <FaTrash /> elimina scuola
            </Button> }
        </ButtonGroup>}
        <table className="table">
            <thead>
                <tr>
                    <td>nome</td>
                    <td>città</td>
                    <td>questionari</td>
                    { value(showDeleteState) && <td>elimina</td> }
                </tr>
            </thead>
            <tbody>
                { schools.map((school) => <tr key={school._id.toString()}>
                    <td>{school.name}</td>
                    <td>{school.city}</td>
                    <td>{school.pollCount}</td>
                    { value(showDeleteState) && <td>
                        <Button variant="danger" size="sm" disabled={school.pollCount > 0}
                            onClick={() => clickDeleteSchool(school)}><FaTrash />elimina</Button>
                    </td>}
                </tr>)}
            </tbody>
        </table>
    </Page>

    async function clickDeleteSchool(school: IGetSchool) {
        try {
            await deleteSchool(school) 
            schoolsQuery.mutate()
        } catch(e) {
            addMessage('error', `error deleting school: ${e}`)
            console.error(e)
        }
    }
}

function NewSchool({done }:{
        done?: () => void
}) {
    const schoolState = useState<IPostSchool>({name: "", city: ""})
    const addMessage = useAddMessage()

    function isValid() {
        const school = value(schoolState)
        return school && school.name
    }

    async function submit() {
        try {
            const newSchool = {
                ...value(schoolState),
            }
            const out = await postSchool(newSchool)
            addMessage('success', `nuova scuola creata`)
            if (done) done()
        } catch(err) {
            addMessage('error', `errore nella creazione della scuola: ${err}`)
        }
    }

    return <Card>
        <Card.Header>
            nuova scuola
        </Card.Header>
        <Card.Body>
            <form>
                <div className="form-grup">
                    <label htmlFor="name">
                        nome
                    </label>
                    <Input id="name" state={get(schoolState, 'name')} placeholder="nome" />
                </div>
                <div className="form-group">
                    <label htmlFor="city">
                        città
                    </label>
                    <Input id="city" state={get(schoolState, 'city')} placeholder="città" />
                </div>
            </form>                                
        </Card.Body>
        <Card.Footer>
            <ButtonGroup>
                <Button variant="primary" size="lg" disabled={!isValid()} onClick={submit}>crea</Button>
                <Button variant="warning" size="lg" onClick={done}>annulla</Button>
            </ButtonGroup>
        </Card.Footer>
    </Card>
}