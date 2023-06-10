import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
import { Bar, Doughnut } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'

import { assert } from '@/lib/assert'
import { useStats } from '@/lib/api'
import { IStats, IQuestionStat, IChooseLanguageQuestionStat, IMapLanguageToCompetenceQuestionStat } from '@/pages/api/stats'
import questionsData, { extractLevels } from '@/lib/questions'
import Header from '@/components/Header'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    Colors,
)

export default function Stats() {
    const statsQuery = useStats()

    if (statsQuery.isLoading) return <div>Loading...</div>
    if (!statsQuery.data) return <div>Failed to load</div>

    const stats = statsQuery.data.data

    const questions: {[key:string]: IQuestionStat} 
        = Object.fromEntries(stats.questions.map(
            q => [q.question.code, q]))

    return <>
        <Header />
        <h1>Risultati aggregati</h1>
        <ListClasses stats={stats} />
        <GraphQuestion questions={questions} code="1.1.a.1" />
        <GraphQuestionCounts questions={questions} code="1.1.a.1" />
        <h3>Competenze linguistiche autovalutate</h3>
        <p><b>Legenda</b>
            <br/>
            <i>abilità:</i>
            <ul>
                {questionsData.competences.map(c =>
                    <li key={c.code}>{c.code}: {c.it}</li>)}                
            </ul>
        </p>
        <GraphQuestion questions={questions} code="2.2.1" />
    </>
}

function ListClasses({ stats }: {stats: IStats}) {
    return <div>
        <h2>Classi che hanno partecipato</h2>
        <ul>
            { stats.classes.map(c => 
                    <li key={c._id.toString()}>
                        {c.school} {c.class}
                    </li>
                )
            }
        </ul>
        Totale questionari: {stats.entriesCount}
    </div>
}

function GraphQuestion({questions, code}
    : {questions: {[key:string]: IQuestionStat},code: string}) {
    if (!(code in questions)) return <div>Unknown question code: {code}</div>
    const stat = questions[code]
    if (stat.type==='choose-language') {
        return <div style={{maxWidth:1000}}>
            <GraphChooseLanguageQuestion stat={stat} />
        </div>
    }
    if (stat.type==='map-language-to-competence') {
        return <div style={{maxWidth:1000}}>
            <GraphMapLanguageToCompetenceQuestion stat={stat} title="Competenze linguistiche autovalutate" language="it"/>
            <GraphMapLanguageToCompetenceQuestion stat={stat} title="Competenze linguistiche autovalutate" language="fu"/>
            <GraphMapLanguageToCompetenceQuestion stat={stat} title="Competenze linguistiche autovalutate" language="de"/>
            <GraphMapLanguageToCompetenceQuestion stat={stat} title="Competenze linguistiche autovalutate" language="sl"/>
        </div>
    }
    return <div>Unknown question type {stat.question.type}</div>
}

function GraphQuestionCounts({questions, code}
    : {questions: {[key:string]:IQuestionStat},code: string}) {
    if (!(code in questions)) return <div>Unknown question code: {code}</div>
    const stat = questions[code]
    if (stat.type == 'choose-language') {
        return <div style={{maxWidth:640}}>
            <GraphChooseLanguageQuestionCounts stat={stat} />
        </div>
    }
    return <div>Invalid question type: {stat.type}</div>
}

function GraphChooseLanguageQuestion({stat}
    : {stat: IChooseLanguageQuestionStat}) {
    const languages = questionsData.languages
    if (!stat.answers) return <div>invalid answers</div>
      
    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: value => `${Math.round(value*100)}%`
                },
                title: {
                    display: true,
                    text: stat.question.question.it,
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
                data: Object.entries(stat.answers).map(([key, val])=>val),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

function GraphChooseLanguageQuestionCounts({stat}: {stat: IChooseLanguageQuestionStat}) {      
    function nLanguages(count: number) {
        if (count===0) return 'Nessuna lingua'
        if (count===1) return 'Una lingua'
        return `${count} lingue`
    }
    assert(stat.counts)
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
                    display: true,
                    text: stat.question.question.it,
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
    const localizedLanguage = questionsData.languages[language].it || language
    const stats = stat.answers[language]
    const levels = extractLevels(questionsData)
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
                    align: 'end',
                    formatter: value => `${Math.round(value*100)}%`
                },
                title: {
                    display: true,
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