import { FaCirclePlus, FaTrashCan } from 'react-icons/fa6'
import { useState } from 'react'
import { Button, ButtonGroup, Card } from 'react-bootstrap'

import { usePolls, postPoll, deletePoll } from '@/lib/api'
import { useAddMessage } from '@/components/Messages'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { State, value, set, get } from '@/lib/State'
import { IPostPoll, IGetPoll } from '@/models/Poll'
import useSessionUser from '@/lib/useSessionUser'

export default function Polls({}) {
//    const sessionUser = useSessionUser()
    const pollsQuery = usePolls()
    const addPollState = useState<boolean>(false)
    const user = useSessionUser()

    if (pollsQuery.isLoading) return <Loading />
    if (!pollsQuery.data) return <Error>{pollsQuery.error.message}</Error>

    const polls = pollsQuery.data.data

    async function remove(poll: IGetPoll) {
        try {
            await deletePoll(poll)
            pollsQuery.mutate()
        } catch(err) {
            useAddMessage()('error', `errore nella cancellazione del sondaggio: ${err}`)
        }
    }

    return <>
        { value(addPollState) 
            ? <NewPoll done={() => {
                set(addPollState, false)
                pollsQuery.mutate()
            }}/>
            : <Button variant="primary" size="lg" onClick={_ => set(addPollState,true)}>
                <FaCirclePlus className="m-1 bg-blue-300" /> 
                nuovo questionario
            </Button>
        }
        { polls.length > 0 && 
            <table className="table">
                <thead>
                    <tr>
                        { user?.isAdmin && <th>utente</th> }
                        <th>scuola</th>
                        <th>classe</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {polls.map(poll => <tr key={poll._id.toString()}>
                            { user?.isAdmin && <td>
                                {poll.createdBy?.name || poll.createdBy?.username || poll.createdBy?.email }</td>}
                        <td>
                            {poll.school}
                        </td>
                        <td>
                            {poll.class}
                        </td>
                        <td>
                            <ButtonGroup>
                            <a className="btn btn-success" href={`/p/${poll.secret}`}>
                                apri
                            </a>
                            <Button variant="danger" size="sm" onClick={() => remove(poll)}>
                                <FaTrashCan />elimina
                            </Button>
                            </ButtonGroup>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        }
    </>
}

function Input({state, id, placeholder}:{
    state: State<string>,
    id?: string,
    placeholder?: string,
}) {
    const valueState = useState<string>('')
    return <input 
        className="form-control" 
        id={id} 
        onChange={evt => set(state, evt.target.value)} 
        value={value(state)} 
        placeholder={placeholder} 
    />
}

function NewPoll({ done }:{
    done?: () => void
}) {
    const pollState = useState<IPostPoll>({school: '', class: ''})
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