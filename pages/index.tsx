import { useState } from 'react'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Button } from 'react-bootstrap'

import {IClass} from '../models/Class'
import Head from 'next/head'
import Questions from '../components/Questions'
import Header from '../components/Header'
import ClassSelector from '../components/ClassSelector'
import connectedPromise from '../lib/mongodb'

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
  myClass: IClass|null,
  setMyClass: (c:IClass|null) => void,
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
  const [started, setStarted] = useState<boolean>(false)
  const [myClass, setMyClass] = useState<IClass|null>(null)
  return (
    <>
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        { !isConnected && <div>DB not connected!</div> }
        { started
          ? <Questions myClass={myClass} />
          : <Welcome 
              start={() => setStarted(true)}
              myClass={myClass}
              setMyClass={setMyClass}
            /> 
        }
      </main>
    </>
  )
}
