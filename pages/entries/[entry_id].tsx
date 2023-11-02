import { useRouter } from "next/router"
import { ButtonGroup, Button, Table } from "react-bootstrap"
import dayjs from "dayjs"

import { useEntries, deleteEntry } from "@/lib/api"
import Loading from "@/components/Loading"
import ErrorElement from "@/components/Error"
import Page from "@/components/Page"
import { formatDate, formatTime } from "@/lib/utils"
import { useAddMessage } from "@/components/Messages"
import { useTrans } from "@/lib/trans"

export default function Entry({}) {
    const _ = useTrans()
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
                    <th>{_("data")}</th>
                    <td>{formatDate(entry.createdAt)}</td>
                </tr>
                <tr>
                    <th>{_("ora")}</th>
                    <td>{ entry.createdAt
                        ? dayjs(entry.createdAt).format("HH:mm:ss")
                        : '---' }
                    </td>
                </tr>
                <tr>
                    <th>{_("tipo")}</th>
                    <td>{entry?.poll?.form}</td>
                </tr>
                <tr>
                    <th>{_("scuola")}</th>
                    <td>{entry?.poll?.school?.name}</td>
                </tr>
                <tr>
                    <th>{_("città")}</th>
                    <td>{entry?.poll?.school?.city}</td>
                </tr>
                <tr>
                    <th>{_("classe")}</th>
                    <td>{entry?.poll?.year}&nbsp;{entry?.poll?.class}</td>
                </tr>
                <tr>
                    <th>{_("lingua")}</th>
                    <td>{entry?.lang}</td>
                </tr>
                <tr>
                    <th>ip</th>
                    <td>{entry?.IP}</td>
                </tr>
                <tr>
                    <th>timestamp</th>
                    <td>{entry?.clientTimestamp}</td>
                </tr>
            </tbody>
        </Table>
        <ButtonGroup>
            <Button onClick={() => router.push('/entries')}>{_("elenco")}</Button>
            <Button variant="danger" onClick={trash}>{_("elimina")}</Button>
        </ButtonGroup>
        <Table>
            <thead>
                <tr>
                    <th>{_("domanda")}</th>
                    <th>{_("risposta")}</th>
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
        } catch (error) {
            addMessage('warning', `${_("errore")}: ${error}`)
        }
    }
}