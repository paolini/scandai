import { useState, useContext, Dispatch } from 'react'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Button } from 'react-bootstrap'

import {IClass} from '@/models/Class'
import Head from 'next/head'
import Questions from '@/components/Questions'
import Header from '@/components/Header'
import ClassSelector from '@/components/ClassSelector'
import connectedPromise from '../lib/mongodb'
import { IAnswers } from '@/components/Question'
import Messages, { AddMessageContext } from '@/components/Messages'
import Page from '@/components/Page'

export default function Index({isConnected}
  : InferGetServerSidePropsType<typeof getServerSideProps>
  ) {
    return <Page>
      <Splash isConnected={isConnected} />
    </Page>
}

type ConnectionStatus = {
  isConnected: boolean
}

export const getServerSideProps: GetServerSideProps<ConnectionStatus> = async () => {
  try {
    let isConnected = !!(await connectedPromise)

    return {
      props: { isConnected },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
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

export function Splash({
  isConnected,
}: {isConnected: boolean}) {
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
          { !isConnected && <div>DB not connected!</div> }
          { (!started) && <Welcome 
                start={() => setStarted(true)}
                myClass={myClass}
                setMyClass={setMyClass}
                /> }
          { started && myClass && <Questions submit={submit} submitted={submitted} myClass={myClass} />}
    </>
  )
}
