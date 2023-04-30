import Head from 'next/head'
import useSWR from 'swr'
import { useState } from 'react'
import { Button } from 'react-bootstrap'

import Header from '../components/Header'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function useQuestions () {
  const { data, error, isLoading } = useSWR(`/api/questions/`, fetcher)
 
  return {
    data: data?.data,
    isLoading,
    error
  }
}

const languages_answer = {
  'it': {
    'it': 'Italiano',
  },
  'fu': {
    'it': 'Friulano (o varianti)',
  },
  'de': {
    'it': 'Tedesco',
  },
  'sl': {
    'it': 'Sloveno',
  },
}

const Checkbox = ({ name, label, selected, setSelected }) => (
  <div className="form-check">
    <label>
      <input
        type="checkbox"
        name={name || label}
        checked={selected}
        onChange={setSelected ? evt=>setSelected(evt.target.checked) : null}
        className="form-check-input"
      />
      {label}
    </label>
  </div>
)

function LanguageCheckbox({ name, label, answer, setAnswer }) {
  return <Checkbox
    name={name}
    label={label} 
    selected={answer.includes(name)}
    setSelected={(selected) => {
      if (selected && !answer.includes(name)) {
        setAnswer(a => [...a, name])
      }
      if (!selected && answer.includes(name)) {
        setAnswer(a => a.filter(l => l !== name))
      }
    }}
  />
}

function OtherLanguage({addLanguage}) {
  const [other, setOther] = useState("")
  return <>
    Altra lingua: <input value={other} onChange={(evt)=>setOther(evt.target.value)}/>
    {other && <Button onClick={()=>{
      addLanguage(other)
      setOther("")
    }}>+</Button>}
  </>
}

function LanguageAnswer({answer, setAnswer}) {
  const other_answers = answer.filter(a => !Object.keys(languages_answer).includes(a))
  return <>{[
    ...Object.entries(languages_answer).map(([code, data]) => [code, data.it]),
    ...other_answers.map(a => [a, a])
    ].map(([code, language]) => 
          <LanguageCheckbox 
            key={code} 
            name={code}
            label={language}
            answer={answer}
            setAnswer={setAnswer}
            />
        )} 
    <OtherLanguage addLanguage={(language) => setAnswer(a => [...a, language])}/> 
  </>
}

function Question({ question }) {
  const [answer, setAnswer] = useState([])
  return <div>
    <b>{question.question.it}</b><br />
    <LanguageAnswer answer={answer} setAnswer={setAnswer}/>
    <br />
  </div>
}

function useEngine() {
  let [state, setState] = useState({})

  function answers(q) {
    if (state[q]) return state[q]
    return []
  }

  return {
    question: q => ({
      ...q,
      answers: answers(q),
    })
  }
}

function Questions() {
  const { data, isLoading, error } = useQuestions()
  const engine = useEngine()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>
  return <div>
    {data.questions.map(q => <Question key={q.code} question={engine.question(q)}/>)}
  </div>
}

export default function Home() {
  return (
    <>
      <Head>
        <title>fotografia linguistica</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <h4>domande</h4>
        <Questions />
      </main>
    </>
  )
}
