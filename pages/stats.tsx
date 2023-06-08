import { Types } from 'mongoose'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from "react-chartjs-2"

import { useClasses, useEntries, useStats } from '@/lib/api'
import { IEntry } from '@/models/Entry'
import { IClass } from '@/models/Class'
import { IStats, IQuestionStat } from '@/pages/api/stats'
import questionsData, { extractQuestions, IQuestion } from '@/lib/questions'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
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
    </div>
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

function GraphQuestion({stat}: {stat: IQuestionStat}) {
    return <div>
        title: {stat.question.question.it}<br />
        code: {stat.question.code}
        type: {stat.question.type}
        <GraphChooseLanguageQuestion stat={stat} />
    </div>
}

function GraphChooseLanguageQuestion({stat}: {stat: IQuestionStat}) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
          title: {
            display: true,
            text: 'Chart.js Bar Chart',
        },
        },
    }

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    
    const data = {
        labels,
        datasets: [
          {
            data: [1,4,6,3,2,3,6,7,4,3,4,1],
            backgroundColor: 'orange',
          },
        ],
      };
      
      return <>
        <pre>
            {JSON.stringify(stat)}
        </pre>
        <Bar options={options} data={data} />
    </>
}

