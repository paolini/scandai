import Head from 'next/head'
import useSWR from 'swr'
import { useState } from 'react'
import { Button } from 'react-bootstrap'

import Header from '../components/Header'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function rehydrate(data) {
  const questions = data.questions

  const subsections = data.subsections.map(ss => ({
    ...ss,
    questions: questions.filter(q => q.code.startsWith(ss.code)),
    section: data.sections.find(s => ss.code.startsWith(s.code)),
  }))

  const sections = data.sections.map(s=>({
    ...s,
    subsections: subsections
      .filter(ss => ss.code.startsWith(s.code)) 
    }))

  console.log(sections)
  console.log(subsections)

  return {
    sections,
    subsections,
    questions,
  }
}

function useQuestions () {
  const { data, error, isLoading } = useSWR(`/api/questions/`, fetcher)
  return {
    data: data ? rehydrate(data.data): null,
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

const ages = [
  { 
    code: '',
    it: 'Mai (non so la lingua)'
  },
  { 
    code: '0-3',
    it: '0-3 anni'
  },
  {
    code: '3-6',
    it: '3-6 anni'
  },
  {
    code: '6-9',
    it: '6-9 anni'
  },
  {
    code: '9-12',
    it: '9-12 anni'
  },
  {
    code: '12-15',
    it: '12-15 anni'
  },
]

function AgeAnswerRow({ code, language, answer, setAnswer }) {
  return <tr key={code}>
    <td>{language.it || language}</td>
    {ages.map(age => <td key={age.code}>
      <input 
        type="radio" 
        name={code} 
        value={age.code} 
        checked={answer[code] === age.code} 
        onChange={() => setAnswer(a => ({
            ...a, 
            [code]: age.code
          }))}
      />
    </td>)}
  </tr>
}

function MapLanguageToAgeAnswer({ answer, setAnswer, extraLanguages }) {
  return <>
    <table>
      <thead>
        <tr>
          <th></th>
          {ages.map(age => <th key={age.code}>{age.it}</th>)}
        </tr>
      </thead>
    {Object.entries(languages_answer).concat(extraLanguages.map(l => [l,l])).map(([code, language]) => 
          <AgeAnswerRow
            key={code}
            code={code}
            language={language}
            answer={answer}
            setAnswer={setAnswer}
          />
          )} 
    </table>
  </>
}

function Answer({ question, answer, setAnswer, extraLanguages }) {
  if (question.type === 'choose language') {
    return <LanguageAnswer answer={answer} setAnswer={setAnswer}/>
  }
  if (question.type === 'map language to age') {
    return <MapLanguageToAgeAnswer answer={answer} setAnswer={setAnswer} extraLanguages={extraLanguages} />
  }
  return <>Unsupported question type: {question.type}</>
}

function Question({ question, answer, setAnswer, extraLanguages }) {
  return <div>
    <b>{question.question.it}</b><br />
    <Answer question={question} answer={answer} setAnswer={setAnswer} extraLanguages={extraLanguages} />
    <br />
  </div>
}

function Subsection({ subsection, answers, setAnswers, extraLanguages }) {
  return <div key={subsection.code}>
    { subsection.title  && <h4>{subsection.title.it}</h4> }
    {
      subsection.questions.map(q => 
        <Question 
          key={q.code} 
          question={q}
          answer={answers[q.code]}
          extraLanguages={extraLanguages}
          setAnswer={(a) => setAnswers(answers => ({
            ...answers, 
            [q.code]: typeof(a) === 'function' 
              ? a(answers[q.code])
              : a
          }))}
        />)
    }
  </div>
}

function computeExtraLanguages(data, answers) {
  let extraLanguages = []
  const languages = Object.keys(languages_answer)
  for (const q of data.questions) {
    if (q.type === 'choose language') {
      for (const l of answers[q.code]) {
        if (!extraLanguages.includes(l) && !languages.includes(l)) {
          extraLanguages.push(l)
        }
     }
    }
  }
  return extraLanguages
}

function Questions() {
  const { data, isLoading, error } = useQuestions()
  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState(null)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>
  if (pageCount >= data.subsections.length) return <div>Done!</div>
  if (answers === null) {
    setAnswers(Object.fromEntries(
      data.questions.map(q => [q.code, []])
      ))
      return <div>Loading...</div>
    }
  const extraLanguages = computeExtraLanguages(data, answers)
  const subsection = data.subsections[pageCount]
  return <div>
      <h3>{subsection.section.title.it}</h3>
      <Subsection 
        key={subsection.code} 
        subsection={subsection}
        answers={answers}
        setAnswers={setAnswers}
        extraLanguages={extraLanguages}
      />
      <br />
      <Button disabled={pageCount<=0} onClick={()=>setPageCount(p => p-1)}>Indietro</Button>
      <span> pagina {pageCount+1} di {data.subsections.length} </span>
      <Button disabled={pageCount>=data.subsections.length-1} onClick={()=>setPageCount(p => p+1)}>Avanti</Button>
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
        <Questions />
      </main>
    </>
  )
}
