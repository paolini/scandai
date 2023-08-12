import { useState, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import questionary, { extractQuestionCodes, extractPages, extractExtraLanguages, getPhrase } from '@/lib/questionary'
import QuestionaryPage from './QuestionaryPage'
import { IAnswers } from './Question'
import { useAddMessage } from '@/components/Messages'
import { IGetPoll } from '@/models/Poll'

export default function Questionary({lang, done, poll, form } : {
    lang: string,
    form: string,
    done?: () => void,
    poll?: IGetPoll}) {

  const [pageCount, setPageCount] = useState(0)
  const [answers, setAnswers] = useState<IAnswers>({})
  const addMessage = useAddMessage()

  const questionCodes = extractQuestionCodes(form)

  function empty_answer(code: string) {
    const question = questionary.questions[code]
    assert(question, `question not found with code ${code}`)
    switch(question.type) {
      case 'map-language-to-competence':
        return {}
      case 'map-language-to-age':
        return {}
      case 'choose-language':
        return []
      default:
        assert(false, "unknown question type: "+question.type)
    }
  }

  if (Object.keys(answers).length === 0) {
    console.log(`initializing answers: ${JSON.stringify(questionCodes)}`)
    setAnswers(Object.fromEntries(
      questionCodes.map(code => [code, empty_answer(code)])))
    return <div>Loading...</div>
  }

  const extraLanguages = extractExtraLanguages(questionCodes, answers, questionary.languages)
  const pages = extractPages(form)
  const page = pages[pageCount]
  const pageCompleted = page.every(item => {
    if (item.element === 'questions') {
      return item.questions.every(code => {
        const answer = answers[code]
        const question = questionary.questions[code]
        assert(question, `question not found with code ${code}`)
        if (!question.compulsory) return true
        switch(question.type) {
          case 'map-language-to-competence':
            return Object.keys(answer).length>0
          case 'map-language-to-age':
            return Object.keys(answer).length>0
          case 'choose-language':
            assert(Array.isArray(answer))
            return answer.length>0
          default:
            assert(false, "unknown question type: "+question.type)
        }
      })
    } else {  
      return true
    }
  })

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
          lang,
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
      <div style={{position: "relative",float: "right"}}>{poll?.school || ''} {poll?.class || ''} -- versione questionario: {questionary.version}</div>
      <QuestionaryPage 
        lang={lang}
        key={pageCount} 
        page={page}
        answers={answers}
        setAnswers={setAnswers}
        questionary={questionary}
        extraLanguages={extraLanguages}
      />
      <br />
      {!pageCompleted && <p>{getPhrase("compulsoryExplanation", lang)}</p>}
      <Button disabled={pageCount<=0} onClick={()=>setPageCount(p => p-1)}>
        {getPhrase("prevButton", lang)}
      </Button>
      <span> {pageCount+1} / {pages.length} </span>
      { pageCount < pages.length-1 &&
        <Button disabled={!pageCompleted || pageCount>=pages.length-1} onClick={()=>setPageCount(p => p+1)}>{getPhrase("nextButton", lang)}</Button>
      }
      {
        pageCount >= pages.length-1 &&
        <Button disabled={!pageCompleted} onClick={() => submit()}>{getPhrase("sendButton", lang)}</Button>
      }
      { pageCount < pages.length && false
        && <Button className="m-2" disabled={pageCount>=pages.length-1} onClick={() => setPageCount(pages.length-1)}>{getPhrase("endButton", lang)}</Button>
      } 
  </div>
}

