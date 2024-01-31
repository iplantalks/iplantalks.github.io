import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../styles/common.css'
import { currency } from '../utils/formatters'
import visa from '../images/visa.svg'
import mastercard from '../images/mastercard.svg'

interface PaymentSystem {
  name: string
  fee: number
  limit: number
  comment: string
}

interface Bank {
  key: string
  /**
   * wise, revolut
   */
  paymentSystem: string
  /**
   * privat24, monobank
   */
  name: string
  /**
   * visa, mastercard
   */
  vendor: string
  /**
   * debit, credit
   */
  type: string
  /**
   * p2p, applepay, googlepay
   */
  paymentType: string
  fee: number
  limit: number
  comment: string
}

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  var url = new URL('https://gsr.iplan-talks.workers.dev')
  url.searchParams.set('sheet', '1d78yVZ569Glf0Zxsu29eDED00veHjd8Gk4GxyIxkx1I')
  url.searchParams.set('range', range)
  url.searchParams.set('cache', '120')
  return await fetch(url).then((res) => res.json())
}

async function fetchPaymentSystems() {
  const result: PaymentSystem[] = []
  const values = await fetchGoogleSheetsValues('Платіжки!A2:D')
  for (const row of values) {
    result.push({
      name: row[0],
      fee: parseFloat(row[1]),
      limit: parseFloat(row[2]),
      comment: row[3],
    })
  }
  return result
}

async function fetchBanks() {
  const result: Bank[] = []
  const values = await fetchGoogleSheetsValues('Банки!A2:H')
  for (let i = 0; i < values.length; i++) {
    result.push({
      key: 'b' + i,
      paymentSystem: values[i][0],
      name: values[i][1],
      vendor: values[i][2],
      type: values[i][3],
      paymentType: values[i][4],
      fee: parseFloat(values[i][5]),
      limit: parseFloat(values[i][6]),
      comment: values[i][7],
    })
  }
  return result
}

const VendorLogo = ({ vendor }: { vendor: string }) => {
  switch (vendor) {
    case 'Visa':
      return <img title="Visa" alt="Visa" src={visa} width="30" />
    case 'MasterCard':
      return <img title="MasterCard" alt="MasterCard" src={mastercard} width="30" />
    default:
      return null
  }
}

const PaymentSystemsPage: React.FC<PageProps> = () => {
  const [transfer, setTransfer] = useState<number>(1000)
  const [banks, setBanks] = useState<Bank[]>([])
  const [paymentSystems, setPaymentSystems] = useState<PaymentSystem[]>([])

  const [bankOptions, setBankOptions] = useState<string[]>([])
  const [selectedBankOption, setSelectedBankOption] = useState<string>('')

  const [typeOptions, setCardTypeOptions] = useState<string[]>([])
  const [selectedTypeOption, setSelectedTypeOption] = useState<string>('')

  const [vendorOptions, setVendorOptions] = useState<string[]>([])
  const [selectedVendorOption, setSelectedVendorOption] = useState<string>('')

  const [paymentSystemOptions, setPaymentSystemOptions] = useState<string[]>([])
  const [selectedPaymentSystemOption, setSelectedPaymentSystemOption] = useState<string>('')

  const [paymentTypeOptions, setPaymentTypeOptions] = useState<string[]>([])
  const [selectedPaymentTypeOption, setSelectedPaymentTypeOption] = useState<string>('')

  const filteredBanks = useMemo(() => {
    return banks.filter((b) => {
      if (selectedBankOption && b.name !== selectedBankOption) {
        return false
      }
      if (selectedTypeOption && b.type !== selectedTypeOption) {
        return false
      }
      if (selectedVendorOption && b.vendor !== selectedVendorOption) {
        return false
      }
      if (selectedPaymentSystemOption && b.paymentSystem !== selectedPaymentSystemOption) {
        return false
      }
      if (selectedPaymentTypeOption && b.paymentType !== selectedPaymentTypeOption) {
        return false
      }
      return true
    })
  }, [banks, selectedBankOption, selectedTypeOption, selectedVendorOption, selectedPaymentSystemOption, selectedPaymentTypeOption])

  useEffect(() => {
    fetchPaymentSystems().then(setPaymentSystems)
    fetchBanks().then((banks) => {
      setBankOptions(Array.from(new Set(banks.map((b) => b.name))))
      setCardTypeOptions(Array.from(new Set(banks.map((b) => b.type))))
      setVendorOptions(Array.from(new Set(banks.map((b) => b.vendor))))
      setPaymentSystemOptions(Array.from(new Set(banks.map((b) => b.paymentSystem))))
      setPaymentTypeOptions(Array.from(new Set(banks.map((b) => b.paymentType))))
      setBanks(banks)
    })
  }, [])
  return (
    <main>
      <div className="container py-5">
        <h1>Банки</h1>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            $
          </span>
          <input type="number" className="form-control" value={transfer} onChange={(e) => setTransfer(parseFloat(e.target.value))} />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>
                <select className="form-select" value={selectedBankOption} onChange={(e) => setSelectedBankOption(e.target.value)}>
                  <option value="">Банк</option>
                  {bankOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select className="form-select" value={selectedPaymentSystemOption} onChange={(e) => setSelectedPaymentSystemOption(e.target.value)}>
                  <option value="">Система</option>
                  {paymentSystemOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select className="form-select" value={selectedVendorOption} onChange={(e) => setSelectedVendorOption(e.target.value)}>
                  <option value="">Вендор</option>
                  {vendorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select className="form-select" value={selectedTypeOption} onChange={(e) => setSelectedTypeOption(e.target.value)}>
                  <option value="">Тип</option>
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select className="form-select" value={selectedPaymentTypeOption} onChange={(e) => setSelectedPaymentTypeOption(e.target.value)}>
                  <option value="">Тип платежу</option>
                  {paymentTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                Комісія <span className="text-secondary">%</span>
              </th>
              <th>TCO</th>
              <th>
                Ліміт банку <span className="text-secondary">$</span>
              </th>
              <th>Коментар</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanks.map((b) => (
              <tr key={b.key}>
                <td>{b.name}</td>
                <td>{b.paymentSystem}</td>
                <td>
                  <VendorLogo vendor={b.vendor} />
                </td>
                <td>{b.type}</td>
                <td>{b.paymentType}</td>
                <td>{currency(b.fee)}</td>
                <td
                  title={`TCO = transfer - bank fee - payment system fee = ${currency(transfer)} - ${currency((transfer / 100) * b.fee)} - ${currency(
                    (transfer / 100) * (paymentSystems.find((p) => p.name === b.paymentSystem)?.fee || 0)
                  )} = ${currency(transfer - (transfer / 100) * b.fee - (transfer / 100) * (paymentSystems.find((p) => p.name === b.paymentSystem)?.fee || 0))}`}
                >
                  {currency(transfer - (transfer / 100) * b.fee - (transfer / 100) * (paymentSystems.find((p) => p.name === b.paymentSystem)?.fee || 0))}
                </td>
                <td className={transfer > b.limit ? 'text-danger' : ''}>{b.limit ? currency(b.limit) : '-'}</td>
                <td>{b.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h1>Платіжки</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Система</th>
              <th>
                Комісія <span className="text-secondary">%</span>
              </th>
              <th>
                Ліміт <span className="text-secondary">$</span>
              </th>
              <th>Коментар</th>
            </tr>
          </thead>
          <tbody>
            {paymentSystems.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{currency(p.fee)}</td>
                <td>{p.limit ? currency(p.limit) : '-'}</td>
                <td>{p.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
