import { useRef, CSSProperties, ReactNode } from "react"
import { useRouter } from 'next/router'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
import { Bar, Doughnut, Radar, } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Table, Button } from 'react-bootstrap'
import { useReactToPrint } from 'react-to-print'
import { assert } from '@/lib/assert'

import useSessionUser from '@/lib/useSessionUser'
import { useStats } from '@/lib/api'
import { 
    IStats, 
    IQuestionStat,
    IChooseLanguageQuestionStat, 
    IMapLanguageToCompetenceQuestionStat, 
    IMapLanguageToAgeQuestionStat,
    IPreferredLanguageCount,
} from '@/pages/api/stats'
import questionary, { extractLevels, IReportChartElement, IReportTableElement, IReportElement, IReportQuestionElement } from '@/lib/questionary'
import Page from '@/components/Page'
import Error from '@/components/Error'
import Loading from "@/components/Loading";

const CHART_WIDTH = 640
const CHART_WIDTH_SMALL = 400

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    ChartTitle,
    Tooltip,
    Legend,
    ChartDataLabels,
    Colors,
)

const CHART_TITLE = {
    display: true,
    font: { 
        size: 24,
    // style: 'italic',
    // family: 'Helvetica Neue'    
    },
    color: 'black',
}

const htmlTitleStyle: CSSProperties = {
    fontSize: 24, 
    textAlign: 'center',
}

const itemClass="my-4"

const itemStyle={maxWidth:CHART_WIDTH}

const getPageMargins = () => {
    const marginTop="1cm"
    const marginRight="6cm"
    const marginBottom="1cm"
    const marginLeft="2cm"
    
    return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};

export default function Report() {
    const user = useSessionUser()
    const router = useRouter()
    const statsQuery = useStats(router.query)
    const form = router.query.form || "full"
    const school_id = router.query.school_id
    const ref = useRef(null)
    const print = useReactToPrint({
        content: () => ref.current,
    })

    if (Array.isArray(form)) return <Error>richiesta non valida</Error>

    if (statsQuery.isLoading) return <Loading />
    if (!statsQuery.data) return <Error>Errore caricamento ({`${statsQuery.error}`})</Error>
    
    const stats = statsQuery.data.data

    if (stats.entriesCount === 0) return <Page header={!!user}>
        <Error>
        Impossibile fare il report: nessun questionario compilato
        </Error>
    </Page>

    return <Page header={!!user}>
        <div className="container noPrint">
            <Button onClick={print} style={{float:"right"}}>stampa</Button>
        </div>
        <div ref={ref}>
            <style>
                {getPageMargins()}
            </style>
        { questionary.forms[form].report.map(
            (item, i) => <ReportItem key={i} stats={stats} item={item} />
        )}
        </div>
    </Page>
}

function ReportItem({ stats, item }: {
    stats: IStats,
    item: IReportElement,
}) {
    switch(item.element) {
        case 'chart':
        case 'table':
            const [question, ErrorElement] = StatsQuestionOrError(stats, item) 
            if (question === null) return ErrorElement
            switch(item.element) {
                case 'chart':
                    return <ReportChart question={question} item={item} />
                case 'table':
                    return <ReportTable question={question} item={item} />    
            }
        case 'title':
            return <h1>{item.title || `Risultati aggregati`}</h1>
        case 'info':
            return <ListClasses stats={stats} title={item?.title || "Partecipanti"}/>
        case 'preferred':
            if (item.table) return <PreferredTable stats={stats.preferredLanguageCount} title={item.title}/>
            else return <PreferredPie stats={stats.preferredLanguageCount} title={item.title}/>
        default:
            return <Error>invalid report item</Error>
    }
}

function StatsQuestionOrError(stats: IStats, item: IReportQuestionElement): [IQuestionStat|null, JSX.Element|null] {
    const question = stats.questions[item.question]
    if (!question) return [null, <Error key={item.question}>
        Domanda non trovata &lt;{item.question}&gt;
    </Error>]
    if (question.type === 'error') return [null, <Error key={item.question}>
        Errore: {question.error}
    </Error>]
    if (question.count === 0) return [null, <Error key={item.question}>
        Nessuna risposta per la domanda
    </Error>]
    return [question, null]
}

function Title({title}:{
    title?:string
}) {
    if (!title) return null
    return <h3 style={htmlTitleStyle}>{title}</h3>
}

function Item({title, small, children}: {
    title?: string,
    small?: boolean,
    children: ReactNode,
    }) {    
    return <div className="my-4" style={{maxWidth: small ? 400 : 640}}>
        <Title title={title} />
        { children }
    </div>
}

function CompetenceLegend({title}:{
    title?: string,
}) {
    const competences = questionary.competences
    return <Item title={title}>
        <b>Legenda</b>
        <br/>
        <i>abilità:</i>
        <ul>
            {competences.map(c =>
                <li key={c.code}>{c.code}: {c.it}</li>)}                
        </ul>
    </Item>
}

function ListClasses({ stats, title }: {
    stats: IStats,
    title?: string,
}) {
    return <Item title={title}>
        <Table className="table">
            <thead>
                <tr>
                    <th>scuola</th>
                    <th>città</th>
                    <th>classe</th>
                    <th>partecipanti</th>
                </tr>
            </thead>
            <tbody>
        { 
            stats.polls.map(c => 
            <tr key={c._id.toString()}>
                <td>
                    {c?.school?.name} 
                </td>
                <td>
                    {c?.school?.city}
                </td>
                <td>
                     {c.class}
                </td>
                <td>
                {c?.entriesCount}
                </td>
            </tr>)
        }   
        {   stats.polls.length > 1 &&
            <tr>
                <th colSpan={2}>totale</th>
                <th>{stats.polls.length}</th>
                <th>{stats.entriesCount}</th>
            </tr>
        }
        </tbody>
        </Table>
    </Item>
}

function PreferredPie({ stats, title} : {
    stats: IPreferredLanguageCount,
    title?: string,
}) {
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item>
        <Doughnut
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
                    title: {
                        ...CHART_TITLE,
                        text: title,
                    },
                },
            }} 
            data={{
                labels: items.map(([k,v]) => k || undefined),
                datasets: [
                    {
                    data: items.map(([k,v])=>v),
                // backgroundColor: 'orange',
                    },
                ],
            }} 
        />
    </Item>
}

function PreferredTable({ stats, title} : {
    stats: IPreferredLanguageCount,
    title?: string,
}) {
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item title={title}>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>conteggio</th>
                    <th>percentuale</th>
                </tr>
            </thead>
            <tbody>
                {items.map(([k,v]) => 
                    <tr key={k}>
                        <th>{k || 'non specificato'}</th>
                        <td>{v}</td>
                        <td>{Math.round(v*100/total)}%</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Item>
}

function ReportChart({ question, item } : {
        question: IQuestionStat,
        item: IReportElement
    }) {
    assert(item.element === 'chart')
    switch(question.type) {
        case 'choose-language': 
            switch (item.variant) {
                case undefined:
                case 'chart':
                    return <Item>
                        <GraphChooseLanguageQuestion item={item} stat={question} count={item?.count || "questions" } />
                        <TableChooseLanguageQuestion stat={question} count={item?.count || "questions" }/>
                    </Item>
                case 'count':
                    return <Item small={true}>
                            <GraphChooseLanguageQuestionCounts item={item} stat={question} />
                    </Item>
            }
        case 'map-language-to-competence': return <Item>
                <CompetenceLegend />
                    { Object.keys(questionary.languages).map(lang => <div key={lang}>
                            <GraphMapLanguageToCompetenceQuestion 
                                stat={question} 
                                title="Competenze linguistiche autovalutate" 
                                language={lang} />
                            <TableMapLanguageToCompetenceQuestion 
                                stat={question} 
                                language={lang} />
                        </div>)
                    }   
            </Item>
        case 'map-language-to-age': return <Item>
                <GraphMapLanguageToAgeQuestion stat={question} />
            </Item>
        default: return <Item>
            <Error>
            invalid question type {question.type} 
            for report item {item.element}
            </Error>
        </Item>
    }
}

function ReportTable({ question, item} : {
    question: IQuestionStat,
    item: IReportElement
}) {
    assert(item.element === 'table')
    switch(question.type) {
        case 'choose-language': 
            return <Item>
                <TableChooseLanguageQuestion stat={question} count={item?.count || "questions"} />
            </Item>

        case 'map-language-to-competence':
            return <Item>
                <TableMapLanguageToCompetence stat={question} item={item} />
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

function GraphChooseLanguageQuestion({item, stat, count } : {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat,
        count: "answers" | "questions",
    }) {
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    const total = count === 'answers' ? stat.countAnswers : stat.count 
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
                title: {
                    ...CHART_TITLE,
                    text: item.title || stat.question.question.it,
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
            labels: Object.keys(stat.answers).map(id => (id in languages?languages[id]['it']:id)),
            datasets: [
                {
                data: Object.entries(stat.answers).map(([key, val])=> (total ? val / total : 0) ),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

function TableChooseLanguageQuestion({stat, count}: {
    stat: IChooseLanguageQuestionStat,
    count: "answers" | "questions" | "both",
}) {
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>

    return <Table>
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {(id in languages?languages[id]['it']:id)}
                </td>)}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>conteggio</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {val}
                </td>)}
            </tr>
            { (count === 'answers' || count === 'both' ) &&
            <tr>
                <th>{count === 'both' ? "per lingua" : "percentuale" }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    { stat.countAnswers && `${Math.round(val*100/stat.countAnswers)}%` }
                </td>)}
            </tr>
            }
            { (count === 'questions' || count === 'both') &&
            <tr>
                <th>{count === 'both' ? "per persona" : "percentuale" }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.count)}%`}
                </td>)}
            </tr>}
        </tbody>
    </Table>
}

function GraphChooseLanguageQuestionCounts({item,stat}: {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat}) {      
    function nLanguages(count: number) {
        if (count===0) return 'Nessuna lingua'
        if (count===1) return 'Una lingua'
        return `${count} lingue`
    }
    assert(stat.counts)
    assert(item.element === 'chart')
    const data = stat.counts
        .map((v,i)=>[v,i])
        .filter(([v,i])=>v>0)

    const total = data.reduce((acc, [v,i])=>acc+v, 0)

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
                    formatter: (value,context) => `${Math.round(value*100/total)}% ${nLanguages(data[context.dataIndex][1])}`,
                },
                title: {
                    ...CHART_TITLE,
                    text: item.title || stat.question.question.it,
                },
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
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[language]
    const levels = extractLevels(questionary)
    if (!stats) return <div>No stats for language {language}</div>

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
                title: {
                    ...CHART_TITLE,
                    text: `${title || stat.question.question.it} - ${localizedLanguage}`,
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
            labels: levels,
            datasets: Object.entries(stats).map(([competence, x]) => 
                ({
                    data: computeDataset(x),
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
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[language]
    const levels = extractLevels(questionary)
    if (!stats) return <div>No stats for language {language}</div>

    function computeDataset(stat: {[key: string]: number}) {
        const total = Object.values(stat).reduce((sum,x) => sum+x,0)
        if (total === 0) return levels.map(level => 0)
        return levels.map(level => (stat[level] || 0) / total)
    }

    return <Table>
        <thead>
            <tr>
                <th></th>
                {levels.map(level => <th key={level}>{level}</th>)}
            </tr>
        </thead>
        <tbody>
            {
                Object.entries(stats).map(([competence, x]) => 
                    <tr key={competence}>
                        <th>{competence}</th>
                        {computeDataset(x).map((n,i)=>
                            <td key={i}>{Math.round(n*100)}%</td>)}
                    </tr>
                )
            }
        </tbody>
    </Table>
}

function TableMapLanguageToCompetence({stat, item} : {
        stat: IMapLanguageToCompetenceQuestionStat,
        item: IReportTableElement,
    }) {
    const competences = questionary.competences.map(c => c.code)
    return <Item>
        { item.title && <h3 style={htmlTitleStyle}>{item.title}</h3> }
        <Table>
            <thead>
                <tr>
                    <th></th>
                    {competences.map(c => <th key={c}>{c}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    Object.entries(stat.sums).map(([lang, s]) => 
                        <tr key={lang}>
                            <th>{questionary.languages[lang]?.it||lang}</th>
                            {Object.entries(s).map(([c,n])=>
                                <td key={c}>{stat.count?Math.round(100*n/stat.count)/100:"n.a."}</td>)}
                        </tr>
                    )
                }
            </tbody>
        </Table>
        <Radar
          data = {{
            labels: questionary.competences.map(c => c.code),
            datasets: Object.entries(stat.sums).map(([lang, s]) => 
                ({
                    label: lang,
                    data: Object.entries(s).map(([c,n])=> (stat.count?n/stat.count:0)),
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
                  },
            }}
        />
    </Item>
}

function GraphMapLanguageToAgeQuestion({stat} : {
        stat: IMapLanguageToAgeQuestionStat,
    }) {
    const stats = stat.answers
    const ages = questionary.ages.map(x => x.code)
    const languages = Object.keys(questionary.languages)
    const title = "Età di apprendimento lingua"

    Object.keys(stat.answers).forEach(lang => {
        if (!(languages.includes(lang))) {
            languages.push(lang)
        }
    })

    const datasets = ages.map(age => 
        ({
            data: languages.map(lang => (stat.count ? (stats[lang]?.[age] || 0)/stat.count:0)),
            label: age || 'mai',
        }))

    const labels = languages.map(lang => (lang in questionary.languages
        ?questionary.languages[lang]['it']:lang))

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
                title: {
                    ...CHART_TITLE,
                    text: `${title || stat.question.question.it}`,
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
            labels,
            datasets
        }}
    />
}