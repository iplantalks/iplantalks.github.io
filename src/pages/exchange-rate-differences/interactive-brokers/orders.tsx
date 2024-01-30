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
}

export function parseOfx(text: string): Transaction[] {
  const xml = new DOMParser().parseFromString('<OFX>' + text.split('<OFX>').pop(), 'text/xml')

  const tickers = []
  for (const secinfo of Array.from(xml.querySelectorAll('SECLIST STOCKINFO'))) {
    tickers.push({
      id: secinfo.querySelector('SECID UNIQUEID')?.textContent,
      type: secinfo.querySelector('SECID UNIQUEIDTYPE')?.textContent,
      name: secinfo.querySelector('SECNAME')?.textContent,
      ticker: secinfo.querySelector('TICKER')?.textContent,
      fiid: secinfo.querySelector('FIID')?.textContent,
    })
  }

  const transactions: Transaction[] = []
  for (const transaction of Array.from(xml.querySelectorAll('INVSTMTRS INVTRANLIST BUYSTOCK, INVSTMTRS INVTRANLIST SELLSTOCK'))) {
    transactions.push({
      id: transaction.querySelector('FITID')?.textContent || '',
      type: transaction.querySelector('BUYTYPE, SELLTYPE')?.textContent || '',
      date: new Date(
        transaction
          .querySelector('DTTRADE')
          ?.textContent?.substring(0, 8)
          ?.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ''
      ),
      ticker: tickers.find((t) => t.id === transaction.querySelector('SECID UNIQUEID')?.textContent)?.ticker || '',
      shares: parseFloat(transaction.querySelector('UNITS')?.textContent || ''),
      price: parseFloat(transaction.querySelector('UNITPRICE')?.textContent || ''),
      commision: parseFloat(transaction.querySelector('COMMISSION')?.textContent || ''),

      spendUah: 0,
      valueUah: 0,
      incomeUah: 0,
      taxUah: 0,
      netIncomeUah: 0,
      exchangeRate: 0,
      currentPrice: 0,
    })
  }

  // console.table(transactions)
  return transactions
}

const Orders = () => {
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
    getExchangeRate(new Date()).then(setCurrentExchangeRate)
  }, [])

  const negative = useMemo(() => filtered.find((t) => t.netIncomeUah < 0), [filtered])

  const handle = (text: string) => {
    const transactions = parseOfx(text)
    setTransactions(transactions)

    for (const date of Array.from(new Set(transactions.map((t) => t.date)))) {
      getExchangeRate(date).then((exchangeRate) => {
        const next = [...transactions]
        next.forEach((t) => {
          if (t.date == date) {
            t.exchangeRate = exchangeRate
          }
          return t
        })
        setTransactions(next)
      })
    }

    for (const ticker of Array.from(new Set(transactions.map((t) => t.ticker)))) {
      getPrice(ticker).then((price) => {
        const next = [...transactions]
        next.forEach((t) => {
          if (t.ticker == ticker && price) {
            t.currentPrice = price
          }
          return t
        })
        setTransactions(next)
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
      <Hero title="Курсові різниці" subtitle="Розрахунок фінансових результатів з виписки Interactive Brokers" />

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
            <thead className="table-primary" style={{ position: 'sticky', top: 0 }}>
              <tr>
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
            </thead>
            <tbody className="table-group-divider">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.date.toISOString().split('T').shift()}</td>
                  <td>{t.ticker}</td>
                  <td>{t.shares}</td>
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
                <td>{filtered.reduce((acc, x) => acc + x.shares, 0)}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.price, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.currentPrice, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.commision, 0))}</td>
                <td></td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.spendUah, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.valueUah, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.incomeUah, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.taxUah, 0))}</td>
                <td>{currency(filtered.reduce((acc, x) => acc + x.netIncomeUah, 0))}</td>
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
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe />
      <Join />
    </main>
  )
}

export default Orders

export const Head: HeadFC = () => <title>Розрахунок поточних фінансових результатів з виписки Interactive Brokers</title>
