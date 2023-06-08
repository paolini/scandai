import { Dispatch } from 'react'

import { assert } from '@/lib/assert' 
import { useClasses } from '@/lib/api'
import { IClass } from '@/models/Class'

export default function ClassSelector({myClass, setMyClass}: 
    {myClass: IClass|undefined, setMyClass: Dispatch<IClass|undefined>}) {
    const { data, isLoading, error } = useClasses()
    if (error) return <div>Error: {error.message}</div>
    if (isLoading) return <div>Loading...</div>
    assert(data)
    const classes = data.data
    return <select 
            value={myClass ? myClass._id.toString() : ""}
            onChange={evt => {
                const value = evt.target.value
                if (value === "") return setMyClass(undefined)
                else return setMyClass(classes.filter((c:IClass) => c._id.toString() === value)[0])
            }}> 
        <option key={null} value="">*** seleziona la tua classe ***</option>    
        {classes.map((c:IClass) => <option key={c._id.toString()} value={c._id.toString()}>{c.school} {c.class}</option>)}
    </select>
}