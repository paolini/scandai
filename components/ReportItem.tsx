import { useState } from "react"
import { Bar, Doughnut, Radar, } from "react-chartjs-2"
import { Table } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import { 
    IStats, 
    IQuestionStat,
    IChooseLanguageQuestionStat, 
    IMapLanguageToCompetenceQuestionStat, 
    IMapLanguageToAgeQuestionStat,
    IChoiceQuestionStat,
} from '@/pages/api/graphql/resolvers/stats'
import questionary, { extractLevels, trans, IReportBlockElement, IReportTableElement, IReportElement, IReportQuestionElement } from '@/lib/questionary'
import Error from '@/components/Error'
import { useTrans } from "@/lib/trans"
import State from "@/lib/State"
import ReportTitle, {htmlTitleStyle} from "./ReportTitle"
import Item from "./Item"
import { ListClasses } from "./StatsFilter"
import PreferredPie from "./PreferredPie"
import GraphChooseLanguageQuestion from "./GraphChooseLanguageQuestion"
import TableChooseLanguageQuestion from "./TableChooseLanguageQuestion"

type T = (s:string) => string

export default function ReportItem({ stats, item, t, pollIdsState}: {
    stats: IStats,
    item: IReportElement,
    t: T,
    pollIdsState: State<string[]>,
}) {
    const _ = useTrans()
    const item_title = item.title && trans(item.title, _.locale)
    switch(item.element) {
        case 'chart':
        case 'table':
            const [question, ErrorElement] = StatsQuestionOrError(stats, item)
            if (question === null) return ErrorElement // potrebbe essere null
            switch(item.element) {
                case 'chart':
                    return <ReportChart question={question} item={item} t={t}/>
                case 'table':
                    return <ReportTable question={question} item={item} t={t}/>    
            }
        case 'title':
            return <h1>{item_title || _("Risultati aggregati")}</h1>
        case 'info':
            return <ListClasses stats={stats} title={item.title ? trans(item.title,_.locale) : _("Partecipanti")} pollIdsState={pollIdsState}/>
        case 'preferred':
            return <Item title={item_title} avoidBreakInside={true}>
                <PreferredPie showTable={item.table} stats={stats.preferredLanguageCount} title={item_title}/>
            </Item>
        case 'block':
            return <ReportBlockElement item={item} stats={stats} t={t} pollIdsState={pollIdsState}/>
        default:
            return <Error>invalid report item</Error>
    }
}

function ReportBlockElement({item,stats,t,pollIdsState}:{
    item: IReportBlockElement,
    stats: IStats,
    t: T,
    pollIdsState: State<string[]>,
}) {
    const [hide, setHide] = useState<boolean>(true)
    const _ = useTrans() 

//    const elements = item.elements.map((item, i) => <ReportItem key={i} stats={stats} item={item} t={t} pollIdsState={pollIdsState} />)
    // Chiamo ReportItem come funzione per verificare se restituisce null
    const elements = item.elements.map((el, i) => {
        const result = ReportItem({ stats, item: el, t, pollIdsState });
        // Se vuoi mantenere la chiave, puoi usare cloneElement se result è un React element
        if (result && typeof result === 'object' && 'type' in result) {
            return { ...result, key: i };
        }
        return result; // può essere null
    }).filter(e => e !== null)

    if (elements.length === 0) return null

    return <div>
        <ReportTitle title={item.title[_.locale]} hide={hide} bold={item?.bold} setHide={setHide}/>
        <div className={"mb-5 " + (hide?"hideBlock":"")}>
            <div className="mb-5" style={{maxWidth: 640}}>
                {elements}
            </div>
            { !hide && <div className="noPrint" onClick={() => setHide(true)} style={{cursor: "pointer", textAlign: "right"}}><b>△</b></div>}
            <hr />
        </div>
    </div>
}

function StatsQuestionOrError(stats: IStats, item: IReportQuestionElement): [IQuestionStat|null, JSX.Element|null] {
    const _ = useTrans()
    const question = stats.questions[item.question]
    if (!question) {
        return [null, null] // non ci sono statistiche per questa domanda
    }
    if (question.type === 'error') return [null, <Error key={item.question}>
        {_("Errore:")} {question.error}
    </Error>]
    if (question.count === 0) return [null, <Error key={item.question}>
        {_("Nessuna risposta per la domanda")}
    </Error>]
    return [question, null]
}

function CompetenceLegend({title}:{
    title?: string,
}) {
    const _ = useTrans()
    const competences = questionary.competences
    return <Item avoidBreakInside={true} title={title}>
        <b>{_("Legenda")}</b>
        <br/>
        <Table  style={{fontSize: "75%"}}>
            <tbody>
                <tr style={{background: "#ced4da"}}>
                    <th>{_("abilità")}</th>
                    <td>CO<br />{_("comprensione orale")}</td>
                    <td>CS<br />{_("comprensione scritta")}</td>
                    <td>PO<br />{_("produzione orale")}</td>
                    <td>PS<br />{_("produzione scritta")}</td>
                </tr>
                <tr style={{background: "#e9ecef"}}>
                    <th>{_("competenza")}</th>
                    <td>0 {_("nulla")}</td>
                    <td>A {_("iniziale")}</td>
                    <td>B {_("intermedia")}</td>
                    <td>C {_("avanzata")}</td>
                </tr>
                <tr style={{background: "#e9ecef"}}>
                    <th>{_("valore dichiarato")}</th>
                    <td> 0-1-2</td>
                    <td> 3-4-5</td>
                    <td> 6-7</td>
                    <td> 8-9-10</td>
                </tr>
            </tbody>
        </Table>
    </Item>
}

function ReportChart({ question, item, t } : {
        question: IQuestionStat,
        item: IReportElement,
        t: T,
    }) {
    const _ = useTrans()
    const item_title = 
        (item.title && trans(item.title, _.locale)) 
        || question.question.question[_.locale]
    assert(item.element === 'chart')
    console.log(`ReportChart: ${JSON.stringify({item, question, item_title})}`)
    switch(question.type) {
        case 'choose-language': 
            switch (item.variant) {
                case undefined:
                case 'chart':
                    return <Item avoidBreakInside={true} title={item_title}>
                        <GraphChooseLanguageQuestion item={item} stat={question} count={item?.count || "positive" } t={t}/>
                        <TableChooseLanguageQuestion stat={question} count={item?.count || "positive"} t={t}/>
                    </Item>
                case 'count':
                    return <Item avoidBreakInside={true} small={true} title={item_title || 'yyy'}>
                            <GraphChooseLanguageQuestionCounts item={item} stat={question} />
                            <TableChooseLanguageQuestionCounts item={item} stat={question} />
                    </Item>
            }
        case 'map-language-to-competence': return <Item avoidBreakBefore={true}>
                <CompetenceLegend />
                { Object.keys(questionary.languages).map(lang =>
                    <Item avoidBreakInside={true} key={lang} title={`${item_title || question.question.question.it} - ${questionary.languages[lang][_.locale] || lang}`}>
                        <GraphMapLanguageToCompetenceQuestion 
                            stat={question} 
                            title={_("Competenze linguistiche autovalutate")}
                            language={lang} />
                        <TableMapLanguageToCompetenceQuestion 
                            stat={question} 
                            language={lang} />
                    </Item>)
                }   
            </Item>
        case 'map-language-to-age': return <Item title={item_title || question.question.question.it} avoidBreakInside={true}>
                <GraphMapLanguageToAgeQuestion stat={question} t={t}/>
            </Item>
        case 'choice': return <Item title={item_title || question.question.question.it} avoidBreakInside={true}>
                <GraphChoiceQuestion stat={question} t={t} item={item}/>
                <TableChoiceQuestion stat={question} t={t} />     
            </Item>
        default: return <Item>
            <Error>
            invalid question type {question.type} 
            {} for report item {item.element}
            </Error>
        </Item>
    }
}

function ReportTable({ question, item, t} : {
    question: IQuestionStat,
    item: IReportElement,
    t: T
}) {
    assert(item.element === 'table')
    switch(question.type) {
        case 'choose-language': 
            return <Item>
                <TableChooseLanguageQuestion stat={question} count={item?.count || "questions"} t={t} />
            </Item>

        case 'map-language-to-competence':
            return <Item>
                <TableMapLanguageToCompetence stat={question} item={item} t={t}/>
            </Item>
        default:
            return <Item>
                <Error>
                    invalid question type {question.type} 
                    for report item {item.element}
                </Error>
            </Item>
    }
}

function GraphChoiceQuestion({item, stat, t} : {
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

function TableChoiceQuestion({stat, t}: {
    stat: IChoiceQuestionStat,
    t: T,
}) {
    const _ = useTrans()
    const labels = Object.fromEntries(stat.question.choices?.map(c => [c.value, c.label[_.locale] || c.label.it || c.value]) || [])
    if (!stat.answers) return <div>invalid answers</div>

    return <><Table className="my-0">
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {id===''?_("altre"):labels[id]}
                </td>)}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>{_("conteggio")}</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {val}
                </td>)}
            </tr>
        </tbody>
    </Table>
    <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}, {}
        {_("numero risposte")}: {stat.countPositive}
    </p>
    </>
}

function GraphChooseLanguageQuestionCounts({item,stat}: {
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

function TableChooseLanguageQuestionCounts({item,stat}: {
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

    return <Table>
        <thead>
            <tr>
                <td></td>
                { data.map(([v,i])=><th key={i}>{nLanguages(i)}</th>) }
            </tr>
        </thead>    
        <tbody>
            <tr>
                <th>{_("conteggio")}</th>
                { data.map(([v,i])=><td key={i}>{v}</td>) }
            </tr>
            <tr>
                <th>{_("percentuale")}</th>
                { data.map(([v,i])=><td key={i}>{Math.round(v*100/total)}%</td>) }
            </tr>
        </tbody>        
    </Table>

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

function GraphMapLanguageToCompetenceQuestion({stat, title, language}
    : {
        stat: IMapLanguageToCompetenceQuestionStat,
        language: string,
        title?: string,
    }) {
    // console.log(`GraphMapLanguageToCompetenceQuestion: ${JSON.stringify({stat, language})}`)
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[localizedLanguage]
    const levels = extractLevels(questionary)
    const _ = useTrans()
    // const chart_title = `${title || stat.question.question.it} - ${localizedLanguage}`
    if (!stats) return <div>{_("No stats for language %", language)}</div>

    function computeDataset(stat: {[key: string]: number}) {
        const total = Object.values(stat).reduce((sum,x) => sum+x,0)
        if (total === 0) return levels.map(level => 0)
        return levels.map(level => (stat[level] || 0) / total)
    }

    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'end',
                    align: 'start',
                    formatter: value => (value>0?`${Math.round(value*100)}%`:null),
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: char_title,
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
            labels: levels,
            datasets: Object.entries(stats.competence).map(([competence, x]) => 
                ({
                    data: computeDataset(x.level),
                    label: competence,
                })) 
        }}
    />
}

function TableMapLanguageToCompetenceQuestion({stat, title, language}
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

function TableMapLanguageToCompetence({stat, item, t} : {
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

function GraphMapLanguageToAgeQuestion({stat, t} : {
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