import useSWR from 'swr'

function SingleLanguageToCompetence({ language, answer, setAnswer, competences, competenceValues }) {
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
                            .map(([code, info]) => [code.slice(1), info])
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

export default function LanguageToCompetenceAnswer({ answer, setAnswer, competences, languages, ages, competenceValues, extraLanguages }) {
    return <>
        {Object.entries(languages).concat(extraLanguages.map(l => [l,l])).map(([code, language]) =>
            <div key={code}>
                <b>{language.it || language}</b><br />
                    <SingleLanguageToCompetence 
                        language={language} answer={answer[code] || {}} 
                        setAnswer={a => setAnswer(ans => ({...ans, [code]: a(ans[code])}))} competences={competences} competenceValues={competenceValues} /> 
                <br />
            </div>
        )}
    </>
  }
  