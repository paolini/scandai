import { useState } from "react"
import { useRouter } from 'next/router'
import { Card, Button } from 'react-bootstrap'

import { IPostUser } from '@/models/User'
import { set, update, value, onChange, State } from '@/lib/State'
import Error from '@/components/Error'

export default function SignupPage({}) {
    const router = useRouter()
    const usernameState = useState<string>('')
    const nameState = useState<string>('')
    const emailState = useState<string>('')
    const passwordState = useState<string>('')
    const passwordAgainState = useState<string>('')
    const invalidState = useState<string[]>([])
    const errorState = useState<string>('')

    return <Card>
        {JSON.stringify({invalid: value(invalidState)})}
        <Card.Header><h2>Registrazione</h2></Card.Header>
        <Card.Body className="container">
            <Input cb={cb} name="username" placeholder='username' state={usernameState} invalid={value(invalidState)}/><br/>
            <Input cb={cb} name="name" placeholder='nome e cognome' state={nameState} invalid={value(invalidState)}/><br/>
            <Input cb={cb} name="email" placeholder='email' state={emailState} invalid={value(invalidState)}/><br/>
            <Input cb={cb} name="password" password={true} placeholder='password' state={passwordState} invalid={value(invalidState)}/><br/>
            <Input cb={cb} name="passwordagain" password={true} placeholder='conferma password' state={passwordAgainState} invalid={value(invalidState)}/><br/>
            <Button onClick={submit}>Registra nuovo account</Button>
            { value(errorState) && <Error>{value(errorState)}</Error> }
        </Card.Body>
    </Card>

    function cb() {
        set(errorState, '')
        set(invalidState, [])
    }

    async function submit() {
        console.log('submit')
        if (value(passwordState) !== value(passwordAgainState)) {
            update(invalidState, invalid => [...invalid, 'passwordagain'])
            set(errorState, 'Le password non coincidono')
            return
        }
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({
                username: value(usernameState),
                name: value(nameState),
                email: value(emailState),
                password: value(passwordState),
                passwordAgain: value(passwordAgainState),
                isTeacher: false,
                isStudent: false,
            } as IPostUser)
        })
        if (response.ok) {
            console.log('ok')
            set(invalidState, [])
            router.push('/login')
        } else {    
            const body = await response.json()
            console.log({ body })
            set(errorState, body?.error || 'errore')
            set(invalidState, body?.invalid || [])
        }
    } 
}

function Input({name, placeholder, state, password, invalid, cb }:{
    name: string,
    placeholder: string,
    state: State<string>,
    password?: boolean,
    invalid: string[],
    cb?: (value:string) => void,
}) {
    const isInvalid = (password || value(state)!=='') 
        && invalid.includes(name)
    return <>
        {/*JSON.stringify({invalid, isInvalid})*/}
        <div className="col-sm-4">
            {placeholder}: 
        </div>
        <input
            className={`col-sm-8 ${isInvalid ? 'border-danger' : ''}`}
            name={name} 
            id={name} 
            type={password ? 'password' : 'text'} 
            placeholder={placeholder} 
            value={value(state)} 
            onChange={(evt) => {
                set(state, evt.target.value) 
                if (cb) cb(evt.target.value)
            }}
            required />
        {/*isInvalid && <Error>non valido</Error>*/}
        <br/>
    </>
}