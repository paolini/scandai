import { IChoice } from "@/lib/questionary"
import Checkbox from "./Checkbox"  
export default function ChoiceAnswer({lang, answer, setAnswer, choices}
    : {
      lang: string,
      answer: string, 
      setAnswer: (value: string) => void,
      choices: IChoice[]
    }) {
    return <>
        {choices.map(c => <Checkbox
            key={c.value}
            name={c.value}
            label={c.label[lang] || c.label['it'] || c.value}
            selected={answer===c.value}
            setSelected={() => setAnswer(c.value)}
    />)}</>
}

