import { useRouter } from "next/router"
import { ButtonGroup, Button, Table } from "react-bootstrap"
import dayjs from "dayjs"

import Loading from "@/components/Loading"
import ErrorElement from "@/components/Error"
import Page from "@/components/Page"
import { formatDate, formatTime } from "@/lib/utils"
import { useAddMessage } from "@/components/Messages"
import { useTrans } from "@/lib/trans"
import { gql, useMutation, useQuery } from "@apollo/client"
import Error from "@/components/Error"

export default function EntryContainer() {
    return <Page>
        <EntryPage />
    </Page>
}

const EntryQuery = gql`
    query EntryQuery($_id: ObjectId!) {
        entry(_id: $_id) {
            _id
            createdAt
            clientTimestamp
            IP
            lang
            poll {
                _id
                form
                year
                class
                school {
                    _id
                    name
                    city
                    city_fu
                }
            }
            answers
        }
    }
`
const DeleteEntryMutation = gql`
    mutation DeleteEntry($_id: ObjectId!) {
        deleteEntry(_id: $_id)
    }
`

function EntryPage({}) {
    const _ = useTrans()
    const router = useRouter()
    const entryId = router.query.entry_id
    const entryQuery = useQuery(EntryQuery,{variables:{_id: entryId}})
    const [deleteEntry, {loading, error}] = useMutation(DeleteEntryMutation,{
        variables: { _id: entryId },
        onCompleted: () => {
            router.push('/entries')
        }
    })
    if (!entryId || Array.isArray(entryId)) return <ErrorElement>id non valido</ErrorElement>

    if (entryQuery.loading) return <Loading />
    if (!entryQuery.data) return <ErrorElement>{`${entryQuery.error}`}</ErrorElement>
    const entry = entryQuery.data.entry
    return <>
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
            {error && <Error>{`${error}`}</Error>}
            <Button onClick={() => router.push('/entries')}>{_("elenco")}</Button>
            <Button variant="danger" disabled={loading} onClick={() => deleteEntry()}>{_("elimina")}</Button>
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
    </>

    function display(ans:any) {
        if (Array.isArray(ans)) return ans.join(', ')
        if (typeof ans === 'string') return ans
        return Object.entries(ans).map(([key, val]) => `${key}: ${g(val)}`).join(', ')
    }   

    function g(val:any) {
        if (val==='') return ''
        if (typeof val === 'string') return val
        return `{${Object.entries(val).map(([key, val]) => `${key}: ${val}`).join(', ')}}`
    }
}