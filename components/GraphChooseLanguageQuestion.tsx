import { Bar } from "react-chartjs-2"
import { assert } from '@/lib/assert'

import { IChooseLanguageQuestionStat } from '@/pages/api/graphql/resolvers/stats'
import questionary, { IReportElement } from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function GraphChooseLanguageQuestion({item, stat, count, t} : {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat,
        count: "answers" | "questions" | "positive",
        t: T,
    }) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    const total = count === 'answers' ? stat.countAnswers : count === 'positive' ? stat.countPositive : stat.count
    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    formatter: value => `${Math.round(value*100)}%`
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: item_title || stat.question.question.it,
//                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        precision: 1,
                        format: {
                            style: 'percent',
                        },
                        callback: value => typeof(value)==='number'?`${Math.round(value*100)}%`:'???',
                    },
                }
            }
        }} 
        data={{
            labels: Object.keys(stat.answers).map(id => id===''?_("altre"):t(id)),
            datasets: [
                {
                data: Object.entries(stat.answers).map(([key, val])=> (total ? val / total : 0) ),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

