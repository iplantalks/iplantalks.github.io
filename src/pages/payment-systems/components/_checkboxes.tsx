import * as React from 'react'
import { useId } from 'react'

export const Checkboxes = ({ names, checkboxes, onChange }: { names: string[]; checkboxes: Record<string, boolean>; onChange: (name: string) => void }) => {
  const id = useId()
  return (
    <div>
      {names.map((name) => (
        <div className="form-check form-check-inline" key={`bank-checkbox-${id}-${name}`}>
          <input className="form-check-input" type="checkbox" id={`bank-checkbox-${id}-${name}`} checked={!checkboxes[name]} onChange={() => onChange(name)} />
          <label className="form-check-label" htmlFor={`bank-checkbox-${id}-${name}`}>
            {name}
          </label>
        </div>
      ))}
    </div>
  )
}

export const Checkboxes2 = ({ names, checkboxes, onChange }: { names: string[]; checkboxes: Record<string, boolean>; onChange: (name: string) => void }) => {
  const id = useId()
  return (
    <div>
      {names.map((name) => (
        <div className="form-check" key={`bank-checkbox-${id}-${name}`}>
          <input className="form-check-input" type="checkbox" id={`bank-checkbox-${id}-${name}`} checked={!checkboxes[name]} onChange={() => onChange(name)} />
          <label className="form-check-label" htmlFor={`bank-checkbox-${id}-${name}`}>
            {name}
          </label>
        </div>
      ))}
    </div>
  )
}
