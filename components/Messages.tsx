import { createContext, useContext, useState } from 'react'
import assert from 'assert'

import { State, push } from '@/lib/State'

export type Message = {
  type: "info" | "success" | "error" | "warning",
  message: string
}

export const MessagesContext = createContext<State<Message[]>>([[],(f) => {assert(false, "Trying to modify MessagesContext before initialization")}])

export function useMessagesState() {
  return useContext(MessagesContext)
}

export function useAddMessage() { 
  const messagesState = useContext(MessagesContext)

  function addMessage(type: "info" | "success" | "error" | "warning", message: string) {
    push(messagesState, {type, message}) 
  }

  return addMessage
}

export function MessagesProvider({children}: {children: React.ReactNode}) {
  const messagesState = useState<Message[]>([])

  return <MessagesContext.Provider value={messagesState}>
        {children}
  </MessagesContext.Provider>
}

