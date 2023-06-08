import { SetStateAction, Dispatch } from 'react'

import { ISubsection, IQuestions } from '@/pages/api/questions'
import Question, {IAnswer, IAnswers} from './Question'


export default function QuestionsSubsection({ subsection, answers, setAnswers, data, extraLanguages }
  :{subsection: ISubsection, answers: IAnswers, setAnswers: Dispatch<SetStateAction<IAnswers>>, data: IQuestions, extraLanguages: string[]}) {
  return <div key={subsection.code}>
    { subsection.title  && <h4>{subsection.title.it}</h4> }
    {
      subsection.questions.map(q => 
        <Question 
          key={q.code} 
          question={q}
          answer={answers[q.code]}
          data={data}
          extraLanguages={extraLanguages}
          setAnswer={(a: IAnswer|((_:IAnswer)=> IAnswer)) => setAnswers(
            (answers: IAnswers) => ({
              ...answers, 
              [q.code]: typeof(a) === 'function' 
                ? a(answers[q.code])
                : a
              })
          )}
        />)
    }
  </div>
}
