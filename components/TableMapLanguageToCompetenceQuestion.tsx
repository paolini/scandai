import { Table } from 'react-bootstrap'

import { IMapLanguageToCompetenceQuestionStat } from '@/pages/api/graphql/resolvers/stats'
import questionary, { extractLevels } from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

export default function TableMapLanguageToCompetenceQuestion({stat, title, language}
    : {
        stat: IMapLanguageToCompetenceQuestionStat,
        language: string,
        title?: string,
    }) {
    const _ = useTrans()
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[localizedLanguage]
    const levels = extractLevels(questionary)
    if (!stats) return <div>{_("No stats for language %", language)}</div>

    function computeDataset(stat: {[key: string]: number}) {
        const total = Object.values(stat).reduce((sum,x) => sum+x,0)
        if (total === 0) return levels.map(level => ({ratio: 0, count: 0}))
        return levels.map(level => ({ratio: (stat[level] || 0) / total, count: stat[level] || 0}))
    }

    return <>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    {levels.map(level => <th key={level}>{level}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    Object.entries(stats.competence).map(([competence, x]) => 
                        <tr key={competence}>
                            <th>{competence}</th>
                            {computeDataset(x.level).map(({ratio, count},i)=>
                                <td key={i}>
                                    {Math.round(ratio*100)}%
                                    {} <span style={{fontSize: "70%"}}>({count})</span>
                                </td>)}
                        </tr>
                    )
                }
            </tbody>
        </Table>
        <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}
        </p>
    </>
}

