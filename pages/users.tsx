import Switch from "react-switch"
import { Button } from "react-bootstrap"
import { FaCirclePlus } from "react-icons/fa6"
import { useState } from "react"

import { useUsers } from '@/lib/api'
import Headers from '@/components/Header'
import { IGetUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import { patchUser } from '@/lib/api'
import useSessionUser from '@/lib/useSessionUser'
import { value, set } from '@/lib/State'
import { IPostUser } from '@/models/User'

export default function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useUsers()
    const addMessage = useAddMessage()
    const newUserState = useState<boolean>(false)
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

    return <>
        <Headers />
        <h2>Users</h2>
        { value(newUserState) 
        ? <NewUser />
        : <Button>
            <FaCirclePlus className="m-1 bg-blue-300" onClick={() => set(newUserState,true)}/>
            aggiungi utente
        </Button> }
        <table className="table">
            <thead>
                <tr>
                    <td>email</td>
                    <td>name</td>
                    <td>admin</td>
                </tr>
            </thead>
            <tbody>
                { users.map((user) => <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{user.name || user.username}</td>
                    <td><Switch
                            disabled={user._id === sessionUser?._id}
                            checked={user.isAdmin}
                            onChange={(checked) => {setAdmin(user, checked)}} />
                    </td>
                </tr>)}
            </tbody>
        </table>

    </>
}

function NewUser({done }:{
        done?: () => void
    }) {
        const userState = useState<IPostUser>({name: "", email: "", username: ""})
        const addMessage = useAddMessage()
    
        function isValid() {
            const poll = value(pollState)
            return poll && poll.school && poll.class
        }
    
        async function submit() {
            try {
                await postPoll(value(pollState))
                addMessage('success', 'nuovo sondaggio creato')
                if (done) done()
            } catch(err) {
                addMessage('error', `errore nella creazione del sondaggio: ${err}`)
            }
        }
    
        return <Card>
            <Card.Header>
                nuovo sondaggio
            </Card.Header>
            <Card.Body>
                <form>
                    <div className="form-grup">
                        <label htmlFor="school">
                            scuola 
                        </label>
                        <Input id="school" state={get(pollState, 'school')} placeholder="scuola" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="class">
                            classe
                        </label>
                        <Input id="class" state={get(pollState, 'class')} placeholder="classe" />
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
}