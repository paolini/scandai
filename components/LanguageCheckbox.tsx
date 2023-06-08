const Checkbox = ({ name, label, selected, setSelected }
  : { name?: string, label: string, selected: boolean, setSelected?: (selected: boolean) => void }
  ) => (
    <div className="form-check">
      <label>
        <input
          type="checkbox"
          name={name || label}
          checked={selected}
          onChange={setSelected ? evt=>setSelected(evt.target.checked) : undefined}
          className="form-check-input"
        />
        {label}
      </label>
    </div>
  )
  
export default function LanguageCheckbox({ name, label, answer, setAnswer }
  : { name: string, label: string, answer: string[], setAnswer: (f: ((a: string[]) => void)) => void }) {
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
  
  