import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { gql, TypedDocumentNode, useMutation } from '@apollo/client'

import { value } from '@/lib/State'
import { patchProfile } from '@/lib/api'
import Input from '@/components/Input'
import { useAddMessage } from '@/components/Messages'
import { useTrans } from '@/lib/trans'
import { User } from '@/pages/api/graphql/types'
import Loading from './Loading'

const MutateProfile: TypedDocumentNode<MutateProfileResult, MutateProfileVariables> = gql`
    mutation MutateProfile($name: String, $isTeacher: Boolean, $isStudent: Boolean) {
        mutateProfile(name: $name, isTeacher: $isTeacher, isStudent: $isStudent) {
            _id
            name
            isTeacher
            isStudent
        }
    }`

// Tipo per i parametri della mutation
type MutateProfileVariables = {
    name?: string;
    isTeacher?: boolean;
    isStudent?: boolean;
  };
  
  // Tipo per il risultato della mutation
  type MutateProfileResult = {
    mutateProfile: {
      _id: string;
      name: string;
      isTeacher: boolean;
      isStudent: boolean;
    };
  };

export default function SetProfile({profile}:{
    profile: User,
}) {
    const [mutateProfile, {loading, error}] = useMutation(MutateProfile)
    const nameState = useState(profile?.name || '')
    const [what, setWhat] = useState<string>(profile.isTeacher ? "teacher" : "")
    const [alertStudent, setAlertStudent] = useState<boolean>(profile.isStudent)
    const [alertViewer, setAlertViewer] = useState<boolean>(false)
    const name = value(nameState)
    const addMessage = useAddMessage()
    const _ = useTrans()

    if (loading) return <Loading />
    if (error) addMessage("error", `${error}`)

    /*
     Chiunque può creare un profilo. 
     Se dichiara di essere un docente o uno studente il sistema ci crede,
     memorizza il dato e non lo chiede più.
     Per modificare il dato sarà necessario l'intervento di un amministratore.
     */

    if (alertStudent) return <div className="alert alert-info" role="alert"> 
        <b>Attenzione!</b> <br />
        Questa piattaforma è riservata ai docenti.
        Contatta il tuo insegnante per compilare la fotografia.
    </div>

    if (alertViewer) return <div className="alert alert-info" role="alert">
        Non sei ancora abilitato come visualizzatore. 
        Contatta l&apos;amministratore del sistema e chiudi questa pagina.
    </div>

    if (profile.name && (profile.isTeacher || profile.isViewer || profile.isAdmin)) return null

    return <>
        <form>
            {(!profile.isStudent && !profile.isTeacher && !profile.isViewer && !profile.isAdmin) && <> 
                {_("Chi sei?")} <br />
                        <input type="radio" id="teacher" name="what" value="teacher" onChange={() => setWhat("teacher")}/>
                        {} <label htmlFor="teacher">{_("Sono un docente")}</label>
                        <br />
                        <input type="radio" id="student" name="what" value="student" onChange={() => setWhat("student")}/>
                        {} <label htmlFor="student">{_("Sono uno studente")}</label>
                        <br />
                        <input type="radio" id="viewer" name="what" value="viewer" onChange={() => setWhat("viewer")}/>
                        {} <label htmlFor="viewer">{_("Sono un visualizzatore del database")}</label>
                        <br />  
            </>}
            <label htmlFor="name">{_("Il tuo nome e cognome")}: </label>
            <Input state={nameState} placeholder={_("nome cognome")}/>
            <Button disabled={name==='' || what ===''} onClick={submit}>{_("Salva")}</Button>
        </form>
    </>

    async function submit() {
        await mutateProfile({
            variables: {
                name, 
                isTeacher: what === "teacher", 
                isStudent: what === "student",
            }})
        if (what=="student") setAlertStudent(true)
        if (what=="viewer") setAlertViewer(true)
    }
}

