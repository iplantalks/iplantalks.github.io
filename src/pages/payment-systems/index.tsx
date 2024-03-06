import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import './styles.css'
import { currency } from '../../utils/formatters'
import ibkr from '../../images/interactive-brokers.svg'
import { VendorLogo } from './components/_banks'
import Join from '../../components/join'
import Hero from '../../components/hero'
import { useBankLinks, usePaymentSystemLinks } from './components/_links'
import { useVideoLinks } from './components/_videos'
import { parseSheetsNumber, useGoogleSheetTable } from './components/_api'
import { Feedback } from './components/_feedback'
import { Shop } from '../../components/shop'
import Hotjar from '@hotjar/browser'

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

function ago(date: Date): string {
  let difference = (new Date().getTime() - date.getTime()) / 1000

  const periods = [
    ['секунду', 'секурнди', 'секунд'],
    ['хвилину', 'хвилини', 'хвилин'],
    ['годину', 'години', 'годин'],
    ['день', 'дня', 'днів'],
    ['тиждень', 'тижні', 'тижнів'],
    ['місяць', 'місяця', 'місяців'],
    ['рік', 'роки', 'років'],
  ]

  const lengths = [60, 60, 24, 7, 4.35, 12, 10]

  for (var i = 0; difference >= lengths[i]; i++) {
    difference = difference / lengths[i]
  }

  difference = Math.round(difference)

  const cases = [2, 0, 1, 1, 1, 2]
  const text = periods[i][difference % 100 > 4 && difference % 100 < 20 ? 2 : cases[Math.min(difference % 10, 5)]]
  return difference + ' ' + text + ' тому'
}

const Checkboxes = ({ names, checkboxes, onChange }: { names: string[]; checkboxes: Record<string, boolean>; onChange: (name: string) => void }) => (
  <div>
    {names.map((name) => (
      <div className="form-check form-check-inline" key={`bank-checkbox-${name}`}>
        <input className="form-check-input" type="checkbox" id={`bank-checkbox-${name}`} checked={!checkboxes[name]} onChange={() => onChange(name)} />
        <label className="form-check-label" htmlFor={`bank-checkbox-${name}`}>
          {name}
        </label>
      </div>
    ))}
  </div>
)

const Like = ({
  bank,
  vendor,
  card,
  card_currency,
  service,
  service_currency,
  method,
  likes,
}: {
  bank: string
  vendor: string
  card: string
  card_currency: string
  service: string
  service_currency: string
  method: string
  likes: number
}) => {
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    try {
      setLoading(true)
      const url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/payment_systems_like')
      url.searchParams.set('bank', bank)
      url.searchParams.set('vendor', vendor)
      url.searchParams.set('card', card)
      url.searchParams.set('card_currency', card_currency)
      url.searchParams.set('service', service)
      url.searchParams.set('service_currency', service_currency)
      url.searchParams.set('method', method)
      const res = await fetch(url)
      if (res.ok) {
        alert('Дякуємо за відмітку!\n\nВаш голос враховано та буде відображено через декілька хвилин після того як обновиться кеш.')
        console.log(await res.json())
      } else {
        alert('Нажаль сталася помилка, спробуйте пізніше')
        console.warn(res.status, res.statusText, await res.json())
      }
    } catch (error) {
      console.warn(error)
      alert('Нажаль сталася помилка, спробуйте пізніше')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <small>
        {likes}
        <i className="fa-solid fa-spinner ms-1" />
      </small>
    )
  }
  return (
    <small style={{ whiteSpace: 'nowrap', opacity: likes > 0 ? 1 : 0.5 }} onClick={handleLike}>
      {likes}
      <i className={likes > 0 ? 'fa-solid fa-heart text-danger ms-1' : 'fa-solid fa-heart text-secondary ms-1'} />
    </small>
  )
}

const PaymentSystemsPage: React.FC<PageProps> = () => {
  useEffect(() => {
    if (!window.location.hostname.includes('localhost')) {
      Hotjar.init(3873202, 6)
    }
  }, [])
  const [transfer, setTransfer] = useState<number>(1000)
  const rows = useGoogleSheetTable('Data!A1:Z').map((row) => ({
    bank: row['bank'],
    vendor: row['vendor'],
    card: row['card'],
    card_currency: row['card_currency'],
    bank_fee: parseSheetsNumber(row['bank_fee']) || 0,
    service: row['service'],
    service_currency: row['service_currency'],
    method: row['method'],
    service_fee: parseSheetsNumber(row['service_fee']) || 0,
    date: row['date'] ? new Date(row['date'].split('.').reverse().join('-')) : null,
    comment: row['comment'],
    video: row['video'],
    likes: parseInt(row['likes'] || '0') || 0,
    works: row['works'],
    payment: 0,
  }))
  const [bankCheckboxes, setBankCheckboxes] = useState<Record<string, boolean>>({})
  const [serviceCheckboxes, setServiceCheckboxes] = useState<Record<string, boolean>>({})
  const [methodCheckboxes, setMethodCheckboxes] = useState<Record<string, boolean>>({})
  const [currencyCheckboxes, setCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<keyof (typeof rows)[0]>('payment')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hideNotWorking, setHideNotWorking] = useState(true)

  const bankLinks = useBankLinks()
  const paymentSystemLinks = usePaymentSystemLinks()
  const videoLinks = useVideoLinks()

  const demo = useMemo(() => {
    const found = rows.find((r) => r.bank === 'Privat' && r.service === 'Wise' && r.method === 'P2P' && r.card_currency === 'USD' && r.service_currency === 'USD')
    const service_payment = transfer + transfer * ((found?.service_fee || 0) / 100)
    const bank_payment = service_payment + service_payment * ((found?.bank_fee || 0) / 100)
    return {
      ...found,
      service_payment,
      bank_payment,
    }
  }, [rows, transfer])

  return (
    <main>
      <Hero title="Платіжні системи" subtitle="Поповнюємо Interactive Brokers ефективно" youtube="https://www.youtube.com/watch?v=23_e_wUAnPA" />

      <div className="container py-5">
        <div className="d-flex align-items-center mb-3">
          <div>
            Отже ми хочемо завести в <img src={ibkr} width="140" alt="Interactive Brokers" style={{ marginTop: '-10px' }} />
          </div>
          <div className="input-group mx-3" style={{ width: '10em' }}>
            <span className="input-group-text" id="basic-addon1">
              $
            </span>
            <input type="number" className="form-control" value={transfer} onChange={(e) => setTransfer(parseFloat(e.target.value))} />
          </div>
        </div>

        <table className="my-3">
          <tbody>
            <tr>
              <th className="pe-3">Банк:</th>
              <td>
                <Checkboxes names={getUniqueValues(rows, 'bank')} checkboxes={bankCheckboxes} onChange={(name: string) => setBankCheckboxes({ ...bankCheckboxes, [name]: !bankCheckboxes[name] })} />
              </td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setBankCheckboxes(getUniqueValues(rows, 'bank').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(bankCheckboxes).shift() }), {}))}
                >
                  усі
                </button>
              </td>
            </tr>
            <tr>
              <th className="pe-3">Платіжка:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rows, 'service')}
                  checkboxes={serviceCheckboxes}
                  onChange={(name: string) => setServiceCheckboxes({ ...serviceCheckboxes, [name]: !serviceCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Метод:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rows, 'method')}
                  checkboxes={methodCheckboxes}
                  onChange={(name: string) => setMethodCheckboxes({ ...methodCheckboxes, [name]: !methodCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Валюта:</th>
              <td>
                <Checkboxes
                  names={Array.from(new Set([...getUniqueValues(rows, 'card_currency'), ...getUniqueValues(rows, 'service_currency')]))}
                  checkboxes={currencyCheckboxes}
                  onChange={(name: string) => setCurrencyCheckboxes({ ...currencyCheckboxes, [name]: !currencyCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Статус:</th>
              <td>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="checkbox" id="hide-not-working" checked={hideNotWorking} onChange={() => setHideNotWorking(!hideNotWorking)} />
                  <label className="form-check-label" htmlFor="hide-not-working">
                    приховати не працюючі
                  </label>
                </div>
              </td>
              <td></td>
            </tr>
            {/* <tr>
            <th className="pe-3">Сортувати&nbsp;за:</th>
            <td>
              <div className="row row-cols-lg-auto">
                <div className="col-12">
                  <select className="form-select" value={sortField} onChange={(e) => setSortField(e.target.value as unknown as keyof (typeof rows)[0])}>
                    <option value="payment">сумою до сплати</option>
                    <option value="bank_fee">комісією банку</option>
                    <option value="service_fee">комісією платіжки</option>
                    <option value="date">датою перевірки</option>
                  </select>
                </div>
              </div>
            </td>
            <td></td>
          </tr> */}
          </tbody>
        </table>

        <div className="d-none d-md-block">
          <table className="table">
            <thead className="table-header-nowrap">
              <tr>
                <th></th>
                <th onClick={() => (sortField === 'bank' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank'))} className={sortField === 'bank' ? 'table-dark' : ''}>
                  Банк
                  {sortField === 'bank' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'bank' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'bank' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'vendor' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('vendor'))}
                  className={sortField === 'vendor' ? 'table-dark' : ''}
                >
                  Вендор
                  {sortField === 'vendor' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'vendor' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'vendor' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th onClick={() => (sortField === 'card' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('card'))} className={sortField === 'card' ? 'table-dark' : ''}>
                  Карта
                  {sortField === 'card' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'card' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'card' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'card_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('card_currency'))}
                  className={sortField === 'card_currency' ? 'table-dark' : ''}
                >
                  Валюта
                  {sortField === 'card_currency' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'card_currency' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'card_currency' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  title="Комісія банку"
                  onClick={() => (sortField === 'bank_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank_fee'))}
                  className={sortField === 'bank_fee' ? 'table-dark' : ''}
                >
                  Комісія <span className="text-secondary">%</span>
                  {sortField === 'bank_fee' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'bank_fee' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'bank_fee' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'service' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service'))}
                  className={sortField === 'service' ? 'table-dark' : ''}
                >
                  Платіжка
                  {sortField === 'service' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'service' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'service' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'service_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_currency'))}
                  className={sortField === 'service_currency' ? 'table-dark' : ''}
                >
                  Валюта
                  {sortField === 'service_currency' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'service_currency' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'service_currency' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'method' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('method'))}
                  className={sortField === 'method' ? 'table-dark' : ''}
                >
                  Метод
                  {sortField === 'method' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'method' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'method' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  title="Комісія платіжки"
                  onClick={() => (sortField === 'service_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_fee'))}
                  className={sortField === 'service_fee' ? 'table-dark' : ''}
                >
                  Комісія <span className="text-secondary">%</span>
                  {sortField === 'service_fee' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'service_fee' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'service_fee' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  onClick={() => (sortField === 'payment' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('payment'))}
                  className={sortField === 'payment' ? 'table-dark' : ''}
                >
                  До сплати <span className="text-secondary">$</span>
                  {sortField === 'payment' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'payment' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'payment' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th onClick={() => (sortField === 'date' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('date'))} className={sortField === 'date' ? 'table-dark' : ''}>
                  Перевірено
                  {sortField === 'date' && sortDirection === 'asc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField === 'date' && sortDirection === 'desc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField !== 'date' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th>{/* Коментар */}</th>
                <th>{/* Likes */}</th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center">
                    Завантажуемо данні з Google таблички, трохи зачекайте, вона не така швидка&hellip;
                  </td>
                </tr>
              )}
              {rows
                .filter((r) => r.works === 'TRUE' || !hideNotWorking)
                .filter((r) => !bankCheckboxes[r.bank])
                .filter((r) => !serviceCheckboxes[r.service])
                .filter((r) => !methodCheckboxes[r.method])
                .filter((r) => !currencyCheckboxes[r.card_currency] && !currencyCheckboxes[r.service_currency])
                .map((r) => ({ ...r, bank_links: bankLinks.find((l) => l.name === r.bank) }))
                .map((r) => ({ ...r, service_links: paymentSystemLinks.find((l) => l.name === r.service) }))
                .map((r) => ({ ...r, payment: transfer + transfer * (r.service_fee / 100) + (transfer + transfer * (r.service_fee / 100)) * (r.bank_fee / 100) }))
                .sort((a, b) => {
                  if (sortDirection === 'asc') {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee') return a[sortField] - b[sortField]
                    else if (sortField === 'date') return (a[sortField]?.getTime() || 0) - (b[sortField]?.getTime() || 0)
                    return a[sortField].toString().localeCompare(b[sortField].toString())
                  } else {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee') return b[sortField] - a[sortField]
                    else if (sortField === 'date') return (b[sortField]?.getTime() || 0) - (a[sortField]?.getTime() || 0)
                    return b[sortField].toString().localeCompare(a[sortField].toString())
                  }
                })
                .map((r, i) => (
                  <tr key={i}>
                    <th>
                      {r.video && (
                        <a className="text-decoration-none link-danger" href={r.video} target="_blank">
                          <i className="fa-brands fa-youtube" />
                        </a>
                      )}
                    </th>
                    <td className={sortField === 'bank' ? 'table-secondary fw-bold' : ''}>
                      {r.bank}
                      {r.bank_links && r.bank_links.comment && (
                        <small title={r.bank_links.comment} className="ms-2">
                          <i className="fa-regular fa-circle-question" />
                        </small>
                      )}
                      {r.bank_links && r.bank_links.website && (
                        <a className="text-decoration-none ms-2" href={r.bank_links.website} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )}
                    </td>
                    <td className={sortField === 'vendor' ? 'table-secondary fw-bold' : ''}>
                      <VendorLogo vendor={r.vendor} />
                    </td>
                    <td className={sortField === 'card' ? 'table-secondary fw-bold' : ''}>{r.card}</td>
                    <td className={sortField === 'card_currency' ? 'table-secondary fw-bold' : ''}>{r.card_currency}</td>
                    <td className={sortField === 'bank_fee' ? 'table-secondary fw-bold' : ''}>
                      {currency(r.bank_fee)}
                      {/* {r.bank_links && (
                        <a className="text-decoration-none ms-2" href={r.bank_links.fees} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )} */}
                    </td>
                    <td className={sortField === 'service' ? 'table-secondary fw-bold' : ''}>
                      {r.service}
                      {r.service_links && r.service_links.comment && (
                        <small title={r.service_links.comment} className="ms-2">
                          <i className="fa-regular fa-circle-question" />
                        </small>
                      )}
                      {r.service_links && r.service_links.website && (
                        <a className="text-decoration-none ms-2" href={r.service_links.website} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )}
                    </td>
                    <td className={sortField === 'service_currency' ? 'table-secondary fw-bold' : ''}>{r.service_currency}</td>
                    <td className={sortField === 'method' ? 'table-secondary fw-bold' : ''}>{r.method}</td>
                    <td className={sortField === 'service_fee' ? 'table-secondary fw-bold' : ''}>
                      {currency(r.service_fee)}
                      {/* {r.service_links && (
                        <a className="text-decoration-none ms-2" href={r.service_links.fees} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )} */}
                    </td>
                    <td className={sortField === 'payment' ? 'table-secondary fw-bold' : ''}>
                      {r.works === 'TRUE' ? (
                        <span>{currency(r.payment)}</span>
                      ) : (
                        <span className="text-danger" title="Цей маршрут не працює">
                          Не працює
                        </span>
                      )}
                    </td>
                    <td className={sortField === 'date' ? 'table-secondary fw-bold' : ''} title={r.date?.toLocaleDateString()}>
                      {r.date ? ago(r.date) : <span>&mdash;</span>}
                    </td>
                    <td>
                      {r.comment && (
                        <small title={r.comment}>
                          <i className="fa-regular fa-circle-question" />
                        </small>
                      )}
                    </td>
                    <td className="text-end">
                      <Like {...r} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="d-block d-md-none">
          <table className="table">
            <thead>
              <tr>
                <th>Банк</th>
                <th>Платіжка</th>
                <th onClick={() => (sortField === 'payment' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('payment'))}>
                  {sortField === 'payment' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'payment' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  До сплати&nbsp;<span className="text-secondary">$</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center">
                    Завантажуемо данні з Google таблички, трохи зачекайте, вона не така швидка&hellip;
                  </td>
                </tr>
              )}
              {rows
                .filter((r) => r.works === 'TRUE' || !hideNotWorking)
                .filter((r) => !bankCheckboxes[r.bank])
                .filter((r) => !serviceCheckboxes[r.service])
                .filter((r) => !methodCheckboxes[r.method])
                .filter((r) => !currencyCheckboxes[r.card_currency] && !currencyCheckboxes[r.service_currency])
                .map((r) => ({ ...r, bank_links: bankLinks.find((l) => l.name === r.bank) }))
                .map((r) => ({ ...r, service_links: paymentSystemLinks.find((l) => l.name === r.service) }))
                .map((r) => ({ ...r, payment: transfer + transfer * (r.service_fee / 100) + (transfer + transfer * (r.service_fee / 100)) * (r.bank_fee / 100) }))
                .sort((a, b) => {
                  if (sortDirection === 'asc') {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee') return a[sortField] - b[sortField]
                    else if (sortField === 'date') return (a[sortField]?.getTime() || 0) - (b[sortField]?.getTime() || 0)
                    return a[sortField].toString().localeCompare(b[sortField].toString())
                  } else {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee') return b[sortField] - a[sortField]
                    else if (sortField === 'date') return (b[sortField]?.getTime() || 0) - (a[sortField]?.getTime() || 0)
                    return b[sortField].toString().localeCompare(a[sortField].toString())
                  }
                })
                .map((r, i) => (
                  <tr key={i}>
                    <td className={sortField === 'bank' ? 'table-secondary fw-bold' : ''}>
                      {r.bank}
                      {r.bank_links && (
                        <a className="text-decoration-none ms-2" href={r.bank_links.website} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )}
                      <br />
                      <VendorLogo vendor={r.vendor} />
                      <br />
                      {r.card}
                      <br />
                      {r.card_currency}
                      <br />
                      Комісія: {currency(r.bank_fee)}%
                    </td>
                    <td className={sortField === 'service' ? 'table-secondary fw-bold' : ''}>
                      {r.service}
                      {r.service_links && (
                        <a className="text-decoration-none ms-2" href={r.service_links.website} target="_blank">
                          <small>
                            <i className="fa-solid fa-link" />
                          </small>
                        </a>
                      )}
                      <br />
                      {r.service_currency}
                      <br />
                      {r.method}
                      <br />
                      Комісія: {currency(r.service_fee)}%
                      <br />
                      <Like {...r} />
                    </td>
                    <td className={sortField === 'payment' ? 'table-secondary fw-bold' : ''}>
                      {r.works === 'TRUE' ? (
                        <span>{currency(r.payment)}</span>
                      ) : (
                        <span className="text-danger" title="Цей маршрут не працює">
                          Не працює
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-5 mb-3">Як це працює?</h2>
        <p>
          На прикладі Wise, за для того, щоб в Interactive Brokers потрапила <b>{transfer}</b> долларів, маємо перевести в Wise <b>{currency(demo.service_payment)}</b>, щоб сплатити його комісію.
        </p>
        <p>
          За для того, щоб перевести в Wise <b>{currency(demo.service_payment)}</b> долларів з валютної картки Приват банку, що також хоче свої <b>{demo?.bank_fee}</b> відсотки утримати муситимемо
          переказати <b>{currency(demo.bank_payment)}</b> долларів.
        </p>
        <p>Таким чином колонка "До сплати" розраховує закальну сумму коштів що ми витратимо за для поповнення Interactive Brokers на вказану суму.</p>
        <p>
          Примітка: данні в табличці відсортовані за колонкою "До сплати" тобто з початку ідуть найдешевші маргрути. Також, за для зручності, ви можете скористатися фільтрами, за для того, щоб
          показувати лише цікаві вам маршрути.
        </p>
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>
            Збираємо <i className="fa-solid fa-heart text-danger" />
          </h2>
          <p>
            Якщо бачиш маршрут яким користуєшься - відмічай його натиснувши <i className="fa-solid fa-heart text-danger" />
          </p>
          <p>Ідея така щоб ми усі бачили найбільш використовуваніші маршрути серед доступних</p>
          <p>
            Примітка: після того як проголосуєте за маршрут, якщо все добре, буде показано повідомлення про те що голос зараховано, але сама цифра зміниться лише через декілька хвилин. Справа в тому,
            що для швидкості та адекватної вартості, відповіді Google Sheets кєшуються, тобто сторінка показує вам закешовані данні, які обновляются раз у декілька хвилин, а отже важ голос зʼявиться
            трохи піздніше. Тож не хвилюйтеся і якщо побачили повідомлення що голос враховано - так воно і є.
          </p>
        </div>
      </div>

      <Feedback />

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Корисні відео</h2>
          <p>Підбірка корисних відео щодо банків та платіжних систем.</p>

          <div className="row">
            {videoLinks.map((link, i) => (
              <div key={i} className="col-12 col-md-6 my-3">
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="ratio ratio-16x9">
                    <iframe
                      width="560"
                      height="315"
                      src={'https://www.youtube.com/embed/' + new URL(link.youtube).searchParams.get('v')}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="card-body">
                    <b>{link.category}</b>
                    <br />
                    {link.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Shop />
      <Join />
    </main>
  )
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
