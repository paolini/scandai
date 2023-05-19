import LanguageAnswer from './LanguageAnswer'
import LanguageToAgeAnswer from './LanguageToAgeAnswer'
import LanguageToCompetenceAnswer from './LanguageToCompetenceAnswer'

function Answer({ question, answer, setAnswer, data, extraLanguages }) {
  if (question.type === 'choose-language') {
    return <LanguageAnswer answer={answer} setAnswer={setAnswer} languages={data.languages}/>
  }
  if (question.type === 'map-language-to-age') {
    return <LanguageToAgeAnswer answer={answer} setAnswer={setAnswer} languages={data.languages} ages={data.ages} extraLanguages={extraLanguages} />
  }
  if (question.type === 'map-language-to-competence')
  return <LanguageToCompetenceAnswer answer={answer} setAnswer={setAnswer} languages={data.languages} ages={data.ages} competences={data.competences} competenceValues={data.competenceValues} extraLanguages={extraLanguages} />
}

export default function Question({ question, answer, setAnswer, data, extraLanguages }) {
  return <div>
    <b>{question.question.it}</b><br />
    <Answer question={question} answer={answer} setAnswer={setAnswer} data={data} extraLanguages={extraLanguages} />
    <br />
  </div>
}
