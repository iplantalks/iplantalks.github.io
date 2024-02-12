import * as React from 'react'
import { useState, useMemo } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import { currency } from '../../utils/formatters'
import ibkr from '../../images/interactive-brokers.svg'
import { Bank, VendorLogo, useBanks } from './components/_banks'
import { PaymentSystem, usePaymentSystems } from './components/_payment-systems'
import Join from '../../components/join'
import Hero from '../../components/hero'
import { SheetLink, useBankLinks, usePaymentSystemLinks } from './components/_links'
import { useVideoLinks } from './components/_videos'

const ANY_BANK = 'Банк'
const ANY_PAMYNET_SYSTEM = 'Платіжка'

export interface Row {
  key: string
  bank: Bank
  paymentSystem: PaymentSystem
  bankLink?: SheetLink
  paymentSystemLink?: SheetLink
}

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
    ['неділю', 'неділь', 'неділь'],
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

const PaymentSystemsPage: React.FC<PageProps> = () => {
  const [transfer, setTransfer] = useState<number>(1000)
  const banks = useBanks()
  const paymentSystems = usePaymentSystems()
  const bankLinks = useBankLinks()
  const paymentSystemLinks = usePaymentSystemLinks()
  const videoLinks = useVideoLinks()

  const bankOptions = useMemo(() => [ANY_BANK].concat(getUniqueValues(banks, 'name')), [banks])
  const [selectedBankOption, setSelectedBankOption] = useState<string>(ANY_BANK)

  const paymentSystemOptions = useMemo(() => [ANY_PAMYNET_SYSTEM].concat(getUniqueValues(paymentSystems, 'name')), [paymentSystems])
  const [selectedPaymentSystemOption, setSelectedPaymentSystemOption] = useState<string>(ANY_PAMYNET_SYSTEM)

  const rows = useMemo<Row[]>(() => {
    const rows: Row[] = []
    for (const bank of banks) {
      if (selectedBankOption !== ANY_BANK && bank.name !== selectedBankOption) {
        continue
      }
      if (selectedPaymentSystemOption !== ANY_PAMYNET_SYSTEM && bank.paymentSystem !== selectedPaymentSystemOption) {
        continue
      }
      const key = bank.key.replace('b', 'r')
      const paymentSystem = paymentSystems.find((p) => p.name === bank.paymentSystem && p.method === bank.method)
      if (!paymentSystem) {
        continue
      }
      const bankLink = bankLinks.find((l) => l.name === bank.name)
      const paymentSystemLink = paymentSystemLinks.find((l) => l.name === paymentSystem.name)
      rows.push({ key, bank, paymentSystem, bankLink, paymentSystemLink })
    }
    return rows
  }, [banks, paymentSystems, bankLinks, paymentSystemLinks])

  const videoLinkCategories = useMemo(() => Array.from(new Set(videoLinks.map((l) => l.category))), [videoLinks])

  return (
    <main>
      <Hero title="Платіжні системи" subtitle="Поповнюємо Interactive Brokers ефективно" youtube="https://www.youtube.com/watch?v=n33PF4_PYg8" />

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

        <table className="table">
          <thead>
            <tr>
              <th>
                <select className="form-select" value={selectedPaymentSystemOption} onChange={(e) => setSelectedPaymentSystemOption(e.target.value)}>
                  {paymentSystemOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </th>
              <th>Метод</th>
              <th>Валюта</th>
              <th>
                Комісія <span className="text-secondary">%</span>
              </th>
              <th>
                До сплати <span className="text-secondary">$</span>
              </th>
              <th>
                Ліміт на місяць <span className="text-secondary">$</span>
              </th>
              <th>
                Ліміт на день <span className="text-secondary">$</span>
              </th>
              <th>
                Разовий ліміт <span className="text-secondary">$</span>
              </th>
              <th>Перевірено</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {paymentSystems
              .filter((r) => r.feepct > 0)
              .filter((r) => selectedPaymentSystemOption === ANY_PAMYNET_SYSTEM || r.name === selectedPaymentSystemOption)
              .map((r) => ({ ...r, pay: transfer + transfer * (r.feepct / 100), link: paymentSystemLinks.find((l) => l.name === r.name) }))
              .map((r, i, arr) => (
                <tr key={r.key}>
                  <td className="px-4">
                    {r.link ? (
                      <a className="text-decoration-none" href={r.link.website} target="_blank">
                        {r.name}
                      </a>
                    ) : (
                      r.name
                    )}
                  </td>
                  <td>{r.method}</td>
                  <td>{r.currency}</td>
                  <td>
                    {r.link && r.link.fees ? (
                      <a className="text-decoration-none" href={r.link.fees} target="_blank">
                        {currency(r.feepct)}
                      </a>
                    ) : (
                      currency(r.feepct)
                    )}
                  </td>
                  <th className={'table-secondary ' + (r.pay === Math.min(...arr.map((a) => a.pay)) ? 'text-success' : '')} title={`${currency(transfer)} + ${currency((transfer * r.feepct) / 100)}`}>
                    {currency(r.pay)}
                  </th>
                  <td className={r.limitmonth && r.pay > r.limitmonth ? 'text-danger' : ''}>{currency(r.limitmonth || Infinity)}</td>
                  <td className={r.limitday && r.pay > r.limitday ? 'text-danger' : ''}>{currency(r.limitday || Infinity)}</td>
                  <td className={r.limit && r.pay > r.limit ? 'text-danger' : ''}>{currency(r.limit || Infinity)}</td>
                  <td title={r.date ? new Date(r.date).toLocaleDateString() : ''}>{r.date ? ago(new Date(r.date)) : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <details className="mb-3">
          <summary>Пояснення</summary>
          <ul className="mt-3">
            <li>
              <b>Платіжка</b> - одна з доступних платіжних систем через яку, на разі, можна завести кошти в Interactive Brokers.
            </li>
            <li>
              <b>Метод</b> - у різних платіжок можут бути різні методи переказу з різними комісіями, так наприклад, на сьогодні, найдешевшим є переказ через Wise використовуючи Google Pay.
            </li>
            <li>
              <b>Комісії</b> - в залежності від вибраної платіжної системи, методу та суми залежитиме загальна сума.
            </li>
            <li>
              <b>Ліміти</b> - як правило в будь яких системах є ліміти. Ліміти ці можуть бути разовими, на добу або місяць. В таблиці виводимо їх усі за для наглядної фільтрації.
            </li>
            <li>
              <b>Дата</b> - дата останьої підтверженої перевірки одним з планерів або участників iTalks з підтверженням.
            </li>
          </ul>
        </details>

        <details className="mb-3">
          <summary>Коментарі</summary>
          <ul className="mt-3">
            {paymentSystems
              .filter((r) => !!r.comment)
              .map((r, i) => (
                <li key={`psc` + i}>
                  <b>
                    {r.name} - {r.method}
                  </b>{' '}
                  - {r.comment}
                </li>
              ))}
          </ul>
        </details>

        <p>Переводити кошти будемо з валютного рахунку нашого банку. Наразі перевіреними є наступні банки.</p>

        <table className="table">
          <thead>
            <tr>
              <th>
                <select className="form-select" value={selectedBankOption} onChange={(e) => setSelectedBankOption(e.target.value)}>
                  {bankOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </th>
              <th>Платіжка</th>
              <th>Вендор</th>
              <th>Метод</th>
              <th>Валюта</th>
              <th>
                Комісія <span className="text-secondary">%</span>
              </th>
              <th>
                До сплати <span className="text-secondary">$</span>
              </th>
              <th>
                Ліміт на місяць <span className="text-secondary">$</span>
              </th>
              <th>
                Ліміт на день <span className="text-secondary">$</span>
              </th>
              <th>
                Ліміт <span className="text-secondary">$</span>
              </th>
              <th>Перевірено</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {rows
              .map((r) => ({ ...r, before: transfer + transfer * (r.paymentSystem.feepct / 100) }))
              .map((r) => ({ ...r, pay: r.before + r.before * (r.bank.feepct / 100) }))
              .map((r, i, arr) => (
                <tr key={r.key}>
                  <td className="px-4">
                    {r.bankLink ? (
                      <a className="text-decoration-none" href={r.bankLink.website} target="_blank">
                        {r.bank.name}
                      </a>
                    ) : (
                      r.bank.name
                    )}
                  </td>
                  <td>
                    {r.paymentSystemLink ? (
                      <a className="text-decoration-none" href={r.paymentSystemLink.website} target="_blank">
                        {r.paymentSystem.name}
                      </a>
                    ) : (
                      r.paymentSystem.name
                    )}
                  </td>
                  <td>
                    <VendorLogo vendor={r.bank.vendor} />
                  </td>
                  <td>{r.bank.method}</td>
                  <td>{r.bank.currency}</td>
                  <td>
                    {r.bankLink && r.bankLink.fees ? (
                      <a className="text-decoration-none" href={r.bankLink.fees} target="_blank">
                        {currency(r.bank.feepct || 0)}
                      </a>
                    ) : (
                      currency(r.bank.feepct || 0)
                    )}
                  </td>
                  <th
                    className={'table-secondary ' + (r.pay === Math.min(...arr.map((a) => a.pay)) ? 'text-success' : '')}
                    title={`Сума з урахуванням комісії платіжки + комісія банку = ${currency(r.before)} + ${currency(r.before * (r.bank.feepct / 100))}`}
                  >
                    {currency(r.pay)}
                  </th>
                  <td className={r.bank.limitmonth && r.pay > r.bank.limitmonth ? 'text-danger' : ''}>{currency(r.bank.limitmonth || Infinity)}</td>
                  <td className={r.bank.limitday && r.pay > r.bank.limitday ? 'text-danger' : ''}>{currency(r.bank.limitday || Infinity)}</td>
                  <td className={r.bank.limit && r.pay > r.bank.limit ? 'text-danger' : ''}>{currency(r.bank.limit || Infinity)}</td>
                  <td title={r.bank.date?.toLocaleDateString()}>{r.bank.date ? ago(r.bank.date) : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <details className="mb-3">
          <summary>Пояснення</summary>
          <ul className="mt-3">
            <li>
              <b>Банк</b> - один з банків де є підтвержений платіж з підтверженими комісіями.
            </li>
            <li>
              <b>Платіжка</b> - платіжна система через яку поповнюємо Interactive Brokers, див. попередню таблицю.
            </li>
            <li>
              <b>Вендор</b> - Visa та MasterCard можуть мати різні комісії.
            </li>
            <li>
              <b>Метод</b> - метед переказу, що використовуватимемо.
            </li>
            <li>
              <b>Комісії</b> - що утримає банк за переказ коштів. Важливо не забути, що комісія утримуватиметься з суми яку очікує платіжка.
            </li>
            <li>
              <b>Ліміти</b> - банка, маємо враховувати не тільки ліміти платіжних шлюзів, а і банків.
            </li>
          </ul>
        </details>

        <details className="mb-3">
          <summary>Коментарі</summary>
          <ul className="mt-3">
            {banks
              .filter((r) => !!r.comment)
              .map((r, i) => (
                <li key={`psc` + i}>
                  <b>
                    {r.name} - {r.method}
                  </b>{' '}
                  - {r.comment}
                </li>
              ))}
          </ul>
        </details>
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Корисні відео</h2>
          <p>Підбірка корисних відео щодо банків та платіжних систем.</p>
          {/* {JSON.stringify(videoLinkCategories)} */}

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

      <Join />
    </main>
  )
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
