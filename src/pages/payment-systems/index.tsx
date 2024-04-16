import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import './styles.css'
import { currency } from '../../utils/formatters'
import { VendorLogo } from './components/_banks'
import Join from '../../components/join'
import Hero from '../../components/hero'
import { useBankLinks, usePaymentSystemLinks } from './components/_links'
import { useVideoLinks } from './components/_videos'
import { parseSheetsNumber, useGoogleSheetTable } from './components/_api'
import { Feedback } from './components/_feedback'
import { Shop } from '../../components/shop'
import Hotjar from '@hotjar/browser'
import { Method } from './components/_method'
import { Like } from './components/_like'
import { Checkboxes } from './components/_checkboxes'
import { ago } from '../../utils/ago'
import { PaymentsFaq } from './components/_payments-faq'

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

const PaymentSystemsPage: React.FC<PageProps> = () => {
  useEffect(() => {
    if (!window.location.hostname.includes('localhost')) {
      Hotjar.init(3873202, 6)
    }
  }, [])
  const [transfer, setTransfer] = useState<number>(1000)
  const rows = useGoogleSheetTable('Data!A1:Z')
    .map((row) => ({
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
      megatag: row['megatag'],
      payment: 0,
    }))
    .filter(({ bank, vendor, card, card_currency, service, service_currency, method }) => !!bank || !!vendor || !!card || !!card_currency || !!service || !!service_currency || !!method)

  const [megatagCheckboxes, setMegatagCheckboxes] = useState<Record<string, boolean>>({})
  const [bankCheckboxes, setBankCheckboxes] = useState<Record<string, boolean>>({})
  const [serviceCheckboxes, setServiceCheckboxes] = useState<Record<string, boolean>>({})
  const [methodCheckboxes, setMethodCheckboxes] = useState<Record<string, boolean>>({})
  const [srcCurrencyCheckboxes, setSrcCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [dstCurrencyCheckboxes, setDstCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<keyof (typeof rows)[0]>('payment')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hideNotWorking, setHideNotWorking] = useState(true)

  const bankLinks = useBankLinks()
  const paymentSystemLinks = usePaymentSystemLinks()
  const videoLinks = useVideoLinks()

  const rowsFilteredByMegatag = useMemo(() => rows.filter((r) => !megatagCheckboxes[r.megatag]), [rows, megatagCheckboxes])

  return (
    <main>
      <Hero title="Платіжні системи" subtitle="Поповнюємо Interactive Brokers ефективно" youtube="https://www.youtube.com/watch?v=23_e_wUAnPA" />

      <div className="container py-5">
        <div className="d-flex align-items-center mb-3">
          <div>Отже ми хочемо перевести</div>
          <div className="ms-3" style={{ width: '10em' }}>
            <input type="number" className="form-control" value={transfer} onChange={(e) => setTransfer(parseFloat(e.target.value))} />
          </div>
        </div>

        <table className="my-3">
          <tbody>
            <tr>
              <th className="pe-3">Напрямок:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rows, 'megatag')}
                  checkboxes={megatagCheckboxes}
                  onChange={(name: string) => setMegatagCheckboxes({ ...megatagCheckboxes, [name]: !megatagCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Платник:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rowsFilteredByMegatag, 'bank')}
                  checkboxes={bankCheckboxes}
                  onChange={(name: string) => setBankCheckboxes({ ...bankCheckboxes, [name]: !bankCheckboxes[name] })}
                />
              </td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setBankCheckboxes(getUniqueValues(rowsFilteredByMegatag, 'bank').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(bankCheckboxes).shift() }), {}))}
                >
                  усі
                </button>
              </td>
            </tr>
            <tr>
              <th className="pe-3">Отримувач:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rowsFilteredByMegatag, 'service')}
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
                  names={getUniqueValues(rowsFilteredByMegatag, 'method')}
                  checkboxes={methodCheckboxes}
                  onChange={(name: string) => setMethodCheckboxes({ ...methodCheckboxes, [name]: !methodCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Відправляємо:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rowsFilteredByMegatag, 'card_currency')}
                  checkboxes={srcCurrencyCheckboxes}
                  onChange={(name: string) => setSrcCurrencyCheckboxes({ ...srcCurrencyCheckboxes, [name]: !srcCurrencyCheckboxes[name] })}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <th className="pe-3">Отримуємо:</th>
              <td>
                <Checkboxes
                  names={getUniqueValues(rowsFilteredByMegatag, 'service_currency')}
                  checkboxes={dstCurrencyCheckboxes}
                  onChange={(name: string) => setDstCurrencyCheckboxes({ ...dstCurrencyCheckboxes, [name]: !dstCurrencyCheckboxes[name] })}
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
          </tbody>
        </table>

        <div className="d-none d-md-block">
          <table className="table">
            <thead className="table-header-nowrap">
              <tr className="table-secondary" style={{ fontSize: '80%' }}>
                <th></th>
                <th onClick={() => (sortField === 'bank' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank'))} className={sortField === 'bank' ? 'table-dark' : ''}>
                  Платник
                  {sortField === 'bank' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'bank' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'bank' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  title="Тип інструменту"
                  onClick={() => (sortField === 'vendor' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('vendor'))}
                  className={sortField === 'vendor' ? 'table-dark' : ''}
                >
                  Інструмент
                  {sortField === 'vendor' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'vendor' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'vendor' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                </th>
                <th
                  title="Тип рахунку"
                  onClick={() => (sortField === 'card' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('card'))}
                  className={sortField === 'card' ? 'table-dark' : ''}
                >
                  Рахунок
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
                  title="Комісія відправника"
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
                  Отримувач
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
                  title="Комісія отримувача"
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
                <th onClick={() => (sortField === 'likes' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('likes'))} className={sortField === 'likes' ? 'table-dark' : ''}>
                  Я це <i className="fa-solid fa-heart text-danger ms-1" />
                  {sortField === 'likes' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                  {sortField === 'likes' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                  {sortField !== 'likes' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
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
                .filter((r) => !megatagCheckboxes[r.megatag])
                .filter((r) => !bankCheckboxes[r.bank])
                .filter((r) => !serviceCheckboxes[r.service])
                .filter((r) => !methodCheckboxes[r.method])
                .filter((r) => !srcCurrencyCheckboxes[r.card_currency])
                .filter((r) => !dstCurrencyCheckboxes[r.service_currency])
                .map((r) => ({ ...r, bank_links: bankLinks.find((l) => l.name === r.bank) }))
                .map((r) => ({ ...r, service_links: paymentSystemLinks.find((l) => l.name === r.service) }))
                .map((r) => ({ ...r, payment: transfer + transfer * (r.service_fee / 100) + (transfer + transfer * (r.service_fee / 100)) * (r.bank_fee / 100) }))
                .sort((a, b) => {
                  if (sortDirection === 'asc') {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee' || sortField === 'likes') return a[sortField] - b[sortField]
                    else if (sortField === 'date') return (a[sortField]?.getTime() || 0) - (b[sortField]?.getTime() || 0)
                    return a[sortField].toString().localeCompare(b[sortField].toString())
                  } else {
                    if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee' || sortField === 'likes') return b[sortField] - a[sortField]
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
                      {r.bank_links && r.bank_links.remote === 'TRUE' && <i className="text-primary fa-brands fa-bluetooth" title="Можливе віддаленне відкриття" />}
                    </th>
                    <td className={sortField === 'bank' ? 'table-secondary fw-bold' : ''}>
                      {r.bank_links && r.bank_links.website ? (
                        <a className="text-decoration-none" href={r.bank_links.website} target="_blank">
                          {r.bank}
                        </a>
                      ) : (
                        <span>{r.bank}</span>
                      )}
                      {r.bank_links && r.bank_links.comment && (
                        <small title={r.bank_links.comment} className="ms-2">
                          <i className="fa-regular fa-circle-question" />
                        </small>
                      )}
                    </td>
                    <td className={sortField === 'vendor' ? 'table-secondary fw-bold' : ''}>
                      <VendorLogo vendor={r.vendor} />
                    </td>
                    <td className={sortField === 'card' ? 'table-secondary fw-bold' : ''}>{r.card}</td>
                    <td className={sortField === 'card_currency' ? 'table-secondary fw-bold' : ''}>{r.card_currency}</td>
                    <td className={sortField === 'bank_fee' ? 'table-secondary fw-bold' : ''}>{currency(r.bank_fee)}</td>
                    <td className={sortField === 'service' ? 'table-secondary fw-bold' : ''}>
                      {r.service_links && r.service_links.website ? (
                        <a className="text-decoration-none" href={r.service_links.website} target="_blank">
                          {r.service}
                        </a>
                      ) : (
                        <span>{r.service}</span>
                      )}
                      {r.service_links && r.service_links.comment && (
                        <small title={r.service_links.comment} className="ms-2">
                          <i className="fa-regular fa-circle-question" />
                        </small>
                      )}
                    </td>
                    <td className={sortField === 'service_currency' ? 'table-secondary fw-bold' : ''}>{r.service_currency}</td>
                    <td className={sortField === 'method' ? 'table-secondary fw-bold' : ''}>
                      <Method method={r.method} />
                    </td>
                    <td className={sortField === 'service_fee' ? 'table-secondary fw-bold' : ''}>{currency(r.service_fee)}</td>
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
                .filter((r) => !megatagCheckboxes[r.megatag])
                .filter((r) => !bankCheckboxes[r.bank])
                .filter((r) => !serviceCheckboxes[r.service])
                .filter((r) => !methodCheckboxes[r.method])
                .filter((r) => !srcCurrencyCheckboxes[r.card_currency])
                .filter((r) => !dstCurrencyCheckboxes[r.service_currency])
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
                .map((r, i) => [
                  <tr key={i}>
                    <td className={sortField === 'bank' ? 'table-secondary fw-bold' : ''}>
                      {r.bank_links ? (
                        <a className="text-decoration-none" href={r.bank_links.website} target="_blank">
                          {r.bank}
                        </a>
                      ) : (
                        r.bank
                      )}
                      <br />
                      <VendorLogo vendor={r.vendor} />
                      <br />
                      {r.card_currency}
                      <br />
                      Комісія: {currency(r.bank_fee)}%
                      <br />
                      {r.card}
                    </td>
                    <td className={sortField === 'service' ? 'table-secondary fw-bold' : ''}>
                      {r.service_links ? (
                        <a className="text-decoration-none" href={r.service_links.website} target="_blank">
                          {r.service}
                        </a>
                      ) : (
                        r.service
                      )}
                      <br />
                      <Method method={r.method} />
                      <br />
                      {r.service_currency}
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
                  </tr>,
                  r.comment && (
                    <tr>
                      <td className="text-secondary small" colSpan={3}>
                        {r.comment}
                      </td>
                    </tr>
                  ),
                ])}
            </tbody>
          </table>
        </div>

        <PaymentsFaq />
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>
            Збираємо відгуки про маршрути! <i className="fa-solid fa-heart text-danger" />
          </h2>
          <p>
            Якщо серед них є той, яким ви користуєтеся, будь ласка, відмітьте його, натиснувши відповідну кнопку <i className="fa-solid fa-heart text-danger" />. Ми прагнемо показати найпопулярніші
            маршрути, якими користуються наші учасники.
          </p>
          <p>
            Примітка: Після того, як ви проголосуєте за маршрут, має з'явитися повідомлення про успішне врахування вашого голосу. Зверніть увагу, що актуальна кількість голосів оновлюється лише кожні
            кілька хвилин. Це пов'язано з кешуванням даних у Google Sheets для оптимізації швидкості завантаження та зменшення вартості. Тому, якщо ви отримали повідомлення про зарахування голосу,
            можете бути впевнені, що ваш вибір враховано, навіть якщо зміни не відображаються відразу.
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
