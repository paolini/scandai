import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import questionary, { extractQuestionCodes, extractPages, extractExtraLanguages, getPhrase } from '@/lib/questionary'
import QuestionaryPage from './QuestionaryPage'
import { IAnswers } from './Question'
import { useAddMessage } from '@/components/Messages'
import { IGetPoll } from '@/models/Poll'
import PollSplash from '@/components/PollSplash'
import { State, value, update, set } from '@/lib/State'

export default function Questionary({langState, poll, form, answersState, mutate } : {
    langState: State<string>,
    form: string,
    poll: IGetPoll,
    answersState: State<IAnswers>,
    mutate: () => void,
  }) {

  const [pageCount, setPageCount] = useState(-1)
  const addMessage = useAddMessage()
  const answers = answersState[0]
  const lang = langState[0]

  if (pageCount === -1) return <PollSplash poll={poll} mutate={mutate} langState={langState} start={() => setPageCount(0)} />
  
  if (pageCount === -2) return <Completed lang={value(langState)} />

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
    set(answersState, Object.fromEntries(
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
      setPageCount(-2)
    } else {
      addMessage('error', res?.statusText || 'errore') 
    }
  }
  
  return <div>
      <div style={{position: "relative",float: "right"}}>{poll?.school?.name || ''} {poll?.school?.city || ''} {poll?.class || ''} -- versione questionario: {questionary.version}</div>
      <QuestionaryPage 
        lang={lang}
        key={pageCount} 
        page={page}
        answersState={answersState}
        questionary={questionary}
        extraLanguages={extraLanguages}
      />
      <br />
      {!pageCompleted && <p>{getPhrase("compulsoryExplanation", lang)}</p>}
      
      <Button disabled={false} onClick={()=>setPageCount(p => p-1)}>
        {getPhrase("prevButton", lang)}
      </Button>
      <span> {pageCount+1} / {pages.length} </span>
      { pageCount < pages.length-1 &&
        <Button disabled={!pageCompleted || pageCount>=pages.length-1} onClick={()=>setPageCount(p => p+1)}>
          {getPhrase("nextButton", lang)}
        </Button>
      }
      {
        pageCount >= pages.length-1 &&
        <Button disabled={!pageCompleted} variant="danger" onClick={submit}>
          {getPhrase("sendButton", lang)}
        </Button>
      }
      { pageCount < pages.length && false
        && <Button className="m-2" variant="warning" disabled={pageCount>=pages.length-1} onClick={() => setPageCount(pages.length-1)}>
          {getPhrase("endButton", lang)}
          </Button>
      } 
  </div>
}

function Completed({lang}:{
  lang: string,
}) {
  return <Card>
      <Card.Body>
          <Card.Title>{getPhrase('thanksTitle', lang)}</Card.Title>
          <Card.Text>
              <p>{getPhrase('thanks', lang)}</p>
              <p>{getPhrase('closeThisPage', lang)}</p>
          </Card.Text>
      </Card.Body> 
      {/*   
      <Card.Footer>
          <Button variant="danger" onClick={() => set(state, 'init')}>compila un altro questionario</Button>
      </Card.Footer>
      */}
  </Card>
}