import LanguageAnswer from './LanguageAnswer'
import LanguageToAgeAnswer from './LanguageToAgeAnswer'
import LanguageToCompetenceAnswer from './LanguageToCompetenceAnswer'
import { IQuestion, IQuestionary } from '@/lib/questionary' 
import { Answer, QuestionCode } from '@/models/Entry'
import { trans } from '@/lib/questionary'

export interface IAnswers {
  [key: QuestionCode]: Answer,
}

function Answer({ lang, question, answer, setAnswer, questionary, extraLanguages }
  : { lang: string, question: IQuestion, answer: any, setAnswer: any, questionary: IQuestionary, extraLanguages: string[] }) {
  if (question.type === 'choose-language') {
    return <LanguageAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={{...questionary.languagesExtended,...Object.fromEntries(extraLanguages.map(l => [l,l]))}}
      />
  }
  if (question.type === 'map-language-to-age') {
    return <LanguageToAgeAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={questionary.languagesExtended} 
      ages={questionary.ages} 
      extraLanguages={extraLanguages} />
  }
  if (question.type === 'map-language-to-competence') {
    return <LanguageToCompetenceAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={questionary.languagesExtended} 
      competences={questionary.competences} 
      competenceValues={questionary.competenceValues} 
      extraLanguages={extraLanguages} />
  }
  return <div>
    Unknown question type: {question.type}
  </div>
}

export default function Question({ lang, question, answer, setAnswer, questionary, extraLanguages }: 
  { lang: string, question: IQuestion, answer: any, setAnswer: any, questionary: IQuestionary, extraLanguages: string[] }) {
  return <div>
    <b>{trans(question.question,lang)}</b><br />
    <Answer lang={lang} question={question} answer={answer} setAnswer={setAnswer} questionary={questionary} extraLanguages={extraLanguages} />
    <br />
  </div>
}
