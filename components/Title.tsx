import { useConfig } from '@/lib/api'
import Loading from '@/components/Loading'

export default function Title(){
    const configQuery = useConfig()
    if (configQuery.isLoading) return <Loading />
    if (!configQuery.data) return <>***</>
    const config = configQuery.data
    return <h2>
        {config.siteTitle.it} 
    </h2>
}