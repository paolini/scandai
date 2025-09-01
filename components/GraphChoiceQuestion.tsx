import { Bar } from "react-chartjs-2"
import { assert } from '@/lib/assert'

import { 
    IChoiceQuestionStat,
} from '@/pages/api/graphql/resolvers/stats'
import { IReportElement } from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function GraphChoiceQuestion({item, stat, t} : {
        item: IReportElement,
        stat: IChoiceQuestionStat,
        t: T,
    }) {
    const _ = useTrans()
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    const total = stat.count
    const labels = Object.fromEntries(stat.question.choices?.map(c => [c.value, c.label[_.locale] || c.label.it || c.value]) || [])
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
            labels: Object.keys(stat.answers).map(id => id===''?_("altre"):labels[id]),
            datasets: [
                {
                data: Object.entries(stat.answers).map(([key, val])=> (total ? val / total : 0) ),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

