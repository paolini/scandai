import Checkbox from './Checkbox'

export default function LanguageCheckbox({ name, label, answer, setAnswer}
  : { 
      name: string, 
      label: string, 
      answer: string[], 
      setAnswer: (f: ((a: string[]) => void)) => void,
    }) {
    return <Checkbox
      name={name}
      label={label} 
      selected={answer.includes(name)}
      setSelected={(selected) => {
        if (selected && !answer.includes(name)) {
          setAnswer(a => [...a, name])
        }
        if (!selected && answer.includes(name)) {
          setAnswer(a => a.filter(l => l !== name))
        }
      }}
    />
  }
  
  