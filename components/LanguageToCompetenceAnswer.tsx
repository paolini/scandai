import { Dispatch } from 'react'

import { LocalizedString, LocalizedStringWithCode, LocalizedLanguages } from "@/lib/questions"
import { MapLanguageToCompetenceAnswer } from '@/models/Entry'
import { trans } from "./Question"

export default function LanguageToCompetenceAnswer({ lang, answer, setAnswer, competences, languages, competenceValues, extraLanguages }:{
        lang: string,
        answer: MapLanguageToCompetenceAnswer,
        setAnswer: Dispatch<(a: MapLanguageToCompetenceAnswer)=>void>,
        competences: LocalizedStringWithCode[],
        languages: LocalizedLanguages,
        competenceValues: {[key:string]: LocalizedString},
        extraLanguages: string[]
    }) {
    return <>
        {[...Object.entries(languages),
          ...extraLanguages.map(l => [l,l])].map(([code, language]) =>
            <div key={code}>
                <b>{typeof(language)==='string' ? language : trans(language, lang)}</b><br />
                    <SingleLanguageToCompetence 
                        language={language} answer={answer[code] || {}} 
                        setAnswer={a => setAnswer(ans => ({...ans, [code]: a(ans[code])}))} competences={competences} competenceValues={competenceValues} /> 
                <br />
            </div>
        )}
    </>
  }

function SingleLanguageToCompetence({ language, answer, setAnswer, competences, competenceValues }
    :{
        language: string|LocalizedString,
        answer: {[key: string]: string},
        setAnswer: Dispatch<(a: {[key: string]: string})=>void>,
        competences: LocalizedStringWithCode[],
        competenceValues: {[key: string]: LocalizedString}
    }) {
  return <>
    <table>
        <tbody>
          {competences.map(competence => 
            <tr key={competence.code}>
                <td>
                    {competence.it}
                </td>
                <td>
                    <CompetenceSelect competence={competence} answer={answer} setAnswer={setAnswer} competenceValues={competenceValues} />
                </td>
            </tr>)}
        </tbody>
    </table>
  </>
}

function CompetenceSelect({competence, answer, setAnswer, competenceValues}:{
    competence: LocalizedStringWithCode,
    answer: {[key: string]: string},
    setAnswer: Dispatch<(a: {[key: string]: string})=>void>,
    competenceValues: {[key: string]: LocalizedString}
}) {
    function change(value: string) {
        setAnswer(a => ({
            ...a, 
            [competence.code]: value}))
    }

    if (!answer[competence.code]) {
        change('0')
    }

    return <select 
        value={answer[competence.code] || ''}
        onChange={evt => change(evt.target.value)}>
        {Object.entries(competenceValues)
            // remove first character of code
            .map(([code, info]):[string,LocalizedString] => [code.slice(1), info])
            .map(([code, info]) => 
            <option key={code} value={code}>
                {info.it ? (code!='' ?`${code} = ${info.it}` : `${info.it}`) : `${code}`}
            </option>)}
    </select>
}

