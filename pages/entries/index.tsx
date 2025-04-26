import { Table } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useState } from 'react'
import dayjs from 'dayjs'
import {gql, useQuery} from '@apollo/client'

import Page from '../../components/Page'
import Loading from '../../components/Loading'
import Error from '../../components/Error'
import { formatDate, formatTime } from '../../lib/utils'
import { useTrans } from '../../lib/trans'
import { currentSchoolYear } from '../../lib/utils'
import questionary from '../../lib/questionary'
import { Entry } from '@/generated/graphql'
import { LanguageAnswer, MapLanguageToAgeAnswer, MapLanguageToCompetenceAnswer } from '@/lib/mongodb'

const EntriesQuery = gql`
    query EntriesQuery($year: Int!) {
        entries(year:$year) {
            _id
            createdAt
            poll {
                date
                school {
                    name
                    city
                    city_fu
                }
                class
                year
                form
            }
            lang
            answers
        }
    }`

export default function EntriesContainer() {
    return <Page>
        <Entries />
    </Page>
}

function Entries({}) {
    const _ = useTrans()
    const router = useRouter()
    const currentYear = currentSchoolYear()
    const [year, setYear] = useState(currentYear)
    const entriesQuery = useQuery(EntriesQuery,{variables:{year}})
    if (entriesQuery.loading) return <Loading />
    if (!entriesQuery.data) return <Error>{`${entriesQuery.error}`}</Error>
    const entries: Entry[] = entriesQuery.data.entries
    const years = Array.from({length:currentYear-2022}, (_,i) => currentYear-i)
    return <>
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
    </>

    function downloadCsv() {
        const data = "data:text/tsv;charset=utf-8," 
            + csv().map(row => row.join('\t')).join('\n')
        const encodedUri = encodeURI(data)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `entries-${year}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    function csv() {
        const question_codes = Object.keys(questionary.questions)
        const attributes = ['_id', 'date', 'form', 'school', 'city', 'class', 'lang']
        const headers = [...attributes]
        for (const code of question_codes) {
            headers.push(...cells(code))
        }
        return [
            headers,
            ...entries.map(entry=>entryRow(attributes, question_codes, entry))]
    }

    function entryRow(attributes: string[], question_codes: string[], entry: Entry) {
        const answers = entry.answers
        const columns = []
        for (const attribute of attributes) {
            switch(attribute) {
                case '_id': columns.push(entry._id); break
                case 'date': columns.push(formatTimestamp(entry.createdAt)); break
                case 'form': columns.push(entry.poll?.form); break
                case 'school': columns.push(entry.poll?.school?.name); break
                case 'city': columns.push(entry.poll?.school?.city); break
                case 'class': columns.push(`${entry.poll?.year} ${entry.poll?.class}`); break
                case 'lang': columns.push(entry.lang); break
                default: columns.push('???'); break
            }
        }
        for (const code of question_codes) {
            columns.push(...cells(code, entry))
        }
        return columns

        function formatTimestamp(date:string) {
            if (!date) return ''
            return dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
        }
        
    }

    function cells(question_code: string, entry: Entry|null = null) {
        const langs = Object.keys(questionary.languages)
        const type = questionary.questions[question_code].type
        switch(type) {
            case 'choose-language':
                {
                    const cells = []
                    for (const lang of langs) {
                        if (entry) {
                            const answer = entry.answers[question_code] as LanguageAnswer|undefined
                            if (answer) {
                                cells.push(answer.includes(lang) ? '1' : '')
                            } else {
                                cells.push('')
                            }
                        } else {
                            cells.push(`${question_code} ${lang}`)
                        }
                    }
                    return cells
                }
            case 'map-language-to-competence':
                {
                const competences = questionary.competences.map(k=>k.code)
                const cells = []
                for (const lang of langs) {
                    for (const competence of competences) {
                        if (entry) {
                            const answer = entry.answers[question_code] as MapLanguageToCompetenceAnswer|undefined
                            cells.push(answer 
                                ? ZeroToEmpty(answer[lang]?.[competence] || '')
                                : '')
                        } else {
                            cells.push(`${question_code} ${lang} ${competence}`)
                        }
                    }
                }
                return cells
            }
            case 'map-language-to-age':
                {
                const cells = []
                for (const lang of langs) {
                    if (entry) {
                        const answer = entry.answers[question_code] as MapLanguageToAgeAnswer|undefined
                        if (answer) {
                            cells.push(answer[lang] || '')
                        } else {
                            cells.push('')
                        }
                    } else {
                        cells.push(`${question_code} ${lang}`)
                    }
                }
                return cells
            }
            default:
                if (!entry) return [`${question_code}>${type}`]
                return [JSON.stringify(entry.answers[question_code]) || ''] 
        }

        function myIncludes(list: string[], item: string) {
            if (!list) return ''
            return list.includes(item) ? '1' : '0'
        }

        function ZeroToEmpty(val: any) {
            return val=== '0' ? '' : val
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