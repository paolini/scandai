import { createContext } from 'react'

const AddMessageContext = createContext<(message: string) => void>(() => {}) 
export default AddMessageContext
