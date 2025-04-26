import { IFormElement, IQuestionary } from '@/lib/questionary'
import Question, { IAnswers } from './Question'
import { Answer } from '@/lib/types'
import { trans } from '@/lib/questionary'
import { State, value, update } from '@/lib/State'

export default function QuestionaryPage({ lang, page, answersState, questionary, extraLanguages }:{ 
  lang: string, 
  page: IFormElement[], 
  answersState: State<IAnswers>,
  questionary: IQuestionary, 
  extraLanguages: string[]}) {    
  return <div>
    { page.map((item,i) => <QuestionaryFormItem key={i} item={item} lang={lang} questionary={questionary} answersState={answersState} extraLanguages={extraLanguages}/>) }
  </div>
}

function QuestionaryFormItem({ item, lang, questionary, answersState, extraLanguages } : { 
    item: IFormElement,
    lang: string, 
    questionary: IQuestionary,
    answersState: State<IAnswers>,
    extraLanguages: string[],
  }) {
  switch (item.element) {
    case 'questions': return <>
      { item.questions
      .map(code => {
        const question = questionary.questions[code]
        const answer_code:string = question.code || code
      return <Question 
        lang={lang}
        key={code} 
        question={question}
        answer={value(answersState)[answer_code]}
        questionary={questionary}
        extraLanguages={extraLanguages}
        setAnswer={(a: Answer|((_:Answer)=> Answer)) => update(answersState,
          (answers: IAnswers) => ({
            ...answers, 
            [answer_code]: typeof(a) === 'function' 
              ? a(answers[answer_code])
              : a
            })
        )}
      />}) } </>
    case 'section': return <h3>
        {trans(item.title, lang)}
      </h3>
    case 'title': return <h4>
        {trans(item.title, lang)}
      </h4>
    default: return <div>Unexpected element: {item.element}</div>
  }
}