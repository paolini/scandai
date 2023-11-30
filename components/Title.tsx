import { useConfig } from '@/lib/api'
import Loading from '@/components/Loading'
import { useTrans } from '@/lib/trans'

export default function Title(){
    const configQuery = useConfig()
    const _ = useTrans()
    if (configQuery.isLoading) return <Loading />
    if (!configQuery.data) return <>***</>
    const config = configQuery.data
    return <h2>
        {config.siteTitle[_.locale]} 
    </h2>
}