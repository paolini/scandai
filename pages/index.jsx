import Head from 'next/head'
import useSWR from 'swr'
import { useState } from 'react'

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

const languages = {
  'it': {
    'it': 'italiano',
  },
  'fu': {
    'it': 'friulano',
  },
  'de': {
    'it': 'tedesco',
  },
}

function LanguageChoice() {
  return <select>
    { Object.entries(languages).map(([code, data]) => <option key={code} value={code}>
      { data.it }
    </option>)}
  </select>
}

function Question({ question, engine }) {
  return <div>
    <p><b>{question.question.it}</b><br />
    <LanguageChoice />
    </p>
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
          integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
          crossorigin="anonymous"
        />      
      </Head>
      <Header />
      <main>
        <h4>domande</h4>
        <Questions />
      </main>
    </>
  )
}
