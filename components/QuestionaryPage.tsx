import { IFormElement, IQuestionary } from '@/lib/questionary'
import Question, { IAnswers } from './Question'
import { Answer } from '@/models/Entry'
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
      { item.questions.map(code => 
      <Question 
        lang={lang}
        key={code} 
        question={questionary.questions[code]}
        answer={value(answersState)[code]}
        questionary={questionary}
        extraLanguages={extraLanguages}
        setAnswer={(a: Answer|((_:Answer)=> Answer)) => update(answersState,
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