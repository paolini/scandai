import { useState } from "react"
import { useRouter } from 'next/router'
import { Card } from 'react-bootstrap'

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

    return <Card><Card.Body>
        <h2>Registra un nuovo account</h2>
            <Input name="username" placeholder='username' state={usernameState} invalid={value(invalidState)} /><br/>
            <Input name="name" placeholder='name' state={nameState} invalid={value(invalidState)}/><br/>
            <Input name="email" placeholder='email' state={emailState} invalid={value(invalidState)}/><br/>
            <Input name="password" password={true} placeholder='password' state={passwordState} invalid={value(invalidState)}/><br/>
            <Input name="passwordagain" password={true} placeholder='password again' state={passwordAgainState} invalid={value(invalidState)}/><br/>
            <input type="submit" value="Registra nuovo account" onClick={submit} />
        </Card.Body></Card>

    async function submit() {
        if (value(passwordState) !== value(passwordAgainState)) {
            update(invalidState, invalid => [...invalid, 'passwordagain'])
            return
        }
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify({
                username: value(usernameState),
                name: value(nameState),
                email: value(emailState),
                password: value(passwordState),
                passwordAgain: value(passwordAgainState)
            } as IPostUser)
        })
        if (response.ok) {
            console.log('ok')
            set(invalidState, [])
            router.push('/login')
        } else {    
            const body = await response.json()
            console.log({ body })
            set(invalidState, body?.invalid || [])
        }
    } 
}

function Input({name, placeholder, state, password, invalid }:{
    name: string,
    placeholder: string,
    state: State<string>,
    password?: boolean,
    invalid: string[],
}) {
    const isInvalid = invalid.includes(name) && value(state)
    return <>
        {placeholder}: <input 
            className={isInvalid ? 'border-red-500' : ''}
            name={name} 
            id={name} 
            type={password ? 'password' : 'text'} 
            placeholder={placeholder} 
            value={value(state)} 
            onChange={onChange(state)} 
            required />
        {isInvalid && <Error>non valido</Error>}
        <br/>
    </>
}