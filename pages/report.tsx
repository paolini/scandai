import { useRef } from "react"
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
    Title,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
import { Bar, Doughnut, Radar, } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Table, Button } from 'react-bootstrap'
import { useRouter } from 'next/router'
import ReactToPrint, { useReactToPrint } from 'react-to-print'

import { assert } from '@/lib/assert'
import { useStats } from '@/lib/api'
import { 
    IStats, 
    IChooseLanguageQuestionStat, 
    IMapLanguageToCompetenceQuestionStat, 
    IMapLanguageToAgeQuestionStat,
} from '@/pages/api/stats'
import questionary, { extractLevels, IReportElement } from '@/lib/questionary'
import Page from '@/components/Page'
import Error from '@/components/Error'

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
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    Colors,
)

const titleFont = {
    size: 24,
    // style: 'italic',
    // family: 'Helvetica Neue'
}

const marginTop="1cm"
const marginRight="6cm"
const marginBottom="1cm"
const marginLeft="2cm"

const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};

export default function Report() {
    const router = useRouter()
    const statsQuery = useStats(router.query)
    const form = router.query.form || "full"
    const ref = useRef(null)
    const print = useReactToPrint({
        content: () => ref.current,
    })

    if (Array.isArray(form)) return <Error>too many forms</Error>

    if (statsQuery.isLoading) return <div>Loading...</div>
    if (!statsQuery.data) return <div>Failed to load</div>
    
    const stats = statsQuery.data.data

    if (stats.entriesCount === 0) return <Page>
        <Error>
        Impossibile fare il report: nessun questionario compilato
        </Error>
    </Page>

    return <Page>
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
        case 'title':
            return <h1>{item.title || `Risultati aggregati`}</h1>
        case 'info':
            return <ListClasses stats={stats} />
        case 'chart':
            return <ReportChart stats={stats} item={item} />
        case 'table':
            return <ReportTable stats={stats} item={item} />
    }
}

function CompetenceLegend() {
    const competences = questionary.competences
    return <div>
        <b>Legenda</b>
        <br/>
        <i>abilità:</i>
        <ul>
            {competences.map(c =>
                <li key={c.code}>{c.code}: {c.it}</li>)}                
        </ul>
    </div>
}

function ListClasses({ stats }: {stats: IStats}) {
    return <div>
        <h2>Classi che hanno partecipato</h2>
        <ul>
            { stats.polls.map(c => 
                    <li key={c._id.toString()}>
                        {c.school} {c.class}
                    </li>
                )
            }
        </ul>
        Totale questionari: {stats.entriesCount}
        <br/>
        Numero sondaggi: {stats.polls.length}
    </div>
}

function ReportChart({ stats, item }:{
        stats: IStats,
        item: IReportElement
    }) {
    assert(item.element === 'chart')
    const question = stats.questions[item.question]
    if (!question) return <Error>
        Nessuna risposta per la domanda &lt;{item.question}&gt;
    </Error>
    switch(question.type) {
        case 'choose-language': 
            switch (item.variant) {
                case undefined:
                case 'chart':
                    return <>
                        <div style={{maxWidth:CHART_WIDTH}}>
                            <GraphChooseLanguageQuestion item={item} stat={question} />
                        </div>            
                        <TableChooseLanguageQuestion item={item} stat={question} />
                    </>
                case 'count':
                    return <>
                        <div style={{maxWidth:CHART_WIDTH_SMALL}}>
                            <GraphChooseLanguageQuestionCounts item={item} stat={question} />
                        </div>
                    </>
            }
        case 'map-language-to-competence': return <>
                <CompetenceLegend />
                <div style={{maxWidth:CHART_WIDTH}}>
                    { Object.keys(questionary.languages).map(lang => 
                        <GraphMapLanguageToCompetenceQuestion 
                            key={lang} 
                            stat={question} 
                            title="Competenze linguistiche autovalutate" 
                            language={lang} />)
                    }   
                </div>
            </>
        case 'map-language-to-age': return <>
            <div style={{maxWidth:CHART_WIDTH}}>
                <GraphMapLanguageToAgeQuestion stat={question} />
            </div>
        </>
        default: return <>not implemented {question.type}</>
    }
}

function ReportTable({ item, stats}: {
    stats: IStats,
    item: IReportElement
}) {
    assert(item.element === 'table')
    const question = stats.questions[item.question]
    switch(question.type) {
        case 'map-language-to-competence':
            return <div style={{maxWidth:CHART_WIDTH}}>
                <TableMapLanguageToCompetence stat={question} />
            </div>
        default:
            return <Error>
                invalid question type {question.type} 
                for report item {item.element}
            </Error>
    }
}

function GraphChooseLanguageQuestion({item, stat}
    : {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat}) {
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    return <Bar 
        className='my-2'
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
                    display: true,
                    text: item.title || stat.question.question.it,
                    font: titleFont,
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
                data: Object.entries(stat.answers).map(([key, val])=> (stat.countAnswers ? val / stat.countAnswers : 0) ),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

function TableChooseLanguageQuestion({item,stat}
    : {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat}) {
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
      
    return <Table className="my-2">
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
            <tr>
                <th>per lingua</th>
            {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    { stat.countAnswers && `${Math.round(val*100/stat.countAnswers)}%` }
                </td>)}
            </tr>
            <tr>
                <th>per persona</th>
            {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.count)}%`}
                </td>)}
            </tr>
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
        className="my-2"
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
                    display: true,
                    text: item.title || stat.question.question.it,
                    font: titleFont,
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
        className="my-2"
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
                    display: true,
                    text: `${title || stat.question.question.it} - ${localizedLanguage}`,
                    font: titleFont,
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

function TableMapLanguageToCompetence({stat}
    : {
        stat: IMapLanguageToCompetenceQuestionStat,
    }) {
    const languages = Object.keys(stat.answers)
    const competences = questionary.competences.map(c => c.code)
    return <>
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
                    fill: true,
                }))
            }}
          options = {{
            elements: {
                line: {
                    borderWidth: 3
                }
            }}} 
        />
    </>
}

function GraphMapLanguageToAgeQuestion({stat}
    : {
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
                    display: true,
                    text: `${title || stat.question.question.it}`,
                    font: titleFont,
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