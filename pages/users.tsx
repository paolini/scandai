import Switch from "react-switch"
import { Button, ButtonGroup, Card } from "react-bootstrap"
import { FaCirclePlus, FaTrash, FaKey } from "react-icons/fa6"
import { useState } from "react"

import { useUsers, postUser, deleteUser, patchUser } from '@/lib/api'
import { IGetUser, IPostUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import useSessionUser from '@/lib/useSessionUser'
import { value, set, get } from '@/lib/State'
import Input from '@/components/Input'
import Page from '@/components/Page'
import Loading from '@/components/Loading'
import { useTrans } from '@/lib/trans'

export default function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useUsers()
    const addMessage = useAddMessage()
    const newUserState = useState<boolean>(false)
    const showDeleteState = useState<boolean>(false)
    const showPasswordState = useState<boolean>(false)
    const isSuper = sessionUser?.isSuper
    const _ = useTrans()

    if (usersQuery.isLoading) return <Loading />
    if (!usersQuery.data) return <div>{usersQuery.error.message}</div>
    const users = usersQuery.data.data

    return <Page>
        <h2>{_("Users")}</h2>
        { value(newUserState) 
        ? <NewUser done={newUserDone}/> 
        : <ButtonGroup>
            { !value(newUserState)
            && <Button onClick={() => set(newUserState, true)}>
                <FaCirclePlus className="m-1 bg-blue-300" onClick={() => set(newUserState,true)}/>
                {_("aggiungi utente")}
            </Button> }
            { value(showDeleteState)
            ? <Button variant="warning" onClick={() => set(showDeleteState, false)}>
                {_("annulla")}
            </Button>
            : <Button variant="danger" onClick={() => set(showDeleteState, true)}>
                <FaTrash /> {_("elimina utente")}
            </Button> }
            { value(showPasswordState)
            ? <Button variant="warning" onClick={() => set(showPasswordState, false)}>
                {_("annulla")}
            </Button>
            : <Button variant="warning" onClick={() => set(showPasswordState, true)}>
                <FaKey /> {_("cambia password")}
            </Button> }
        </ButtonGroup>}
        <table className="table">
            <thead>
                <tr>
                    <th>{_("email")}</th>
                    <th>{_("name")}</th>
                    <th>{_("accounts")}</th>
                    <th>{_("viewer")}</th>
                    <th>{_("teacher")}</th>
                    <th>{_("student")}</th>
                    <th>{_("admin")}</th>
                    { isSuper && <th>{_("super")}</th>}
                    { value(showDeleteState) && <th>{_("elimina")}</th> }
                    { value(showPasswordState) && <th>{_("password")}</th>}
                </tr>
            </thead>
            <tbody>
                { users.map((user) => <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{user.name || user.username}</td>
                    <td>{user.accounts.map(a => a.provider).join(" ")}</td>
                    <td>
                        <Switch
                        checked={!!user.isViewer}
                        onChange={(checked) => {patch(user, {isViewer: checked})}} />
                    </td>
                    <td>
                        <Switch
                        checked={!!user.isTeacher}
                        onChange={(checked) => {patch(user, {isTeacher: checked})}} />
                    </td>
                    <td>
                        <Switch
                        checked={!!user.isStudent}
                        onChange={(checked) => {patch(user, {isStudent: checked})}} />
                    </td>
                    <td>
                        <Switch
                        disabled={user._id === sessionUser?._id}
                        checked={!!user.isAdmin}
                        onChange={(checked) => {patch(user, {isAdmin: checked})}} />
                    </td>
                    { isSuper && <td>
                        <Switch
                        disabled={user._id === sessionUser?._id}                        
                        checked={!!user.isSuper}
                        onChange={(checked) => {patch(user, {isSuper: checked})}} />
                    </td>}
                    { value(showDeleteState) && <td>
                        <Button variant="danger" size="sm" disabled={user._id === sessionUser?._id}
                            onClick={() => clickDeleteUser(user)}><FaTrash />elimina</Button>
                    </td>}
                    { value(showPasswordState) && <td>
                        <Button variant="warning" size="sm"
                            onClick={() => clickPasswordUser(user)}><FaTrash />cambia password</Button>
                    </td>}
                </tr>)}
            </tbody>
        </table>
    </Page>

    async function patch(user: IGetUser, payload: {[key:string]: string | boolean}) {
        try {
            const newData = await patchUser({_id: user._id, ...payload }) 
            usersQuery.mutate()
        } catch(e) {
            addMessage('error', `error updating user: ${e}`)
            console.error(e)
        }
    }

    async function clickPasswordUser(user: IGetUser) {
        try {
            const newPassword = prompt(`${_("nuova password per")} ${user.email}`)
            if (newPassword) {
                await patchUser({_id: user._id, password: newPassword }) 
            }
        } catch(e) {
            addMessage('error', `error updating user: ${e}`)
            console.error(e)
        }
    }

    async function clickDeleteUser(user: IGetUser) {
        try {
            await deleteUser(user) 
            await usersQuery.mutate()
        } catch(e) {
            addMessage('error', `error deleting user: ${e}`)
            console.error(e)
        }
    }

    function newUserDone() {
        set(newUserState, false)
        usersQuery.mutate()
    }    
}

function NewUser({done }:{
        done?: () => void
}) {
    const userState = useState<IPostUser>({
        name: "", email: "", username: "", 
        isTeacher: false,
        isStudent: false,
    })
    const addMessage = useAddMessage()
    const _ = useTrans()

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
            addMessage('success', _("nuovo utente creato"))
            if (done) done()
        } catch(err) {
            addMessage('error', `errore nella creazione dell'utente: ${err}`)
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
                <Button variant="primary" size="lg" disabled={!isValid()} onClick={submit}>
                    {_("crea")}
                </Button>
                <Button variant="warning" size="lg" onClick={done}>
                    {_("annulla")}
                </Button>
            </ButtonGroup>
        </Card.Footer>
    </Card>
}