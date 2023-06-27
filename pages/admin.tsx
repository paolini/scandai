import Header from '@/components/Header'
import { useApi } from '@/lib/api'

export default function Admin({}) {
    const {data, error, isLoading} = useApi('/admin')
    return <>
        <Header />
        <h2>Admin</h2>
        {isLoading && <div>Loading...</div>}
        {error && <div>Failed to load: { `${error}` }</div>}
        {data && <div>{JSON.stringify(data)}</div>}
    </>
}