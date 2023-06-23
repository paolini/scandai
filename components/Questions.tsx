import { useState, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import questionsData, { extractQuestions, extractSubsections, extractExtraLanguages } from '@/lib/questions'
import QuestionsSubsection from './QuestionsSubsection'
import { IAnswers } from './Question'
import { AddMessageContext } from '@/components/Messages'
import { IClass } from '@/models/Class'

export default function Questions({submit, submitted, myClass } : {
    submit: (answers: IAnswers) => void, 
    submitted: boolean
    myClass: IClass}) {

  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState<IAnswers>({})
  const addMessage = useContext(AddMessageContext)

  const questions = extractQuestions(questionsData)

  function empty_answer(question_type: string) {
    switch(question_type) {
      case 'map-language-to-competence':
        return {}
      case 'map-language-to-age':
        return {}
      case 'choose-language':
        return []
      default:
        assert(false, "unknown question type: "+question_type)
    }
  }

  if (Object.keys(answers).length === 0) {
    setAnswers(Object.fromEntries(
      questions.map(q => [q.code, empty_answer(q.type)])))
    return <div>Loading...</div>
  }
  const extraLanguages = extractExtraLanguages(questions, answers, questionsData.languages)
  const subsections = extractSubsections(questionsData)
  const subsection = subsections[pageCount]
  if (submitted) return <div>{questionsData.submitMessage.it}</div>

  return <div>
      <div style={{position: "relative",float: "right"}}>{myClass.school} {myClass.class} -- versione questionario: {questionsData.version}</div>
      <h3>{subsection.section.title.it}</h3>
      <QuestionsSubsection 
        key={subsection.code} 
        subsection={subsection}
        answers={answers}
        setAnswers={setAnswers}
        data={questionsData}
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
        <Button onClick={() => submit(answers)}>Invia</Button>
      }
      { pageCount < subsections.length 
        && <Button className="m-2" disabled={pageCount>=subsections.length-1} onClick={() => setPageCount(subsections.length-1)}>Fine</Button>
      } 
  </div>
}
