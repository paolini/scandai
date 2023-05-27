import { useState } from 'react'
import { Button } from 'react-bootstrap'

import LanguageCheckbox from './LanguageCheckbox'

function OtherLanguage({addLanguage}) {
    const [other, setOther] = useState("")
    return <>
      Altra lingua: <input value={other} onChange={(evt)=>setOther(evt.target.value)}/>
      {other && <Button onClick={()=>{
        addLanguage(other)
        setOther("")
      }}>+</Button>}
    </>
  }
  
export default function LanguageAnswer({answer, setAnswer, languages }) {
    return <>{[
        ...Object.entries(languages).map(([code, data]) => [code, data.it || data]),
        ].map(([code, language]) => 
            <LanguageCheckbox 
                key={code} 
                name={code}
                label={language}
                answer={answer}
                setAnswer={setAnswer}
                />
            )} 
        <OtherLanguage addLanguage={(language) => setAnswer(a => [...a, language])}/> 
    </>
}

