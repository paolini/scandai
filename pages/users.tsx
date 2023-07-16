import Switch from "react-switch"
import { Button, ButtonGroup, Card } from "react-bootstrap"
import { FaCirclePlus, FaTrash } from "react-icons/fa6"
import { useState } from "react"

import { useUsers, postUser, deleteUser } from '@/lib/api'
import { IGetUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import { patchUser } from '@/lib/api'
import useSessionUser from '@/lib/useSessionUser'
import { value, set, get } from '@/lib/State'
import { IPostUser } from '@/models/User'
import Input from '@/components/Input'
import Page from '@/components/Page'

export default function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useUsers()
    const addMessage = useAddMessage()
    const newUserState = useState<boolean>(false)
    const showDeleteState = useState<boolean>(false)
    if (usersQuery.isLoading) return <div>Loading...</div>
    if (!usersQuery.data) return <div>{usersQuery.error.message}</div>
    const users = usersQuery.data.data

    const setAdmin = async (user: IGetUser, isAdmin: boolean) => {
        if (user.isAdmin === isAdmin) return
        try {
            const newData = await patchUser({_id: user._id, isAdmin }) 
            usersQuery.mutate()
        } catch(e) {
            addMessage('error', `error updating user: ${e}`)
            console.error(e)
        }
    }

    async function clickDeleteUser(user: IGetUser) {
        try {
            deleteUser(user) 
            usersQuery.mutate()
        } catch(e) {
            addMessage('error', `error deleting user: ${e}`)
            console.error(e)
        }
    }

    function newUserDone() {
        set(newUserState, false)
        usersQuery.mutate()
    }

    return <Page>
        <h2>Users</h2>
        { value(newUserState) 
        ? <NewUser done={newUserDone}/> 
        : <ButtonGroup>
            { !value(newUserState)
            && <Button onClick={() => set(newUserState, true)}>
                <FaCirclePlus className="m-1 bg-blue-300" onClick={() => set(newUserState,true)}/>
                aggiungi utente
            </Button> }
            { value(showDeleteState)
            ? <Button variant="warning" onClick={() => set(showDeleteState, false)}>
                annulla
            </Button>
            : <Button variant="danger" onClick={() => set(showDeleteState, true)}>
                <FaTrash /> elimina utente
            </Button> }
        </ButtonGroup>}
        <table className="table">
            <thead>
                <tr>
                    <td>email</td>
                    <td>name</td>
                    <td>admin</td>
                    { value(showDeleteState) && <td>elimina</td> }
                </tr>
            </thead>
            <tbody>
                { users.map((user) => <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{user.name || user.username}</td>
                    <td className="d-flex">
                        <Switch
                        disabled={user._id === sessionUser?._id}
                        checked={user.isAdmin}
                        onChange={(checked) => {setAdmin(user, checked)}} />
                    </td>
                    { value(showDeleteState) && <td>
                        <Button variant="danger" size="sm" disabled={user._id === sessionUser?._id}
                            onClick={() => clickDeleteUser(user)}><FaTrash />elimina</Button>
                    </td>}
                </tr>)}
            </tbody>
        </table>
    </Page>
}

function NewUser({done }:{
        done?: () => void
}) {
    const userState = useState<IPostUser>({name: "", email: "", username: ""})
    const addMessage = useAddMessage()

    function isValid() {
        const user = value(userState)
        return user && user.name && user.email
    }

    async function submit() {
        try {
            const newUser = {
                ...value(userState),
                username: value(userState).email,
            }
            const out = await postUser(newUser)
            addMessage('success', `nuovo utente creato password: ${out.password}`)
            if (done) done()
        } catch(err) {
            addMessage('error', `errore nella creazione del sondaggio: ${err}`)
        }
    }

    return <Card>
        <Card.Header>
            nuovo utente
        </Card.Header>
        <Card.Body>
            <form>
                <div className="form-grup">
                    <label htmlFor="name">
                        nome
                    </label>
                    <Input id="school" state={get(userState, 'name')} placeholder="nome" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">
                        email
                    </label>
                    <Input id="email" state={get(userState, 'email')} placeholder="email" />
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