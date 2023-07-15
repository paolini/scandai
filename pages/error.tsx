import Page from '../components/Page'
import Error from '../components/Error'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage({message}: {message?: string}) {
    const query = useSearchParams()
    message = message || query.get('error') || 'errore sconosciuto'
    return <Page>
        <Error>Errore: {message}</Error>
    </Page>
}