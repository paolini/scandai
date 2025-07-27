import { Bar, Doughnut } from "react-chartjs-2"
import { assert } from '@/lib/assert'

import { 
    IChooseLanguageQuestionStat, 
} from '@/pages/api/graphql/resolvers/stats'
import { IReportElement } from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function GraphChooseLanguageQuestionCounts({item,stat}: {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat}) {
    const _ = useTrans()
//    const item_title = item.title && trans(item.title, _.locale)

    function nLanguages(count: number) {
        if (count===0) return _("Nessuna lingua")
        if (count===1) return _("Una lingua")
        return _("% lingue", count)
    }
    assert(stat.counts)
    assert(item.element === 'chart')
    const data = stat.counts
        .map((v,i)=>[v,i])
        .filter(([v,i])=>v>0)

    const total = data.reduce((acc, [v,i])=>acc+v, 0)

    return <Bar             
        options = {{
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                },
                x: {
                    beginAtZero: true,
                    stacked: true,
                }
            },
            indexAxis: 'y',
            plugins: {
                tooltip: {
                    enabled: false,
                    callbacks: {
                        label: function(tooltipItem) {
                            return 'label'
                        },
                    },
                },
                datalabels: {
                    formatter: function(value) { 
                        const p = Math.round(value*100/total)
                        return p>5 ? `${p}%` : null
                    },
                }
            }
        }}
            data={{
                labels: [''],
                datasets: 
                    data.map(([v,i]) => ({
                        label: `${i}`,
                        data: [v],
                    }))
            }}
    />

    // c'era la ciambella
    return <Doughnut
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'center',
                    formatter: (value,context) => value>0.01*total ? `${Math.round(value*100/total)}% ${nLanguages(data[context.dataIndex][1])}`:null,
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: item_title || stat.question.question.it,
//                },
            },
        }} 
        data={{
            labels: data.map(([v,i])=>nLanguages(i)),
            datasets: [
                {
                data: data.map(([v,i])=>v),
               // backgroundColor: 'orange',
                },
            ],
        }} 
    />
}

