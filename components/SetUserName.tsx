import { useState } from 'react'
import { Button } from 'react-bootstrap'

import { value } from '@/lib/State'
import { patchProfile } from '@/lib/api'
import Input from '@/components/Input'
import { useAddMessage } from '@/components/Messages'
import { IGetUser } from '@/models/User'
import { useTrans } from '@/lib/trans'

export default function SetUserName({profile, mutate}:{
    profile: IGetUser,
    mutate: () => void,
}) {
    const nameState = useState(profile?.name || '')
    const name = value(nameState)
    const addMessage = useAddMessage()
    const _ = useTrans()

    return <>
        <form>
            <label htmlFor="name">{_("Il tuo nome e cognome")}: </label>
            <Input state={nameState} placeholder={_("nome cognome")}/>
            <Button disabled={name===''} onClick={submit}>{_("Salva")}</Button>
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