import { useState } from 'react'
import { Button } from 'react-bootstrap'

import LanguageCheckbox from './LanguageCheckbox'
import { trans, LocalizedString } from '@/lib/questionary'

function OtherLanguage({addLanguage}: {
    addLanguage: (language: string) => void
}) {
    const [other, setOther] = useState("")
    function commit() {
      if (other) {
        addLanguage(other)
        setOther("")
      }
    }
    return <>
      Altra lingua: <input 
          value={other} 
          onChange={(evt)=>setOther(evt.target.value)}
          onBlur={commit}
        />
      {other && <Button onClick={commit}>+</Button>}
    </>
  }
  
export default function LanguageAnswer({lang, answer, setAnswer, languages }
    : {
      lang: string,
      answer: string[], 
      setAnswer: (f: ((a: string[]) => void)) => void, 
      languages: {[key: string]: string|LocalizedString}
    }) {
    return <>{[
        ...Object.entries(languages).map(([code, data]:[string,string|LocalizedString]):[string,string] => [code, typeof(data) === 'string' ? data : trans(data, lang)]),
        ].map(([code, language]:[string,string]) => 
            <LanguageCheckbox 
                key={code}
                name={code}
                label={language}
                answer={answer}
                setAnswer={setAnswer}
                />
            )} 
        <OtherLanguage addLanguage={(language: string) => setAnswer((a: string[]) => [...a, language])}/> 
    </>
}

