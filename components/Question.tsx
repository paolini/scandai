import LanguageAnswer from './LanguageAnswer'
import LanguageToAgeAnswer from './LanguageToAgeAnswer'
import LanguageToCompetenceAnswer from './LanguageToCompetenceAnswer'
import { IQuestion, IQuestions } from '@/lib/questions' 

export interface IAnswer extends Object {}

export interface IAnswers {
  [key: string]: IAnswer,
}

function Answer({ question, answer, setAnswer, data, extraLanguages }
  : { question: IQuestion, answer: any, setAnswer: any, data: IQuestions, extraLanguages: string[] }) {
  if (question.type === 'choose-language') {
    return <LanguageAnswer answer={answer} setAnswer={setAnswer} languages={{...data.languages,...Object.fromEntries(extraLanguages.map(l => [l,l]))}}/>
  }
  if (question.type === 'map-language-to-age') {
    return <LanguageToAgeAnswer answer={answer} setAnswer={setAnswer} languages={data.languages} ages={data.ages} extraLanguages={extraLanguages} />
  }
  if (question.type === 'map-language-to-competence') {
    return <LanguageToCompetenceAnswer answer={answer} setAnswer={setAnswer} languages={data.languages} ages={data.ages} competences={data.competences} competenceValues={data.competenceValues} extraLanguages={extraLanguages} />
  }
  return <div>
    Unknown question type: {question.type}
  </div>
}

export default function Question({ question, answer, setAnswer, data, extraLanguages }: { question: IQuestion, answer: any, setAnswer: any, data: IQuestions, extraLanguages: string[] }) {
  return <div>
    <b>{question.question.it}</b><br />
    <Answer question={question} answer={answer} setAnswer={setAnswer} data={data} extraLanguages={extraLanguages} />
    <br />
  </div>
}
