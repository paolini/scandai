import { Types } from 'mongoose'

import { useClasses, useQuestions, useEntries } from '@/lib/api'
import { IEntry } from '@/models/Entry'
import { IClass } from '@/models/Class'
import { IQuestion } from '@/pages/api/questions'

export default function Stats() {
    const classesQuery = useClasses()
    const questionsQuery = useQuestions()
    const entriesQuery = useEntries()

    if (classesQuery.isLoading || questionsQuery.isLoading || entriesQuery.isLoading) return <div>Loading...</div>
    if (!(classesQuery.data && questionsQuery.data && entriesQuery.data)) return <div>Failed to load</div>

    const questions: {[key:string]: IQuestion} = {}
    console.log('data', JSON.stringify(questionsQuery.data))
    for (const q of questionsQuery.data.data.sections) {
        for (const s of q.subsections) {
            for (const qq of s.questions) {
                questions[qq.code] = qq
            }
        }
    }

    return <div>
        <h1>Risultati aggregati</h1>
        <ListClasses classes={classesQuery.data.data} entries={entriesQuery.data.data} />
        <GraphQuestion entries={entriesQuery.data.data} question={questions["1.1.a.1"]} />
    </div>
}

function ListClasses({classes, entries: entries}: {classes: IClass[], entries: IEntry[]}) {
    let classIds: Types.ObjectId[] = []
    for (const e of entries) {
        if (!classIds.includes(e.classId)) classIds.push(e.classId)
    }
    return <div>
        <h2>Classi che hanno partecipato</h2>
        <ul>
            { classes
                .filter(c => classIds.includes(c._id))
                .map(c => 
                    <li key={c._id.toString()}>
                        {c.school} {c.class}
                    </li>
                )
            }
        </ul>
        Totale questionari: {entries.length}
    </div>
}

function GraphChooseLanguageQuestion({entries, question}: {entries: IEntry[], question: IQuestion}) {
    return <ul>
        { entries.map((e: IEntry) =>
            <li key={e._id.toString()}>
                {JSON.stringify(e.answers[question.code])}
            </li>
        )}
    </ul>
}

function GraphQuestion({entries, question}: {entries: IEntry[], question: IQuestion}) {
    return <div>
        title: {question.question.it}<br />
        code: {question.code}
        type: {question.type}
        <GraphChooseLanguageQuestion entries={entries} question={question} />
    </div>
}