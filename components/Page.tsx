import React, { useState } from 'react'
import Head from 'next/head'

import Header from '@/components/Header'
import Messages, { AddMessageContext } from '@/components/Messages'

export default function Page({children}: {children: React.ReactNode}) {
    const [messages, setMessages] = useState<string[]>([])

    function addMessage(message: string) {
        setMessages((messages) => [...messages, message]) 
      }
    
    return <>
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Messages messages={messages} />
        <AddMessageContext.Provider value={addMessage}>
          {children}
        </AddMessageContext.Provider>
      </main>
    </>
}

