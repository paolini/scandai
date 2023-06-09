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

import { useStats } from '@/lib/api'
import { IStats, IQuestionStat } from '@/pages/api/stats'
import questionsData from '@/lib/questions'

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

    return <div>
        <h1>Risultati aggregati</h1>
        <ListClasses stats={stats} />
        <GraphQuestion stat={questions["1.1.a.1"]} />
        <GraphQuestionCounts stat={questions["1.1.a.1"]} />
        <h3>Competenze linguistiche autovalutate</h3>
        <p><b>Legenda</b>
            <br/>
            <i>abilità:</i>
            <ul>
                {questionsData.competences.map(c =>
                    <li key={c.code}>{c.code}: {c.it}</li>)}                
            </ul>
        </p>
    </div>
}

function ListClasses({ stats }: {stats: IStats}) {
    return <div>
        <h2>Classi che hanno partecipato</h2>
        <div>
            classes={ JSON.stringify(stats.classes) }
        </div>
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

function GraphQuestion({stat}: {stat: IQuestionStat}) {
    return <div style={{maxWidth:1000}}>
        <GraphChooseLanguageQuestion stat={stat} />
    </div>
}

function GraphQuestionCounts({stat}: {stat: IQuestionStat}) {
    return <div style={{maxWidth:640}}>
        <GraphChooseLanguageQuestionCounts stat={stat} />
    </div>
}

function GraphChooseLanguageQuestion({stat}: {stat: IQuestionStat}) {
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

function GraphChooseLanguageQuestionCounts({stat}: {stat: IQuestionStat}) {      
    function nLanguages(count: number) {
        if (count===0) return 'Nessuna lingua'
        if (count===1) return 'Una lingua'
        return `${count} lingue`
    }

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
