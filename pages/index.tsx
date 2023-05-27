import Head from 'next/head'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

import Questions from './Questions'
import Header from '../components/Header'

import connectedPromise from '../lib/mongodb'

type ConnectionStatus = {
  isConnected: boolean
}

export const getServerSideProps: GetServerSideProps<
  ConnectionStatus
> = async () => {
  try {
    await connectedPromise

    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <div>Connected: {isConnected?"true":"false"}</div>
        <Questions />
      </main>
    </>
  )
}
