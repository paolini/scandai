import { useState, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import questionsData, { extractQuestions, extractSubsections, extractExtraLanguages } from '@/lib/questions'
import QuestionsSubsection from './QuestionsSubsection'
import { IAnswers } from './Question'
import { useAddMessage } from '@/components/Messages'
import { IGetPoll } from '@/models/Poll'
import { trans } from './Question'

export default function Questions({lang, done, poll } : {
    lang: string,
    done?: () => void,
    poll?: IGetPoll}) {

  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState<IAnswers>({})
  const addMessage = useAddMessage()

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

  async function submit() {
    const pollId = poll?._id || ''
    let res
    try {
      res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          pollId,
        })
      })
      console.log(res)
    } catch (e) {
      console.error(e)
      addMessage('error', "Errore di rete")
    }
    if (res && res.status === 200) {
      if (done) done()
    } else {
      addMessage('error', res?.statusText || 'errore') 
    }
  }
  
  return <div>
      <div style={{position: "relative",float: "right"}}>{poll?.school || ''} {poll?.class || ''} -- versione questionario: {questionsData.version}</div>
      <h3>{trans(subsection.section.title, lang)}</h3>
      <QuestionsSubsection 
        lang={lang}
        key={subsection.code} 
        subsection={subsection}
        answers={answers}
        setAnswers={setAnswers}
        data={questionsData}
        extraLanguages={extraLanguages}
      />
      <br />
      <Button disabled={pageCount<=0} onClick={()=>setPageCount(p => p-1)}>{trans(questionsData.phrases.prevButton, lang)}</Button>
      <span> pagina {pageCount+1} di {subsections.length} </span>
      { pageCount < subsections.length-1 &&
        <Button disabled={pageCount>=subsections.length-1} onClick={()=>setPageCount(p => p+1)}>{trans(questionsData.phrases.nextButton, lang)}</Button>
      }
      {
        pageCount >= subsections.length-1 &&
        <Button onClick={() => submit()}>{trans(questionsData.phrases.sendButton, lang)}</Button>
      }
      { pageCount < subsections.length 
        && <Button className="m-2" disabled={pageCount>=subsections.length-1} onClick={() => setPageCount(subsections.length-1)}>{trans(questionsData.phrases.endButton,lang)}</Button>
      } 
  </div>
}

