export default function Checkbox({ name, label, selected, setSelected }
  : { name?: string, label: string, selected: boolean, setSelected?: (selected: boolean) => void }
  ) {
    return <div className="form-check">
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
}
 