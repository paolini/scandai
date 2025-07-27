import { Radar } from "react-chartjs-2"
import { Table } from 'react-bootstrap'

import {  IMapLanguageToCompetenceQuestionStat } from '@/pages/api/graphql/resolvers/stats'
import questionary, { trans, IReportTableElement } from '@/lib/questionary'
import { useTrans } from "@/lib/trans"
import Item from "./Item"
import {htmlTitleStyle} from "./ReportTitle"

type T = (s:string) => string


export default function TableMapLanguageToCompetence({stat, item, t} : {
        stat: IMapLanguageToCompetenceQuestionStat,
        item: IReportTableElement,
        t: T,
    }) {
    const _ = useTrans()
    const item_title = item.title && trans(item.title, _.locale)
    const competences = questionary.competences.map(c => c.code)
    const entries = Object.entries(stat.answers).slice(0,10)
    return <Item>
        { item.title && <h3 style={htmlTitleStyle}>{item_title}</h3> }
        <p>{_("Media delle competenze autovalutate sul campione che non dichiara competenze nulle")}</p>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>{_("campione")}</th>
                    {competences.map(c => <th key={c}>{c}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    Object.entries(stat.answers)
                        .filter(([lang, s]) => s.countValid > 0.005*stat.count)
                        .map(([lang, s]) => 
                        <tr key={lang}>
                            <th>{t(lang)}</th>
                            <td>{stat.count ? Math.round(100*s.countValid / stat.count) : "??"}%</td>
                            {Object.entries(s.competence).map(([c,cstat])=>
                                <td key={c}>{s.countValid?Math.round(100*cstat.sum/s.countValid)/100:_("n.a.")}</td>)}
                        </tr>
                    )
                }
            </tbody>
        </Table>
        <Radar
          data = {{
            labels: questionary.competences.map(c => c.code),
            datasets: entries.map(([lang, s]) => 
                ({
                    label: t(lang),
                    data: Object.entries(s.competence).map(([c,n])=> (stat.count?n.sum/stat.count:0)),
                    fill: false,
                    pointRadius: 3,
                }))
            }}
          options = {{
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            plugins: {
                datalabels: {
                    display: false
                },
                colors: {
                    forceOverride: true,
                }
            },
        }}
        />
    </Item>
}

