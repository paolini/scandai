import { useRouter } from "next/router"
import { ButtonGroup, Button, Table } from "react-bootstrap"

import { useEntries, deleteEntry } from "@/lib/api"
import Loading from "@/components/Loading"
import ErrorElement from "@/components/Error"
import Page from "@/components/Page"
import { formatDate, formatTime } from "@/lib/utils"
import { useAddMessage } from "@/components/Messages"

export default function Entry({}) {
    const router = useRouter()
    const entryId = router.query.entry_id
    const entryQuery = useEntries({_id: entryId})
    const addMessage = useAddMessage()

    if (!entryId || Array.isArray(entryId)) return <ErrorElement>id non valido</ErrorElement>

    if (entryQuery.isLoading) return <Loading />
    if (!entryQuery.data) return <ErrorElement>{entryQuery.error.message}</ErrorElement>
    const entry = entryQuery.data.data[0]
    return <Page>
        <Table>
            <tbody>
                <tr>
                    <th>data</th>
                    <td>{formatDate(entry.createdAt)}</td>
                </tr>
                <tr>
                    <th>ora</th>
                    <td>{formatTime(entry.createdAt)}</td>
                </tr>
                <tr>
                    <th>tipo</th>
                    <td>{entry?.poll?.form}</td>
                </tr>
                <tr>
                    <th>scuola</th>
                    <td>{entry?.poll?.school?.name}</td>
                </tr>
                <tr>
                    <th>città</th>
                    <td>{entry?.poll?.school?.city}</td>
                </tr>
                <tr>
                    <th>sezione</th>
                    <td>{entry?.poll?.class}</td>
                </tr>
                <tr>
                    <th>lingua</th>
                    <td>{entry?.lang}</td>
                </tr>
            </tbody>
        </Table>
        <ButtonGroup>
            <Button onClick={() => router.push('/entries')}>elenco</Button>
            <Button variant="danger" onClick={trash}>elimina</Button>
        </ButtonGroup>
        <Table>
            <thead>
                <tr>
                    <th>domanda</th>
                    <th>risposta</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(entry.answers).map(([key, val]) =>
                    <tr key={key}>
                        <td>{key}</td>
                        <td>{display(val)}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Page>

    function display(ans:any) {
        if (Array.isArray(ans)) return ans.join(', ')
        return Object.entries(ans).map(([key, val]) => `${key}: ${g(val)}`).join(', ')
    }   

    function g(val:any) {
        if (val==='') return ''
        if (typeof val === 'string') return val
        return `{${Object.entries(val).map(([key, val]) => `${key}: ${val}`).join(', ')}}`
    }

    async function trash() {
        try {
            await deleteEntry(entry)
            router.push('/entries')
            addMessage('success', 'eliminato')
        } catch (error) {
            addMessage('warning', `errore: ${error}`)
        }
    }
}