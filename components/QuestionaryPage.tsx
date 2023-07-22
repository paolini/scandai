import { SetStateAction, Dispatch } from 'react'

import { IFormElement, IQuestionary } from '@/lib/questionary'
import Question, { IAnswers } from './Question'
import { Answer } from '@/models/Entry'
import { trans } from '@/lib/questionary'

export default function QuestionaryPage({ lang, page, answers, setAnswers, questionary, extraLanguages }
  :{ lang: string, page: IFormElement[], answers: IAnswers, setAnswers: Dispatch<SetStateAction<IAnswers>>, questionary: IQuestionary, extraLanguages: string[]}) {
  return <div>
    { page.map((item,i) => <QuestionaryFormItem key={i} item={item} lang={lang} questionary={questionary} answers={answers} setAnswers={setAnswers} extraLanguages={extraLanguages}/>) }
  </div>
}

function QuestionaryFormItem({ item, lang, questionary, answers, setAnswers, extraLanguages } : { 
    item: IFormElement,
    lang: string, 
    questionary: IQuestionary,
    answers: IAnswers,
    setAnswers: Dispatch<SetStateAction<IAnswers>>,
    extraLanguages: string[],
  }) {
  switch (item.element) {
    case 'questions': return <>
      { item.questions.map(code => 
      <Question 
        lang={lang}
        key={code} 
        question={questionary.questions[code]}
        answer={answers[code]}
        questionary={questionary}
        extraLanguages={extraLanguages}
        setAnswer={(a: Answer|((_:Answer)=> Answer)) => setAnswers(
          (answers: IAnswers) => ({
            ...answers, 
            [code]: typeof(a) === 'function' 
              ? a(answers[code])
              : a
            })
        )}
      />) } </>
    case 'section': return <h3>
        {trans(item.title, lang)}
      </h3>
    case 'title': return <h4>
        {trans(item.title, lang)}
      </h4>
    default: return <div>Unexpected element: {item.element}</div>
  }
}