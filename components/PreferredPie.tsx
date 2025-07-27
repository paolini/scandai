import { Bar, Doughnut } from "react-chartjs-2"
import { Table } from 'react-bootstrap'
import questionary from '@/lib/questionary'

import { 
    IPreferredLanguageCount,
} from '@/pages/api/graphql/resolvers/stats'
import { useTrans } from "@/lib/trans"
import Item from "./Item"

export default function PreferredPie({ stats, title, showTable} : {
    stats: IPreferredLanguageCount,
    title?: string,
    showTable?: boolean,
}) {
    const _ = useTrans()
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item small={true}>
        <Bar             
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
                        formatter: (value) => `${Math.round(value*100/total)}%`,
                    }
                }
            }}
                 data={{
                    labels: [''],
                    datasets: 
                        items.map(([k,v]) => ({
                            label: questionary_language(k,_.locale) || k,
                            data: [v],
                            formatter: (value: number) => `${Math.round(value*100/total)}%`,
                        }))
                }}
        />
        { false && <Doughnut
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top' as const,
                    },
                    datalabels: {
                        anchor: 'center',
                        formatter: (value,context) => `${Math.round(value*100/total)}%`,
                    },
//                    title: {
//                        ...CHART_TITLE,
//                        text: title,
//                    },
                },
            }} 
            data={{
                labels: items.map(([k,v]) => questionary_language(k,_.locale) || undefined),
                datasets: [
                    {
                    data: items.map(([k,v])=>v),
                // backgroundColor: 'orange',
                    },
                ],
            }} 
        />}
        {showTable && <PreferredTable stats={stats} />}
    </Item>
}

export function PreferredTable({ stats, title} : {
    stats: IPreferredLanguageCount,
    title?: string,
}) {
    const _ = useTrans()
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item title={title}>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>{_("conteggio")}</th>
                    <th>{_("percentuale")}</th>
                </tr>
            </thead>
            <tbody>
                {items.map(([k,v]) => 
                    <tr key={k}>
                        <th>{questionary_language(k,_.locale) || _("non specificato")}</th>
                        <td>{v}</td>
                        <td>{Math.round(v*100/total)}%</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Item>
}

function questionary_language(k: string, locale: string) {
    const s = questionary.languages[k]
    return (s ? s[locale] : k) || k
}
