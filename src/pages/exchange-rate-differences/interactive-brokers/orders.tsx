import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC } from 'gatsby'
import '../../../styles/common.css'
import { currency } from '../../../utils/formatters'
import { getExchangeRate } from '../../../utils/exchange-rate'
import { getPrice } from '../../../utils/yahoo'
import statements from '../../../images/exchange-rate-differences/statements.png'
import msmoney from '../../../images/exchange-rate-differences/msmoney.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import Hero from '../../../components/hero'
import ExchangeRateDifferencesLinks from '../../../components/exchange-rate-differences-links'
import Subscribe from '../../../components/subscribe'
import { Shop } from '../../../components/shop'
import { OFX, parseMsMoneyOfxReport } from '../../../utils/ibkr/ofx'
import { Header } from '../../../components/header'

interface Transaction {
  id: string
  type: string
  date: Date
  ticker: string
  shares: number
  price: number
  commision: number

  spendUah: number
  valueUah: number
  incomeUah: number
  taxUah: number
  netIncomeUah: number
  exchangeRate: number
  currentPrice: number

  sharesOriginal: number
}

const Orders = () => {
  const [messages, setMessages] = useState<string[]>([])
  const appendMessage = (message: string) => setMessages((prev) => [...prev, message])
  const [ofx, setOfx] = useState<OFX>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentExchangeRate, setCurrentExchangeRate] = useState(0)

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'BUY')
      .map((transaction): Transaction => {
        const spendUah = transaction.shares * transaction.price * transaction.exchangeRate
        const valueUah = transaction.shares * transaction.currentPrice * currentExchangeRate
        const incomeUah = valueUah - spendUah
        const taxUah = incomeUah > 0 ? incomeUah * 0.195 : 0
        const netIncomeUah = incomeUah - taxUah
        return {
          ...transaction,
          spendUah,
          valueUah,
          incomeUah,
          taxUah,
          netIncomeUah,
        }
      })
  }, [transactions, currentExchangeRate])

  useEffect(() => {
    getExchangeRate(new Date()).then((exchangeRate) => {
      appendMessage(`Курс на сьогодні: ${exchangeRate}`)
      setCurrentExchangeRate(exchangeRate)
    })
  }, [])

  const negative = useMemo(() => filtered.find((t) => t.netIncomeUah < 0), [filtered])

  const handle = (text: string) => {
    const ofx = parseMsMoneyOfxReport(text)
    appendMessage(`Звіт зчитано, знайдено ${ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.length} покупок`)
    setOfx(ofx)

    const transactions: Transaction[] =
      ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.map((t) => ({
        id: t.INVBUY.INVTRAN.FITID || '',
        type: t.BUYTYPE || '',
        date: new Date(t.INVBUY.INVTRAN.DTTRADE?.substring(0, 8)?.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''),
        ticker:
          ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.find((s) => t.INVBUY.SECID.UNIQUEID === s.SECINFO.SECID.UNIQUEID && t.INVBUY.SECID.UNIQUEIDTYPE === s.SECINFO.SECID.UNIQUEIDTYPE)?.SECINFO?.TICKER ||
          '',
        shares: t.INVBUY.UNITS || 0,
        price: t.INVBUY.UNITPRICE, // parseFloat(transaction.querySelector('UNITPRICE')?.textContent || ''),
        commision: t.INVBUY.COMMISSION || 0, // parseFloat(transaction.querySelector('COMMISSION')?.textContent || ''),

        spendUah: 0,
        valueUah: 0,
        incomeUah: 0,
        taxUah: 0,
        netIncomeUah: 0,
        exchangeRate: 0,
        currentPrice: 0,

        sharesOriginal: t.INVBUY.UNITS || 0,
      })) || []
    setTransactions(transactions)

    for (const date of Array.from(new Set(transactions.map((t) => t.date)))) {
      getExchangeRate(date)
        .then((exchangeRate) => {
          const next = [...transactions]
          next.forEach((t) => {
            if (t.date == date) {
              t.exchangeRate = exchangeRate
            }
            return t
          })
          appendMessage(`✅ Курс на ${date.toISOString().split('T').shift()}: ${exchangeRate}`)
          setTransactions(next)
        })
        .catch((error) => {
          appendMessage(`❌ Помилка отримання курсу на ${date.toISOString().split('T').shift()}: ${error.message || error}`)
        })
    }

    for (const ticker of Array.from(new Set(transactions.map((t) => t.ticker)))) {
      getPrice(ticker)
        .then((price) => {
          const next = [...transactions]
          next.forEach((t) => {
            if (t.ticker == ticker && price) {
              t.currentPrice = price
            }
            return t
          })
          appendMessage(`✅ Ціна ${ticker} на сьогодні: ${price}`)
          setTransactions(next)
        })
        .catch((error) => {
          appendMessage(`❌ Помилка отримання ціни ${ticker}: ${error.message || error}`)
        })
    }
  }

  const handleFileChoosen = async (file: File) => {
    const text = await file.text()
    handle(text)
  }

  useEffect(() => {
    fetch('/exchange-rate-differences/interactive-brokers/orders/sample.ofx')
      .then((res) => res.text())
      .then(handle)
  }, [])

  return (
    <main>
      <Header />
      {/* <Hero title="Курсові різниці" subtitle="Розрахунок фінансових результатів з виписки Interactive Brokers" /> */}

      <div className="container py-5">
        <p>Мета цього звіту &mdash; подивитися на свої активи в розрізі курсових різниць.</p>
        <p>Адже можлива ситуація коли ми матимемо збиток у долларах, але після перерахунку у гривні - буде плюс, який повинен бути оподаткованим.</p>

        <div className="row">
          <p className="col-12 col-sm-6">
            <label htmlFor="ofx" className="form-label">
              Звіт MS Money{' '}
              <a href="sample.ofx" download>
                приклад
              </a>
            </label>
            <input id="ofx" className="form-control" type="file" accept=".ofx" onChange={(e) => handleFileChoosen(e.target.files![0])} />
          </p>
        </div>
        <details className="my-3">
          <summary>Покрокова інструкція &mdash; як сформувати звіт</summary>
          <p>
            Переходимо на сторінку <b>Statements</b> розділу <b>Performance & Reports</b>
          </p>
          <p>
            <img src={statements} style={{ maxWidth: '50vw' }} />
          </p>
          <p>
            Зправа, знизу, буде кнопка для формування звіту <b>MS Money</b>
          </p>
          <p>
            <img src={msmoney} style={{ maxWidth: '50vw' }} />
          </p>
          <p>Зʼявиться віконце для вибору дат, за якими буде сформовано звіт. Виберіть, приблизні, дати коли ви купляли будь які акції</p>
          <p>
            <img src={popup} style={{ maxWidth: '50vw' }} />
          </p>
        </details>
        {transactions.length > 0 && (
          <table className="table table-striped table-sm">
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr className="table-dark">
                <th className="fw-normal">Дата</th>
                <th className="fw-normal">Тікер</th>
                <th className="fw-normal">Кількість</th>
                <th className="fw-normal">
                  Ціна покупки <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Поточна ціна <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Комісія <span className="opacity-50">$</span>
                </th>
                <th className="fw-normal">
                  Курс <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Інвестовано <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Поточна вартість <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">
                  Фін. результат брутто <span className="opacity-50">грн</span>
                </th>
                <th className="fw-normal">Податок</th>
                <th className="fw-normal">
                  Фін. результат нетто <span className="opacity-50">грн</span>
                </th>
              </tr>
              <tr className="table-secondary">
                <td>Разом</td>
                <td></td>
                <td></td>
                <td>{currency(filtered.map((f) => f.price).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.currentPrice).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.commision).reduce((a, b) => a + b, 0))}</td>
                <td></td>
                <td>{currency(filtered.map((f) => f.spendUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.valueUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.incomeUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.taxUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.netIncomeUah).reduce((a, b) => a + b, 0))}</td>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.date.toISOString().split('T').shift()}</td>
                  <td>{t.ticker}</td>
                  <td>
                    {/* {t.shares} */}
                    <input
                      type="number"
                      min="0"
                      max={t.sharesOriginal}
                      step="1"
                      value={t.shares}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((x) =>
                            x.id === t.id ? { ...x, shares: e.target.valueAsNumber > t.sharesOriginal ? t.sharesOriginal : e.target.valueAsNumber < 0 ? 0 : e.target.valueAsNumber } : x
                          )
                        )
                      }
                    />
                    {/* <input
                      type="range"
                      min="0"
                      max={t.shares}
                      step="1"
                      value={t.sell}
                      onChange={(e) => setTransactions(transactions.map((x) => (x.id === t.id ? { ...x, sell: e.target.valueAsNumber } : x)))}
                    /> */}
                  </td>
                  <td>{currency(t.price)}</td>
                  <td>{currency(t.currentPrice)}</td>
                  <td>{currency(t.commision)}</td>
                  <td>{currency(t.exchangeRate)}</td>
                  <td>{currency(t.spendUah)}</td>
                  <td>{currency(t.valueUah)}</td>
                  <td className={t.incomeUah < 0 ? 'text-danger' : ''}>{currency(t.incomeUah)}</td>
                  <td>{currency(t.taxUah)}</td>
                  <td className={t.netIncomeUah < 0 ? 'text-danger' : ''}>{currency(t.netIncomeUah)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-group-divider table-secondary">
              <tr>
                <td>Разом</td>
                <td></td>
                <td></td>
                <td>{currency(filtered.map((f) => f.price).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.currentPrice).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.commision).reduce((a, b) => a + b, 0))}</td>
                <td></td>
                <td>{currency(filtered.map((f) => f.spendUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.valueUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.incomeUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.taxUah).reduce((a, b) => a + b, 0))}</td>
                <td>{currency(filtered.map((f) => f.netIncomeUah).reduce((a, b) => a + b, 0))}</td>
              </tr>
            </tfoot>
          </table>
        )}
        {negative && (
          <p>
            Так наприклад {negative.ticker} куплений {negative.date.toISOString().split('T').shift()} на разі має негативний результат{' '}
            <span className="text-danger">{currency(negative.netIncomeUah)} грн</span>, навіть з урахуванням курсових різниць.
          </p>
        )}
        <p>Важливо - цей калькулятор рахує курсові різниці для всіх активів куплених у звітний період без урахування продажів, коммісій тощо, метою є саме розрахунок курсових різниць</p>

        <details>
          <summary>Деталі звіту</summary>
          <p>За для перевірки розхідностей, ось деяка інформація що зможе допомогти</p>
          <p>Кількість тікерів у звіті: {ofx?.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.length || 0}</p>
          <p>Кількість позицій у портфелі: {ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSSTOCK?.length || 0}</p>
          <p>Кількість покупок: {ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK?.length || 0}</p>
          <p>
            За для ще більших деталей ось, усі покупки що є всередині звіту. Тут ідея така - якщо шукома покупка є в середині звіту і не відображається у табличці - то це десь наш косяк і його можна і
            потрібно виправити, якщо ж шукомої покупки нема в самому звіті то і в табличці вона не зʼявиться і потрібно формувати інший звіт за інший період.
          </p>
          <details>
            <summary>Покупки</summary>
            <code>
              <pre>{JSON.stringify(ofx?.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.BUYSTOCK, null, 4)}</pre>
            </code>
          </details>
        </details>

        {messages.length > 0 && (
          <details>
            <summary>Повідомлення</summary>
            <ul>
              {messages.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe youtube="https://www.youtube.com/watch?v=Fiylm8c8yAc" />
      <Shop />
      <Join />
    </main>
  )
}

export default Orders

export const Head: HeadFC = () => <title>Розрахунок поточних фінансових результатів з виписки Interactive Brokers</title>
