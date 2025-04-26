import { useQuery } from '@apollo/client'
import { ConfigQuery } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { useTrans } from '@/lib/trans'

export default function Title(){
    const {data,loading,error} = useQuery(ConfigQuery)
    const _ = useTrans()
    if (loading) return <Loading />
    if (!data) return <Error>{`${error}`}</Error>
    const config = data.config
    return <h2>
        {config?.siteTitle ? config.siteTitle[_.locale] : "Untitled"} 
    </h2>
}