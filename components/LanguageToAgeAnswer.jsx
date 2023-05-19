import useSWR from 'swr'

function AgeAnswerRow({ code, language, ages, answer, setAnswer }) {
  return <tr key={code}>
    <td>{language.it || language}</td>
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

export default function LanguageToAgeAnswer({ answer, setAnswer, ages, languages, extraLanguages }) {
  return <>
    <table>
      <thead>
        <tr>
          <th></th>
          {ages.map(age => <th key={age.code}>{age.it}</th>)}
        </tr>
      </thead>
      <tbody>
      {Object.entries(languages).concat(extraLanguages.map(l => [l,l])).map(([code, language]) => 
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
