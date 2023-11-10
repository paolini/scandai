import { useState, useRef, useEffect } from 'react'
import assert from 'assert'

import { State, set, value } from '@/lib/State'

export default function Input({state, id, placeholder, focus, enter, tab}:{
    state: State<string>,
    id?: string,
    placeholder?: string,
    focus?: number,
    enter?: () => void,
    tab?: () => void,
}) {
    const valueState = useState<string>('')
    const ref = useRef<HTMLInputElement>(null)

    // console.log(`Input focus: ${focus}`)

    useEffect(() => {
        assert(ref.current)
        console.log(`Input useEffect focus: ${focus}, ref:${!!ref.current}`)
        if (focus && ref.current) ref.current.focus()
      }, [focus])

    return <input 
        className="form-control" 
        id={id} 
        onChange={evt => set(state, evt.target.value)} 
        value={value(state)} 
        placeholder={placeholder} 
        ref={ref}
        onKeyDown={evt => {
            if (evt.key === "Enter") {
                if (enter) enter()
            }
            if (evt.key === "Tab") {
                if (tab) tab()
            }
        }}
    />
}

