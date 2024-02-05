import * as React from 'react'
import { useState, useMemo } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import { currency } from '../../utils/formatters'
import ibkr from '../../images/interactive-brokers.svg'
import { Bank, VendorLogo, useBanks } from './components/_banks'
import { PaymentSystem, usePaymentSystems } from './components/_payment-systems'
import { Links, useBankLinks, usePaymentSystemLinks, useYouTubeLinks } from './components/_links'
import Join from '../../components/join'
import Hero from '../../components/hero'
import howitworks from './howitworks.svg'

const ANY_BANK = 'Банк'
const ANY_PAMYNET_SYSTEM = 'Платіжка'

export interface Row {
  key: string
  bank: Bank
  paymentSystem: PaymentSystem
}

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

const PaymentSystemsPage: React.FC<PageProps> = () => {
  const [transfer, setTransfer] = useState<number>(1000)
  const banks = useBanks()
  const paymentSystems = usePaymentSystems()
  const youTubeLinks = useYouTubeLinks()
  const bankLinks = useBankLinks()
  const paymentSystemLinks = usePaymentSystemLinks()

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
      rows.push({ key, bank, paymentSystem })
    }
    return rows
  }, [banks, paymentSystems])

  return (
    <main>
      <Hero title="Платіжні системи" subtitle="Поповнюємо Interactive Brokers ефективно" youtube="https://www.youtube.com/watch?v=n33PF4_PYg8" />

      <div className="container py-5">
        <h2>Як це працює</h2>
        <p>На разі прямі SWIFT перекази не можливі, отже маємо використовувати проміжні платіжні шлюзи. Проходячи шляш, з нашого платежу утримуватимуть комісію як банк так и платіжна система.</p>
        <p>За для наглядності ось один з можливих маршрутів платужи</p>
        <p>
          <img src={howitworks} alt="Як це працює" className="w-100" />
        </p>
        <p>Як бачимо, спочатку свою комісії забере Wise, потім Приват забере свою комісію з суми, що має бути переведена у Wise.</p>

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

        <p>Оскільки на разі прямі SWIFT перекази не можливі ми будемо використовувати одну з доступних платіжних систем</p>

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
              <th>
                Комісія <span className="text-secondary">$</span>
              </th>
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
              .filter((r) => r.feepct > 0 || r.feeusd > 0)
              .map((r) => ({ ...r, pay: transfer + transfer * (r.feepct / 100) + r.feeusd }))
              .map((r, i, arr) => (
                <tr key={r.key}>
                  <td className="px-4">{r.name}</td>
                  <td>{r.method}</td>
                  <td>{currency(r.feeusd)}</td>
                  <td>{currency(r.feepct)}</td>
                  <th
                    className={'table-secondary ' + (r.pay === Math.min(...arr.map((a) => a.pay)) ? 'text-success' : '')}
                    title={`${currency(transfer)} + ${currency((transfer * r.feepct) / 100)} + ${currency(r.feeusd)}`}
                  >
                    {currency(r.pay)}
                  </th>
                  <td className={r.limitmonth && r.pay > r.limitmonth ? 'text-danger' : ''}>{currency(r.limitmonth || Infinity)}</td>
                  <td className={r.limitday && r.pay > r.limitday ? 'text-danger' : ''}>{currency(r.limitday || Infinity)}</td>
                  <td className={r.limit && r.pay > r.limit ? 'text-danger' : ''}>{currency(r.limit || Infinity)}</td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
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
              <b>Комісії</b> - в залежності від вибраної платіжної системи та методу залежать комісії, також слід врахувати, що у деяких випадках комісії можут вираховуватися як процент від суми, а в
              деяких бути фіксованими, саме тому маємо дві окремі колонки, за для більш прозорого розуміння.
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

        {selectedPaymentSystemOption !== ANY_PAMYNET_SYSTEM && youTubeLinks.find((y) => y.paymentSystem === selectedPaymentSystemOption) && (
          <div className="mb-3">
            <h2>Відео</h2>
            <div className="row">
              {youTubeLinks.find((y) => y.paymentSystem === selectedPaymentSystemOption)?.register && (
                <div className="col-12 col-md-6">
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={'https://www.youtube.com/embed/' + new URL(youTubeLinks.find((y) => y.paymentSystem === selectedPaymentSystemOption)!.register).searchParams.get('v')}
                      title="YouTube video"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              {youTubeLinks.find((y) => y.paymentSystem === selectedPaymentSystemOption)?.transfer && (
                <div className="col-12 col-md-6">
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={'https://www.youtube.com/embed/' + new URL(youTubeLinks.find((y) => y.paymentSystem === selectedPaymentSystemOption)!.transfer).searchParams.get('v')}
                      title="YouTube video"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <p>Переводити кошти будемо з валютного рахунку нашого банку. Наразі перевіреними є наступні банки.</p>
        <p>Також слід врахувати, що переводити ми вже будемо суму з урахуванням комісій платіжного шлюзу.</p>

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
              <th>
                Комісія <span className="text-secondary">$</span>
              </th>
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
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {rows
              .map((r) => ({ ...r, before: transfer + transfer * (r.paymentSystem.feepct / 100) + r.paymentSystem.feeusd }))
              .map((r) => ({ ...r, pay: r.before + r.bank.feeusd + r.before * (r.bank.feepct / 100) }))
              .map((r, i, arr) => (
                <tr key={r.key}>
                  <td className="px-4">{r.bank.name}</td>
                  <td>{r.paymentSystem.name}</td>
                  <td>
                    <VendorLogo vendor={r.bank.vendor} />
                  </td>
                  <td>{r.bank.method}</td>
                  <td>{currency(r.bank.feeusd || 0)}</td>
                  <td>{currency(r.bank.feepct || 0)}</td>
                  <th
                    className={'table-secondary ' + (r.pay === Math.min(...arr.map((a) => a.pay)) ? 'text-success' : '')}
                    title={`Сума з урахуванням комісії платіжки + комісія банку = ${currency(r.before)} + ${currency(r.before * (r.bank.feepct / 100))} + ${currency(r.bank.feeusd)}`}
                  >
                    {currency(r.pay)}
                  </th>
                  <td className={r.bank.limitmonth && r.pay > r.bank.limitmonth ? 'text-danger' : ''}>{currency(r.bank.limitmonth || Infinity)}</td>
                  <td className={r.bank.limitday && r.pay > r.bank.limitday ? 'text-danger' : ''}>{currency(r.bank.limitday || Infinity)}</td>
                  <td className={r.bank.limit && r.pay > r.bank.limit ? 'text-danger' : ''}>{currency(r.bank.limit || Infinity)}</td>
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

        <h2>Посилання</h2>
        <ul>
          <li>
            <b>Сайти</b>
            <ul>
              {([] as Links[])
                .concat(bankLinks, paymentSystemLinks)
                .filter((l) => !!l.webiste)
                .map((link, i) => (
                  <li key={`wl` + i}>
                    <a href={link.webiste} target="_blank">
                      {link.name}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
          <li>
            <b>Комісії</b>
            <ul className="my-0">
              {([] as Links[])
                .concat(bankLinks, paymentSystemLinks)
                .filter((l) => !!l.fees)
                .map((link, i) => (
                  <li key={`fl` + i}>
                    <a href={link.fees} target="_blank">
                      {link.name}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
          <li>
            <b>Ліміти</b>
            <ul className="my-0">
              {([] as Links[])
                .concat(bankLinks, paymentSystemLinks)
                .filter((l) => !!l.limits)
                .map((link, i) => (
                  <li key={`ll` + i}>
                    <a href={link.limits} target="_blank">
                      {link.name}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
        </ul>
      </div>

      <Join />
    </main>
  )
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
