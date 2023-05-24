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

function Messages({messages}) {
  if (messages.length === 0) return null
  return <div>
    {messages.map((m, i) => <div key={i} className="alert alert-danger" role="alert">{m}</div>)}
  </div>
}

export default function Questions() {
  const { data, isLoading, error } = useQuestions()
  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState(null)
  const [messages, setMessages] = useState([])
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>
  const questions = extractQuestions(data)
  if (answers === null) {
    setAnswers(Object.fromEntries(
      questions.map(q => [q.code, 
        [q.type === 'map-language-to-competence' ? {} : []]
      ])))
      return <div>Loading...</div>
  }
  const extraLanguages = extractExtraLanguages(questions, answers, data.languages)
  const subsections = extractSubsections(data)
  const subsection = subsections[pageCount]
  if (pageCount >= subsections.length) return <div>{data.submitMessage.it}</div>

  async function submit() {
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(answers)
      })
      console.log(res)
      if (res.status === 200) {
        setPageCount(subsections.length)
      } else {
        setMessages(messages => [...messages, res.statusText])
      }
    } catch (e) {
      console.error(e)
    }
  }

  return <div>
      <Messages messages={messages} />
      <div style={{position: "relative",float: "right"}}>versione questionario: {data.version}</div>
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
      { pageCount < subsections.length-1 &&
        <Button disabled={pageCount>=subsections.length-1} onClick={()=>setPageCount(p => p+1)}>Avanti</Button>
      }
      {
        pageCount >= subsections.length-1 &&
        <Button onClick={submit}>Invia</Button>
      }
      { pageCount < subsections.length 
        && <Button className="m-2" disabled={pageCount>=subsections.length-1} onClick={() => setPageCount(subsections.length-1)}>Fine</Button>
      } 

  </div>
}
