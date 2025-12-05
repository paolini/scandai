import LanguageAnswer from './LanguageAnswer'
import LanguageToAgeAnswer from './LanguageToAgeAnswer'
import LanguageToCompetenceAnswer from './LanguageToCompetenceAnswer'
import ChoiceAnswer from './ChoiceAnswer'
import { IQuestion, IQuestionary, languageNames } from '@/lib/questionary' 
import { Answer, QuestionCode } from '@/lib/types'
import { trans } from '@/lib/questionary'

export interface IAnswers {
  [key: QuestionCode]: Answer,
}

function AnswerPage({ lang, question, answer, setAnswer, questionary, extraLanguages }
  : { lang: string, question: IQuestion, answer: any, setAnswer: any, questionary: IQuestionary, extraLanguages: string[] }) {
  if (question.type === 'choose-language') {
    const choices = question.choices
    const default_languages = choices === undefined 
      ? questionary.languagesExtended
      : Object.fromEntries(choices.map(c => [c.value, c.label]))
    const languages = {
      ...default_languages,
      ...Object.fromEntries(extraLanguages
        .filter(l => !default_languages[l])
        .map(l => [l,languageNames[l] || l]))}
    return <LanguageAnswer 
      lang={lang}
      answer={answer} 
      setAnswer={setAnswer} 
      languages={languages}
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
  if (question.type === 'choice') {
    return <ChoiceAnswer
      lang={lang}
      answer={answer}
      setAnswer={setAnswer}
      choices={question.choices || []}
    />
  }
  return <div>
    Unknown question type: {question.type}
  </div>
}

export default function Question({ lang, question, answer, setAnswer, questionary, extraLanguages, showCode = false }: 
  { lang: string, question: IQuestion & { questionCode?: string }, answer: any, setAnswer: any, questionary: IQuestionary, extraLanguages: string[], showCode?: boolean }) {
  return <div className="my-2">
    <b>
      {showCode && <span className="question-code text-muted">[{question.questionCode || question.code}] </span>}
      {question.compulsory && '(*) '}{trans(question.question,lang)}
    </b><br />
      <AnswerPage lang={lang} question={question} answer={answer} setAnswer={setAnswer} questionary={questionary} extraLanguages={extraLanguages} />
    <br />
  </div>
}
