import { useState, useContext, Dispatch } from 'react'
import { Button } from 'react-bootstrap'

import {IClass} from '@/models/Class'
import Questions from '@/components/Questions'
import ClassSelector from '@/components/ClassSelector'
import { IAnswers } from '@/components/Question'
import { AddMessageContext } from '@/components/Messages'
import Page from '@/components/Page'

export default function Index({}) {
    return <Page>
      <Splash/>
    </Page>
}

function Welcome({start, myClass, setMyClass}:{
  start: () => void,
  myClass: IClass|undefined,
  setMyClass: Dispatch<IClass|undefined>,
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
  const [started, setStarted] = useState<boolean>(false)
  const [myClass, setMyClass] = useState<IClass>()
  const [submitted, setSubmitted] = useState<boolean>(false)
  const addMessage = useContext(AddMessageContext)

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
        addMessage(res.statusText)
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
