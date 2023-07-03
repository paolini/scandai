import { useState, useContext, Dispatch } from 'react'
import { Button } from 'react-bootstrap'
import { signIn } from 'next-auth/react'

import {IPoll} from '@/models/Poll'
import Questions from '@/components/Questions'
import ClassSelector from '@/components/ClassSelector'
import { IAnswers } from '@/components/Question'
import { useAddMessage } from '@/components/Messages'
import Page from '@/components/Page'
import useSessionUser from '@/lib/useSessionUser'
import Loading from '@/components/Loading'
import Polls from '../components/Polls'

export default function Index({}) {
    return <Page>
      <Splash/>
    </Page>
}

function Welcome({start, myClass, setMyClass}:{
  start: () => void,
  myClass: IPoll|undefined,
  setMyClass: Dispatch<IPoll|undefined>,
}) {
  return <div>
      <h1>Benvenuto</h1>
      <h2>Scegli la tua classe</h2>
      <ClassSelector myClass={myClass} setMyClass={setMyClass}/>
      <br />
      <Button
        className="m-2" 
        onClick={start} 
        disabled={!myClass}
      >compila il questionario</Button>
    </div>
}

export function Splash({}) {
  const sessionUser = useSessionUser()

  if (sessionUser === undefined) return <Loading />
  if (sessionUser === null) return <>
    <h1>Fotografia linguistica</h1>
    <p>se vuoi somministrare il questionario ad una classe 
    devi <a
          href={`/api/auth/signin`}
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}>fare il login</a>.
    </p>
  </>
  return <>
    <h1>Fotografia linguistica</h1>
    <p>Benvenuto {sessionUser.name || sessionUser.username}!</p>
    <Polls />  
  </>
}

export function OldSplash({}) {
  const [started, setStarted] = useState<boolean>(false)
  const [myClass, setMyClass] = useState<IPoll>()
  const [submitted, setSubmitted] = useState<boolean>(false)
  const addMessage = useAddMessage()

  async function submit(answers: IAnswers) {
    const classId = myClass?myClass._id:''
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          classId,
        })
      })
      console.log(res)
      if (res.status === 200) {
        setSubmitted(true)
      } else {
        addMessage('error', res.statusText)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
          { (!started) && <Welcome 
                start={() => setStarted(true)}
                myClass={myClass}
                setMyClass={setMyClass}
                /> }
          { started && myClass && <Questions submit={submit} submitted={submitted} myClass={myClass} />}
    </>
  )
}
