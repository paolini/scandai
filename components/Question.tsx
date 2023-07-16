import LanguageAnswer from './LanguageAnswer'
import LanguageToAgeAnswer from './LanguageToAgeAnswer'
import LanguageToCompetenceAnswer from './LanguageToCompetenceAnswer'
import { IQuestion, IQuestions } from '@/lib/questions' 
import { Answer, QuestionCode } from '@/models/Entry'

export interface IAnswers {
  [key: QuestionCode]: Answer,
}

function Answer({ lang, question, answer, setAnswer, data, extraLanguages }
  : { lang: string, question: IQuestion, answer: any, setAnswer: any, data: IQuestions, extraLanguages: string[] }) {
  if (question.type === 'choose-language') {
    return <LanguageAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={{...data.languages,...Object.fromEntries(extraLanguages.map(l => [l,l]))}}
      />
  }
  if (question.type === 'map-language-to-age') {
    return <LanguageToAgeAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={data.languages} 
      ages={data.ages} 
      extraLanguages={extraLanguages} />
  }
  if (question.type === 'map-language-to-competence') {
    return <LanguageToCompetenceAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={data.languages} 
      competences={data.competences} 
      competenceValues={data.competenceValues} 
      extraLanguages={extraLanguages} />
  }
  return <div>
    Unknown question type: {question.type}
  </div>
}

export default function Question({ lang, question, answer, setAnswer, data, extraLanguages }: 
  { lang: string, question: IQuestion, answer: any, setAnswer: any, data: IQuestions, extraLanguages: string[] }) {
  return <div>
    <b>{trans(question.question,lang)}</b><br />
    <Answer lang={lang} question={question} answer={answer} setAnswer={setAnswer} data={data} extraLanguages={extraLanguages} />
    <br />
  </div>
}

export function trans(s: {[key:string]: string}, lang: string) {
  return s[lang] || `${lang}: ${s.it||'???'}`
}