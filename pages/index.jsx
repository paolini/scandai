import Head from 'next/head'

import Questions from './Questions'
import Header from '../components/Header'

export default function Home() {
  return (
    <>
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Questions />
      </main>
    </>
  )
}
