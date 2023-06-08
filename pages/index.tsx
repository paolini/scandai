import { useState, Dispatch } from 'react'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Button } from 'react-bootstrap'

import {IClass} from '@/models/Class'
import Head from 'next/head'
import Questions from '@/components/Questions'
import Header from '@/components/Header'
import ClassSelector from '@/components/ClassSelector'
import connectedPromise from '@/lib/mongodb'
import AddMessageContext from '@/components/AddMessageContext'
import { IAnswers } from '@/components/Question'
import { assert } from 'console'

type ConnectionStatus = {
  isConnected: boolean
}

export const getServerSideProps: GetServerSideProps<
  ConnectionStatus
> = async () => {
  try {
    let isConnected = await connectedPromise

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
      <h1>Scegli la tua classe</h1>
      <ClassSelector myClass={myClass} setMyClass={setMyClass}/>
      <br />
      <Button 
        onClick={start} 
        disabled={myClass === null}
      >compila il questionario</Button>
    </div>
}


export default function Splash({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [messages, setMessages] = useState<string[]>([])
  const [started, setStarted] = useState<boolean>(false)
  const [myClass, setMyClass] = useState<IClass>()
  const [submitted, setSubmitted] = useState<boolean>(false)

  function addMessage(message: string) {
    setMessages((messages) => [...messages, message]) 
  }

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
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Messages messages={messages} />
        <AddMessageContext.Provider value={addMessage}>
          { !isConnected && <div>DB not connected!</div> }
          { (!started) && <Welcome 
                start={() => setStarted(true)}
                myClass={myClass}
                setMyClass={setMyClass}
                /> }
          { started && myClass && <Questions submit={submit} submitted={submitted} />}
        </AddMessageContext.Provider>
      </main>
    </>
  )
}

function Messages({messages}: {messages: string[]}) {
  if (messages.length === 0) return null
  return <div>
    {messages.map((m, i) => <div key={i} className="alert alert-danger" role="alert">{m}</div>)}
  </div>
}