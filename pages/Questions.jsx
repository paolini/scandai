import useSWR from 'swr'
import { useState } from 'react'
import { Button } from 'react-bootstrap'

import QuestionsSubsection from '../components/QuestionsSubsection'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function useQuestions () {
  const { data, error, isLoading } = useSWR(`/api/questions/`, fetcher)
  return {
    data: data?.data,
    isLoading,
    error
  }
}

function extractExtraLanguages(questions, answers, languages) {
  console.log(`extractExtraLanguages: ${JSON.stringify({answers})}`)
  let extraLanguages = []
  const languageCodes = Object.keys(languages)
  for (const q of questions) {
    if (q.type === 'choose-language') {
      for (const l of answers[q.code]) {
        if (!extraLanguages.includes(l) && !languageCodes.includes(l)) {
          extraLanguages.push(l)
        }
     }
    }
  }
  return extraLanguages
}

function extractQuestions(data) {
  let questions = []
  for (const s of data.sections) {
    for (const ss of s.subsections) {
      for (const q of ss.questions) {
        questions.push(q)
      }
    }
  }
  return questions
}

function extractSubsections(data) {
  let subsections = []
  for (const s of data.sections) {
    for (const ss of s.subsections) {
      subsections.push({
        ...ss,
        section: s
      })
    }
  }
  return subsections
}

export default function Questions() {
  const { data, isLoading, error } = useQuestions()
  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState(null)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>
  const questions = extractQuestions(data)
  if (answers === null) {
    setAnswers(Object.fromEntries(
      questions.map(q => [q.code, []])
      ))
      return <div>Loading...</div>
    }
  const extraLanguages = extractExtraLanguages(questions, answers, data.languages)
  const subsections = extractSubsections(data)
  const subsection = subsections[pageCount]
  console.log(`extraLanguages: ${JSON.stringify(extraLanguages)}`)
  if (pageCount >= subsections.length) return <div>Done!</div>
  return <div>
      <h3>{subsection.section.title.it}</h3>
      <QuestionsSubsection 
        key={subsection.code} 
        subsection={subsection}
        answers={answers}
        setAnswers={setAnswers}
        data={data}
        extraLanguages={extraLanguages}
      />
      <br />
      <Button disabled={pageCount<=0} onClick={()=>setPageCount(p => p-1)}>Indietro</Button>
      <span> pagina {pageCount+1} di {subsections.length} </span>
      <Button disabled={pageCount>=subsections.length-1} onClick={()=>setPageCount(p => p+1)}>Avanti</Button>
      <Button className="m-2" disabled={pageCount>=subsections.length-1} onClick={() => setPageCount(subsections.length-1)}>Fine</Button>
  </div>
}
