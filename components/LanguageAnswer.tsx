import { useState } from 'react'
import { Button } from 'react-bootstrap'

import LanguageCheckbox from './LanguageCheckbox'
import { LocalizedString } from '@/pages/api/questions'

function OtherLanguage({addLanguage}: {
    addLanguage: (language: string) => void
}) {
    const [other, setOther] = useState("")
    return <>
      Altra lingua: <input value={other} onChange={(evt)=>setOther(evt.target.value)}/>
      {other && <Button onClick={()=>{
        addLanguage(other)
        setOther("")
      }}>+</Button>}
    </>
  }
  
export default function LanguageAnswer({answer, setAnswer, languages }
    : {answer: string[], setAnswer: (f: ((a: string[]) => void)) => void, languages: {[key: string]: string|LocalizedString}}) {
    return <>{[
        ...Object.entries(languages).map(([code, data]:[string,string|LocalizedString]):[string,string] => [code, typeof(data) === 'string' ? data : data['it']]),
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

