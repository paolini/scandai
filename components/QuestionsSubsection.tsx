import { SetStateAction, Dispatch } from 'react'

import { ISubsection, IQuestionary } from '@/lib/questionary'
import Question, { IAnswers } from './Question'
import { Answer } from '@/models/Entry'
import { trans } from './Question'

import questionData from '@/lib/questionary'

export default function QuestionsSubsection({ lang, subsection, answers, setAnswers, questionary, extraLanguages }
  :{ lang: string, subsection: ISubsection, answers: IAnswers, setAnswers: Dispatch<SetStateAction<IAnswers>>, questionary: IQuestionary, extraLanguages: string[]}) {
  return <div key={subsection.code}>
    { subsection.title  && <h4>{trans(subsection.title, lang)}</h4> }
    {
      subsection.questions.map(code => 
        <Question 
          lang={lang}
          key={code} 
          question={questionData.questions[code]}
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
        />)
    }
  </div>
}
