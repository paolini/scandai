import { Bar } from "react-chartjs-2"

import { IMapLanguageToAgeQuestionStat } from '@/pages/api/graphql/resolvers/stats'
import questionary from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function GraphMapLanguageToAgeQuestion({stat, t} : {
        stat: IMapLanguageToAgeQuestionStat,
        t: T,
    }) {
    const _ = useTrans()
    const stats = stat.answers
    const ages = questionary.ages.map(x => x.code)
//    const title = _("Età di apprendimento lingua")
    const languages = Object.keys(stat.answers)

    const datasets = ages.map(age => 
        ({
            data: languages.map(lang => (stat.count ? (stats[lang]?.[age] || 0)/stat.count:0)),
            label: age || _("mai"),
        }))

    const labels = languages.map(lang => t(lang))

    return <>
        <Bar
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top' as const,
                },
                datalabels: {
                    display: false,
                    anchor: 'center',
                    align: 'top',
                    formatter: value => (value>0?`${Math.round(value*100)}%`:null),
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: `${title || stat.question.question.it}`,
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
            labels,
            datasets
        }}
       />
        <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}
        </p>
    </>
}