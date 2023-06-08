import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function useClasses () {
  const { data, error, isLoading } = useSWR(`/api/classes/`, fetcher)
  return {
    data: data?.data,
    isLoading,
    error
  }
}

export default function ClassSelector({myClass, setMyClass}) {
    const { data, isLoading, error } = useClasses()
    if (error) return <div>Error: {error.message}</div>
    if (isLoading) return <div>Loading...</div>
    const classes = data
    return <select 
            value={myClass ? myClass._id : ""}
            onChange={evt => {
                const value = evt.target.value
                if (value === "") return setMyClass(null)
                else return setMyClass(classes.filter(c => c._id === value)[0])
            }}> 
        <option key={null} value="">*** seleziona la tua classe ***</option>    
        {classes.map(c => <option key={c._id} value={c._id}>{c.school} {c.class}</option>)}
    </select>
}