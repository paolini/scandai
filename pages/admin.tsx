import { useState } from 'react'

import Header from '@/components/Header'
import { useApi } from '@/lib/api'

export default function Admin({}) {
    const [count, setCount] = useState<number>(0)
    return <>
        <Header />
        <h2>Admin</h2>
        {
            [...Array(count)].map((_, i) => <Test key={i} count={i}/>)
        }
        <button onClick={() => setCount(count => count+1)}>add one</button>
    </>
}

function Test({count}:{count:number}) {
    const {data, error, isLoading} = useApi(`/admin?${count}`)
    return <>
        TEST:
        {isLoading && <div>Loading...</div>}
        {error && <div>Failed to load: { `${error}` }</div>}
        {data && <div>{JSON.stringify(data)}</div>}
    </>
}