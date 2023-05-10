const Checkbox = ({ name, label, selected, setSelected }) => (
    <div className="form-check">
      <label>
        <input
          type="checkbox"
          name={name || label}
          checked={selected}
          onChange={setSelected ? evt=>setSelected(evt.target.checked) : null}
          className="form-check-input"
        />
        {label}
      </label>
    </div>
  )
  
export default function LanguageCheckbox({ name, label, answer, setAnswer }) {
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
  
  