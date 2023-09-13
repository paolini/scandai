import { Dispatch } from 'react'

import { assert } from '@/lib/assert'
import { LocalizedString, LocalizedStringWithCode, LocalizedLanguages } from "@/lib/questionary"
import { MapLanguageToAgeAnswer, Answer } from "@/models/Entry"
import { trans } from "@/lib/questionary"

function AgeAnswerRow({ lang, code, language, ages, answer, setAnswer }
  :{
    lang: string,
    code: string, 
    language: (string|LocalizedString),
    ages: LocalizedStringWithCode[],
    answer: {[key: string]: string},
    setAnswer: Dispatch<(a: Answer)=>void>
  }) {
  assert(!Array.isArray(answer),"answer is not an object: "+JSON.stringify(answer))

  function change(value: string) {
    setAnswer(a => ({
      ...a,
      [code]: value
    }))
  }

  if (answer[code] === undefined) change(ages[0].code)

  return <tr key={code}>
    <td>{typeof(language)==='string'? language : trans(language,lang)}</td>
    {ages.map(age => <td key={age.code}>
      <input 
        type="radio" 
        name={code} 
        value={age.code} 
        checked={answer[code] === age.code} 
        onChange={() => change(age.code)}
      />
    </td>)}
  </tr>
}

export default function LanguageToAgeAnswer({ lang, answer, setAnswer, ages, languages, extraLanguages }
  :{
    lang: string,
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
          {ages.map(age => <th key={age.code}>{age[lang]}</th>)}
        </tr>
      </thead>
      <tbody>
      {languageEntries.map(([code, language]) => 
            <AgeAnswerRow
              lang={lang}
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
