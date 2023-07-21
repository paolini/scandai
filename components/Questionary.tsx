import { useState, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import questionary, { extractQuestionCodes, extractSubsections, extractExtraLanguages, getPhrase } from '@/lib/questionary'
import QuestionsSubsection from './QuestionsSubsection'
import { IAnswers } from './Question'
import { useAddMessage } from '@/components/Messages'
import { IGetPoll } from '@/models/Poll'
import { trans } from './Question'

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
  const subsections = extractSubsections(questionary)
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
      <div style={{position: "relative",float: "right"}}>{poll?.school || ''} {poll?.class || ''} -- versione questionario: {questionary.version}</div>
      <h3>{trans(subsection.section.title, lang)}</h3>
      <QuestionsSubsection 
        lang={lang}
        key={subsection.code} 
        subsection={subsection}
        answers={answers}
        setAnswers={setAnswers}
        questionary={questionary}
        extraLanguages={extraLanguages}
      />
      <br />
      <Button disabled={pageCount<=0} onClick={()=>setPageCount(p => p-1)}>
        {getPhrase("prevButton", lang)}
      </Button>
      <span> {pageCount+1} / {subsections.length} </span>
      { pageCount < subsections.length-1 &&
        <Button disabled={pageCount>=subsections.length-1} onClick={()=>setPageCount(p => p+1)}>{getPhrase("nextButton", lang)}</Button>
      }
      {
        pageCount >= subsections.length-1 &&
        <Button onClick={() => submit()}>{getPhrase("sendButton", lang)}</Button>
      }
      { pageCount < subsections.length 
        && <Button className="m-2" disabled={pageCount>=subsections.length-1} onClick={() => setPageCount(subsections.length-1)}>{getPhrase("endButton", lang)}</Button>
      } 
  </div>
}

