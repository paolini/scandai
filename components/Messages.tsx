import { createContext, useContext } from 'react'

export const AddMessageContext = createContext<(message: string) => void>(() => {}) 

export function useAddMessage() { 
  return useContext(AddMessageContext)
}


export default function Messages({messages}: {messages: string[]}) {
    if (messages.length === 0) return null
    return <div>
      {messages.map((m, i) => <div key={i} className="alert alert-danger" role="alert">{m}</div>)}
    </div>
}