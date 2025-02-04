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
import { IGetEntry } from '../../models/Entry'
import questionary from '../../lib/questionary'

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
        <button className="mx-3" onClick={downloadCsv}>download csv</button>
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

    function downloadCsv() {
        const question_codes = Object.keys(questionary.questions)
        const attributes = ['_id', 'date', 'form', 'school', 'city', 'class', 'lang']
        const csv = "data:text/tsv;charset=utf-8," 
            + [...attributes, ...question_codes].join('\t') + '\n'
            + entries.map(entry=>entryRow(attributes, question_codes, entry)).join('\n')
        const encodedUri = encodeURI(csv)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `entries-${year}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    function entryRow(attributes: string[], question_codes: string[], entry: IGetEntry) {
        const answers = entry.answers
        const columns = []
        for (const attribute of attributes) {
            switch(attribute) {
                case '_id': columns.push(entry._id); break
                case 'date': columns.push(formatDate(entry.createdAt)); break
                case 'form': columns.push(entry.poll?.form); break
                case 'school': columns.push(entry.poll?.school.name); break
                case 'city': columns.push(entry.poll?.school.city); break
                case 'class': columns.push(`${entry.poll?.year} ${entry.poll?.class}`); break
                case 'lang': columns.push(entry.lang); break
                default: columns.push('???'); break
            }
        }
        for (const code of question_codes) {
            columns.push(JSON.stringify(answers[code]) || '')
        }
        return columns.join('\t')
    }

    function cells(question_code: string, entry: IGetEntry|null = null) {
        switch(questionary.questions[question_code].type) {
        }
    }
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