import * as React from 'react'
import { useId, useState } from 'react'

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

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

export const CheckboxesBankServicePivot = ({
  combos,
  onChange,
}: {
  combos: { bank: string; service: string }[]
  onChange: ({ bankCheckboxes, serviceCheckboxes }: { bankCheckboxes: Record<string, boolean>; serviceCheckboxes: Record<string, boolean> }) => void
}) => {
  const [collapsed, setCollapsed] = useState(true)
  const banks = getUniqueValues(combos, 'bank').sort((a, b) => a.localeCompare(b))
  const services = getUniqueValues(combos, 'service').sort((a, b) => a.localeCompare(b))

  const handler = (combos: { bank: string; service: string }[], bank: string, service: string) => {
    const bankCheckboxes: Record<string, boolean> = {}
    const serviceCheckboxes: Record<string, boolean> = {}

    for (const combo of combos) {
      bankCheckboxes[combo.bank] = !(combo.bank === bank)
      serviceCheckboxes[combo.service] = !(combo.service === service)
    }

    setCollapsed(true)

    return {
      bankCheckboxes,
      serviceCheckboxes,
    }
  }

  const handleService = (service: string) => {
    const bankCheckboxes: Record<string, boolean> = {}
    const serviceCheckboxes: Record<string, boolean> = {}

    for (const combo of combos) {
      bankCheckboxes[combo.bank] = !(combo.service === service)
      serviceCheckboxes[combo.service] = !(combo.service === service)
    }

    setCollapsed(true)

    return {
      bankCheckboxes,
      serviceCheckboxes,
    }
  }

  const handleBank = (bank: string) => {
    const bankCheckboxes: Record<string, boolean> = {}
    const serviceCheckboxes: Record<string, boolean> = {}

    for (const combo of combos) {
      bankCheckboxes[combo.bank] = !(combo.bank === bank)
      serviceCheckboxes[combo.service] = false
    }

    setCollapsed(true)

    return {
      bankCheckboxes,
      serviceCheckboxes,
    }
  }

  return (
    <div className="text-bg-light rounded-3 my-2 py-2 px-3">
      <div>
        <i className="fa-regular fa-square-check me-2" />
        За для зручності вибору, скористайтеся{' '}
        <a onClick={() => setCollapsed(!collapsed)} className="link-primary">
          зведеною табличкою
        </a>
      </div>
      {!collapsed && (
        <div>
          <div className="text-secondary">Примітка: можна клікнути не тільки по галочкам, а і по назвам стовпців та строк</div>
          <table className="table table-striped table-borderless mb-0">
            <thead style={{ position: 'sticky', top: 0 }} className="text-bg-light">
              <tr>
                <th className="bg-transparent"></th>
                {services.map((service) => (
                  <th className="bg-transparent" key={service}>
                    <a onClick={() => onChange(handleService(service))} className="link-primary">
                      {service}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banks.map((bank) => (
                <tr key={bank}>
                  <th className="bg-transparent">
                    <a onClick={() => onChange(handleBank(bank))} className="link-primary">
                      {bank}
                    </a>
                  </th>
                  {services.map((service) => (
                    <td className="bg-transparent" key={service}>
                      {combos.find((c) => c.bank === bank && c.service === service) && (
                        <span className="comboitem">
                          <i className="fa-regular fa-square-check" onClick={() => onChange(handler(combos, bank, service))} />
                          <i className="fa-solid fa-square-check" onClick={() => onChange(handler(combos, bank, service))} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
