import useSWR from 'swr'

import {IClass} from '../models/Class'

const fetcher = (...args: [any]) => fetch(...args).then(res => res.json())

function useClasses () {
  const { data, error, isLoading } = useSWR(`/api/classes/`, fetcher)
  return {
    data: data?.data,
    isLoading,
    error
  }
}

export default function ClassSelector({myClass, setMyClass}: 
    {myClass: IClass|null, setMyClass: (c: IClass|null) => void}) {
    const { data, isLoading, error } = useClasses()
    if (error) return <div>Error: {error.message}</div>
    if (isLoading) return <div>Loading...</div>
    const classes = data
    return <select 
            value={myClass ? myClass._id.toString() : ""}
            onChange={evt => {
                const value = evt.target.value
                if (value === "") return setMyClass(null)
                else return setMyClass(classes.filter((c:IClass) => c._id.toString() === value)[0])
            }}> 
        <option key={null} value="">*** seleziona la tua classe ***</option>    
        {classes.map((c:IClass) => <option key={c._id.toString()} value={c._id.toString()}>{c.school} {c.class}</option>)}
    </select>
}