import { useState } from 'react'

import { State, set, value } from '@/lib/State'

export default function Input({state, id, placeholder}:{
    state: State<string>,
    id?: string,
    placeholder?: string,
}) {
    const valueState = useState<string>('')
    return <input 
        className="form-control" 
        id={id} 
        onChange={evt => set(state, evt.target.value)} 
        value={value(state)} 
        placeholder={placeholder} 
    />
}

