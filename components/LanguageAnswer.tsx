import { useState } from 'react'
import { Button } from 'react-bootstrap'

import LanguageCheckbox from './LanguageCheckbox'
import { trans, LocalizedString, getPhrase, languageNames } from '@/lib/questionary'

function OtherLanguage({lang, addLanguage}: {
    lang: string,
    addLanguage: (language: string) => void
}) {
    const [other, setOther] = useState("")
    function commit() {
      if (other) {
        addLanguage(other.trim())
        setOther("")
      }
    }
    return <>
      {getPhrase("otherLanguage", lang)} <input 
          value={other} 
          onChange={(evt)=>setOther(evt.target.value)}
          onBlur={commit}
          onKeyDown={(evt) => {
            if (evt.key === 'Enter' || evt.key === 'Tab') {
              commit()
            }
          }}
        />
      {other && <Button onClick={commit}>+</Button>}
    </>
  }
  
export default function LanguageAnswer({lang, answer, setAnswer, languages}
    : {
      lang: string,
      answer: string[], 
      setAnswer: (f: ((a: string[]) => void)) => void, 
      languages: {[key: string]: string|LocalizedString},
    }) {
    const lst: [string, string][] = [...Object.entries(languages)
          .map(([code, data]:[string,string|LocalizedString]):[string,string] => [code, typeof(data) === 'string' ? data : trans(data, lang)]),
        ]
    return <>
      {lst.map(([code, language]:[string,string]) => 
            <LanguageCheckbox 
                key={code}
                name={code}
                label={language}
                answer={answer}
                setAnswer={setAnswer}
                />
            )} 
        <OtherLanguage 
          lang={lang}
          addLanguage={addLanguage}/> 
    </>

    function addLanguage(language: string) {
      let l = ''

      // vediamo se hai scelto il nome di una lingua di cui ho il codice
      Object.entries(languageNames).forEach(([code, names]) => {
        console.log(JSON.stringify({code,names}))
        Object.entries(names).forEach(([langCode, nameInLang]) => {
          console.log(JSON.stringify({langCode,nameInLang}) )
          if (nameInLang.toLowerCase() === language.toLowerCase()) {
            l = code
          }
        })
      })
      console.log(`l: ${l}`)
      setAnswer((a: string[]) => [...a, l || language])
    }
}

