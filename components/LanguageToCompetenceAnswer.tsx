import { Dispatch } from 'react'

import { LocalizedString, LocalizedStringWithCode, LocalizedLanguages } from "@/lib/questions"
import { MapLanguageToCompetenceAnswer } from '@/models/Entry'

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
                    <select 
                        value={answer[competence.code] || ''}
                        onChange={evt => setAnswer(a => ({
                            ...a, 
                            [competence.code]: evt.target.value
                        }))}>
                        {Object.entries(competenceValues)
                            // remove first character of code
                            .map(([code, info]):[string,LocalizedString] => [code.slice(1), info])
                            .map(([code, info]) => 
                            <option key={code} value={code}>
                                {info.it ? (code!='' ?`${code} = ${info.it}` : `${info.it}`) : `${code}`}
                            </option>)}
                    </select>
                </td>
            </tr>)}
        </tbody>
    </table>
  </>
}

export default function LanguageToCompetenceAnswer({ answer, setAnswer, competences, languages, competenceValues, extraLanguages }
    :{
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
                <b>{typeof(language)==='string' ? language : language.it}</b><br />
                    <SingleLanguageToCompetence 
                        language={language} answer={answer[code] || {}} 
                        setAnswer={a => setAnswer(ans => ({...ans, [code]: a(ans[code])}))} competences={competences} competenceValues={competenceValues} /> 
                <br />
            </div>
        )}
    </>
  }
  