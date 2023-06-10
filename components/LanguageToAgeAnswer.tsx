import { Dispatch } from 'react'

import { assert } from '@/lib/assert'
import { LocalizedString, LocalizedStringWithCode, LocalizedLanguages } from "@/lib/questions"
import { MapLanguageToAgeAnswer, Answer } from "@/models/Entry"

function AgeAnswerRow({ code, language, ages, answer, setAnswer }
  :{
    code: string, 
    language: (string|LocalizedString),
    ages: LocalizedStringWithCode[],
    answer: {[key: string]: string},
    setAnswer: Dispatch<(a: Answer)=>void>
  }) {
  assert(!Array.isArray(answer))
  return <tr key={code}>
    <td>{typeof(language)==='string'? language : language.it}</td>
    {ages.map(age => <td key={age.code}>
      <input 
        type="radio" 
        name={code} 
        value={age.code} 
        checked={answer[code] === age.code} 
        onChange={() => setAnswer(a => ({
            ...a, 
            [code]: age.code
          }))}
      />
    </td>)}
  </tr>
}

export default function LanguageToAgeAnswer({ answer, setAnswer, ages, languages, extraLanguages }
  :{
    answer: {[key:string]: string},
    setAnswer: Dispatch<(a: Answer)=>void>,
    ages: LocalizedStringWithCode[],
    languages: LocalizedLanguages,
    extraLanguages: string[]
  }) {

  const languageEntries = [
    ...Object.entries(languages),
    ...extraLanguages.map(l => [l,l])]

  return <>
    <table>
      <thead>
        <tr>
          <th></th>
          {ages.map(age => <th key={age.code}>{age.it}</th>)}
        </tr>
      </thead>
      <tbody>
      {languageEntries.map(([code, language]) => 
            <AgeAnswerRow
            key={code}
            code={code}
            language={language}
            answer={answer}
            ages={ages}
            setAnswer={setAnswer}
            />
            )} 
      </tbody>
    </table>
  </>
}
