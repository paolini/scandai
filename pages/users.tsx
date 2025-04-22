import Switch from "react-switch"
import { Button, ButtonGroup, Card } from "react-bootstrap"
import { FaCirclePlus, FaTrash, FaKey } from "react-icons/fa6"
import { useState } from "react"
import { gql, useMutation, useQuery } from "@apollo/client"

import { postUser, deleteUser, patchUser } from '@/lib/api'
import { IGetUser, IPostUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import useSessionUser from '@/lib/useSessionUser'
import { value, set, get } from '@/lib/State'
import Input from '@/components/Input'
import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { useTrans } from '@/lib/trans'
import { User } from "@/generated/graphql"

const UsersQuery = gql`
    query {
        users {
            _id
            email
            name
            username
            isAdmin
            isSuper
            isTeacher
            isStudent
            isViewer
            accounts {
                provider
            }
        }
    }
`
export default function UsersContainer() {
    return <Page>
        <Users />
    </Page>
}

const PatchMutation = gql`
    mutation ($_id: ObjectId!, $data: PatchUserData!) {
        patchUser(_id: $_id, data: $data) {_id}
    }`

const DeleteMutation = gql`
    mutation ($_id: ObjectId!) {
        deleteUser(_id: $_id)
    }`

function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useQuery(UsersQuery)
    const users = usersQuery?.data?.users as User[]
    const addMessage = useAddMessage()
    const newUserState = useState<boolean>(false)
    const showDeleteState = useState<boolean>(false)
    const showPasswordState = useState<boolean>(false)
    const isSuper = sessionUser?.isSuper
    const _ = useTrans()
    const [patchMutation, {loading, error}] = useMutation(PatchMutation,{
        refetchQueries: [UsersQuery]
    })
    const [deleteMutation, {loading: deleteLoading, error: deleteError}] = useMutation(DeleteMutation, {
        refetchQueries: [UsersQuery]
    })

    if (usersQuery.loading) return <Loading />
    if (!users) return <div>{`${usersQuery.error}`}</div>

    return <>
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
        {error && <Error>{`${error}`}</Error>}
        {deleteError && <Error>{`${deleteError}`}</Error>}
        <table className="table">
            <thead>
                <tr>
                    <th>email</th>
                    <th>name</th>
                    <th>accounts</th>
                    <th>viewer</th>
                    <th>teacher</th>
                    <th>student</th>
                    <th>admin</th>
                    { isSuper && <th>super</th>}
                    { value(showDeleteState) && <th>{_("elimina")}</th> }
                    { value(showPasswordState) && <th>{_("password")}</th>}
                </tr>
            </thead>
            <tbody>
                { users.map((user) => <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{user.name || user.username}</td>
                    <td>{user.accounts?.map(a => a.provider).join(" ")}</td>
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
                        <Button variant="danger" size="sm" disabled={deleteLoading || user._id === sessionUser?._id}
                            onClick={() => clickDeleteUser(user)}><FaTrash />elimina</Button>
                    </td>}
                    { value(showPasswordState) && <td>
                        <Button variant="warning" size="sm"
                            onClick={() => clickPasswordUser(user)}><FaTrash />cambia password</Button>
                    </td>}
                </tr>)}
            </tbody>
        </table>
        { (loading || deleteLoading) && <Loading />}
    </>

    async function patch(user: User, data: {[key:string]: string | boolean}) {
        await patchMutation({variables: {_id:user._id, data}})
    }

    async function clickPasswordUser(user: User) {
        const newPassword = prompt(`${_("nuova password per")} ${user.email}`)
        if (newPassword) await patch(user, {password: newPassword}) 
    }

    async function clickDeleteUser(user: User) {
        set(showDeleteState, false)
        deleteMutation({variables:{_id: user._id}})
    }

    function newUserDone() {
        set(newUserState, false)
    }    
}

const NewUserMutation = gql`
    mutation($name: String, $email: String) {
        newUser(name: $name, email: $email) {_id}
    }
`

function NewUser({done }:{
        done?: () => void
}) {
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const addMessage = useAddMessage()
    const _ = useTrans()
    const [mutate, {loading, error}] = useMutation(NewUserMutation,{
        refetchQueries: [UsersQuery]
    })

    function isValid() {
        return name && email
    }

    async function submit() {
        mutate({
            variables:{name,email},
            onCompleted: () => {
                addMessage('success', _("nuovo utente creato"))
                if (done) done()
            }
        })
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
                    <Input id="school" state={[name,setName]} placeholder="nome" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">
                        email
                    </label>
                    <Input id="email" state={[email,setEmail]} placeholder="email" />
                </div>
            </form>                                
        </Card.Body>
        <Card.Footer>
            { error && <Error>{`${error}`}</Error>}
            <ButtonGroup>
                <Button variant="primary" size="lg" disabled={loading || !isValid()} onClick={submit}>
                    {_("crea")}
                </Button>
                <Button variant="warning" size="lg" disabled={loading} onClick={done}>
                    {_("annulla")}
                </Button>
            </ButtonGroup>
        </Card.Footer>
    </Card>
}