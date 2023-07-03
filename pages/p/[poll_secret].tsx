import { useRouter } from 'next/router'

import Page from '@/components/Page'
import { usePolls } from '@/lib/api'
import Loading from '@/components/Loading'
import Error from '@/components/Error'

export default function Poll({}) {
    const secret = useRouter().query.poll_secret as string
    const pollQuery = usePolls({secret},secret!==undefined)

    if (pollQuery.isLoading || secret===undefined) return <Loading />
    if (!pollQuery.data) {
        return <Error>{pollQuery.error.message}</Error>
    }

    return <Page>
        <h1>Fotografia linguistica</h1>
        <p>secret: {secret} </p>
        <p>data: {JSON.stringify(pollQuery.data)} </p>
    </Page>
}