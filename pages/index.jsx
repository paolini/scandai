import Head from 'next/head'
import useSWR from 'swr'

import Header from '../components/Header'

const fetcher = (...args) => fetch(...args).then(res => res.json())



function useQuestions () {
  const { data, error, isLoading } = useSWR(`/api/questions/`, fetcher)
 
  return {
    questions: data?.data,
    isLoading,
    error
  }
}

function Question({ question }) {
  return <div>
    <p><b>[{question.title}]</b>
    {} {question.content}</p>
    <ul>
    {question.options.map(option => {
      const id = `${question.id}-${option.value}`
      return <li>
        <input type="radio" id={id} name={question._id} value={option.value} />
        <label for={id}>{option.content}</label>
      </li>})}
    </ul>
  </div>
}

function Questions() {
  const { questions, isLoading, error } = useQuestions()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load</div>
  return <div>
    {questions.map(question => <Question key={question.id} question={question} />)}
  </div>
}

export default function Home() {
  return (
    <>
      <Head>
        <title>respont</title>
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
