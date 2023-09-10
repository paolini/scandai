import { useState } from 'react'
import { Button } from 'react-bootstrap'

import { value } from '@/lib/State'
import { patchProfile } from '@/lib/api'
import Input from '@/components/Input'
import { useAddMessage } from '@/components/Messages'
import { IGetUser } from '@/models/User'

export default function SetUserName({profile, mutate}:{
    profile: IGetUser,
    mutate: () => void,
}) {
    const nameState = useState(profile?.name || '')
    const name = value(nameState)
    const addMessage = useAddMessage()

    return <>
        <form>
            <label htmlFor="name">Il tuo nome e cognome: </label>
            <Input state={nameState} placeholder='nome cognome'/>
            <Button disabled={name===''} onClick={submit}>Salva</Button>
        </form>
    </>

    async function submit() {
        try {
            await patchProfile({name})
            mutate()
        } catch(err) {
            addMessage("error", `${err}`)
        }
    }
}