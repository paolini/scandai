import { Table } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useState } from 'react'

import Page from '../../components/Page'
import { useEntries } from '../../lib/api'
import Loading from '../../components/Loading'
import Error from '../../components/Error'
import { formatDate, formatTime } from '../../lib/utils'
import { useTrans } from '../../lib/trans'
import { currentSchoolYear } from '../../lib/utils'

export default function Entries({}) {
    const _ = useTrans()
    const router = useRouter()
    const currentYear = currentSchoolYear()
    const [year, setYear] = useState(currentYear)
    const entriesQuery = useEntries({year})
    if (entriesQuery.isLoading) return <Loading />
    if (!entriesQuery.data) return <Error>{entriesQuery.error.message}</Error>
    const entries = entriesQuery.data.data
    const years = Array.from({length:currentYear-2022}, (_,i) => currentYear-i)
    return <Page>
        {_("anno scolastico")} <select value={year} onChange={(e) => {setYear(parseInt(e.target.value))}}>
            { years.map(y => <option key={y} value={y}>{y}/{y+1}</option>) }
        </select>
        <Table hover>
            <thead>
                <tr>
                    <th>{_("data")}</th>
                    <th>{_("ora")}</th>
                    <th>{_("tipo")}</th>
                    <th>{_("scuola")}</th>
                    <th>{_("città")}</th>
                    <th>{_("classe")}</th>
                    <th>{_("lingua")}</th>
                    <th>{_("risposte")}</th>
                </tr>
            </thead>
            <tbody>
                {entries.map(entry => 
                    <tr key={entry._id} onClick={() => router.push(`/entries/${entry._id}`)}>
                        <td>{formatDate(entry.createdAt)}</td>
                        <td>{formatTime(entry.createdAt)}</td>
                        <td>{entry?.poll?.form}</td>
                        <td>{entry?.poll?.school?.name}</td>
                        <td>{entry?.poll?.school?.city}</td>
                        <td>{entry?.poll?.year}&nbsp;{entry?.poll?.class}</td>
                        <td>{entry?.lang}</td>
                        <td>{count(entry.answers)}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Page>
}    

function count(ans: any) {
    let n=0
    for (const key in ans) {
        const val = ans[key]
        if (Array.isArray(val)) n += val.length
        else n += Object.values(val).length
    }
    return n
}