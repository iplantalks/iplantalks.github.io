import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC } from 'gatsby'
import '../../../styles/common.css'
import Chart, { CoreChartOptions } from 'chart.js/auto'
import { currency } from '../../../utils/formatters'
import { getExchangeRate } from '../../../utils/exchange-rate'
import statements from '../../../images/exchange-rate-differences/statements.png'
import msmoney from '../../../images/exchange-rate-differences/msmoney.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import Hero from '../../../components/hero'
import ExchangeRateDifferencesLinks from '../../../components/exchange-rate-differences-links'
import Subscribe from '../../../components/subscribe'
import { findSecurityInfo, parseMsMoneyOfxReport, parseOfxDateTime } from '../../../utils/ibkr/ofx'

interface Row {
  id: string
  date: Date
  ticker: string
  name: string
  income: number
  tax: number
  netIncome: number
  exchangeRate: number
  incomeUah: number
  taxUah: number
  netIncomeUah: number
  metadata: {
    income: {
      date: string
      memo?: string
      amount: number
      price: number
      units: number
    }
    tax: {
      date: string
      memo?: string
      amount: number
      price: number
      rate: number
    }
  }
}

const CalendarMonth = ({ month, rows }: { month: number; rows: Row[] }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const income = rows
    .filter((row) => row.date.getMonth() === month)
    .map((row) => row.income)
    .reduce((a, b) => a + b, 0)
  return (
    <div className="card">
      <div className="card-header text-center">{months[month]}</div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item text-center">{income > 0 ? currency(income) : '-'}</li>
      </ul>
    </div>
  )
}

const Calendar = ({ rows }: { rows: Row[] }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  return (
    <div className="row">
      {numbers.map((month) => (
        <div className="col-4 mb-3">
          <CalendarMonth month={month} rows={rows} />
        </div>
      ))}
    </div>
  )
}

const Dividends = () => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = useState<Chart>()

  const [rows, setRows] = useState<Row[]>([])

  const handle = (text: string) => {
    const ofx = parseMsMoneyOfxReport(text)

    const rows: Row[] = []
    for (const income of ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.INCOME || []) {
      if (income.INCOMETYPE !== 'DIV') {
        continue
      }
      const ticker = findSecurityInfo(ofx, income.SECID)
      if (!ticker || !ticker.TICKER || !ticker.SECNAME) {
        continue
      }
      const tax = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.INVBANKTRAN?.find(
        (t) => t.STMTTRN.TRNTYPE === 'OTHER' && t.STMTTRN.MEMO?.startsWith(ticker.TICKER + '(') && t.STMTTRN.DTPOSTED.split('.').pop() === income.INVTRAN.DTTRADE.split('.').pop()
      )
      if (!tax) {
        continue
      }
      const price = parseFloat(income.INVTRAN.MEMO?.split(' CASH DIVIDEND USD ').pop()?.split(' PER SHARE').shift() || '')
      rows.push({
        id: income.INVTRAN.FITID,
        date: parseOfxDateTime(income.INVTRAN.DTTRADE),
        ticker: ticker.TICKER,
        name: ticker.SECNAME,
        income: income.TOTAL,
        tax: tax.STMTTRN.TRNAMT,
        netIncome: income.TOTAL + (tax?.STMTTRN.TRNAMT || 0),
        exchangeRate: 0,
        incomeUah: 0,
        taxUah: 0,
        netIncomeUah: 0,
        metadata: {
          income: {
            date: income.INVTRAN.DTTRADE,
            memo: income.INVTRAN.MEMO,
            amount: income.TOTAL,
            price: price,
            units: income.TOTAL / price,
          },
          tax: {
            date: tax.STMTTRN.DTPOSTED,
            memo: tax.STMTTRN.MEMO,
            amount: tax.STMTTRN.TRNAMT,
            rate: (Math.abs(tax.STMTTRN.TRNAMT || 0) / income.TOTAL) * 100,
            price: parseFloat(tax.STMTTRN.MEMO?.split(' CASH DIVIDEND USD ').pop()?.split(' PER SHARE').shift() || ''),
          },
        },
      })
    }

    for (const date of Array.from(new Set(rows.map((t) => t.date)))) {
      getExchangeRate(date).then((exchangeRate) => {
        const next = [...rows]
        next.forEach((t) => {
          if (t.date == date) {
            t.exchangeRate = exchangeRate
            t.incomeUah = t.netIncome * exchangeRate
            t.taxUah = t.incomeUah * 0.195
            t.netIncomeUah = t.incomeUah - t.taxUah
          }
          return t
        })
        setRows(next)
      })
    }

    setRows(rows)
    //console.table(rows)
    //console.log(rows)
  }

  const handleFileChoosen = async (file: File) => {
    const text = await file.text()
    handle(text)
  }

  useEffect(() => {
    fetch('/exchange-rate-differences/interactive-brokers/dividends/sample.ofx')
      .then((res) => res.text())
      .then(handle)
  }, [])

  useEffect(() => {
    if (!chartRef.current) {
      console.log('no chart ref')
      return
    }

    const chart = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['ticker 1', 'ticker 2', 'ticker 3'],
        datasets: [
          {
            label: 'dividends',
            data: [33, 33, 100],
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        animations: {},
        plugins: {
          title: {
            display: true,
            text: 'Дохідність активів',
          },
          legend: {
            position: 'top',
          },
        },
      },
    })

    console.log('setChart', chart)
    setChart(chart as unknown as Chart)
  }, [])

  useEffect(() => {
    if (!chart || !rows.length) {
      return
    }
    chart.data.labels = Array.from(new Set(rows.map((row) => row.ticker)))
    chart.data.datasets[0].data = []
    for (const ticker of chart.data.labels) {
      const sum = rows
        .filter((row) => row.ticker === ticker)
        .map((row) => row.income)
        .reduce((a, b) => a + b, 0)
      chart.data.datasets[0].data.push(sum)
    }
    chart.update()
  }, [chart, rows])

  return (
    <main>
      <Hero title="Курсові різниці" subtitle="Розрахунок податкових забовʼязань по дивідендам з виписки Interactive Brokers з урахуванням курсових різниць" />

      <div className="container py-5">
        <p>З дивідендів, що виплачувалися впродовж року, мусимо сплатити податки на прикінці звітного періоду, але як та де швиденько подивитися картину в цілому?</p>
        <p>Саме це і є метою ціеї сторінки, вивантажте звіт msmoney за потрібний період, та подивіться на розрахунки.</p>

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
        {rows.length && (
          <table className="table table-striped table-sm">
            <thead className="table-primary" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th title="Дата" className="fw-normal">
                  date
                </th>
                <th title="Ticker акції" className="fw-normal">
                  ticker
                </th>
                <th title="Нарахування за кожну акцію" className="fw-normal">
                  price <span className="text-secondary">$</span>
                </th>
                <th title="Розрахована кількість акцій units = income / price" className="fw-normal">
                  units
                </th>
                <th title="Нарахування у даларах" className="fw-normal">
                  income <span className="text-secondary">$</span>
                </th>
                <th title="Утримано податків зі сторони IBKR на користь США у доларах" className="fw-normal">
                  tax <span className="text-secondary">$</span>
                </th>
                <th title="Нараховано чистими після податку США у доларах" className="fw-normal">
                  net income <span className="text-secondary">$</span>
                </th>
                <th title="Курс НБУ на дату нарахування" className="fw-normal">
                  usd/uah
                </th>
                <th title="Нараховано у гривні, після сплати податку США" className="fw-normal">
                  income <span className="text-secondary">&#8372;</span>
                </th>
                <th title="Подакток України - 19.5%" className="fw-normal">
                  tax <span className="text-secondary">&#8372;</span>
                </th>
                <th title="Фін. результат чистими, після сплати всіх податків у гривні" className="fw-normal">
                  net income <span className="text-secondary">&#8372;</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td title={row.metadata.income.date}>{row.date.toLocaleDateString()}</td>
                  <td title={row.name}>{row.ticker}</td>
                  <td>{currency(row.metadata.income.price)}</td>
                  <td>{Math.round(row.income / row.metadata.income.price)}</td>
                  <td title={row.metadata.income.memo}>{currency(row.income)}</td>
                  <td title={row.metadata.tax.memo}>{currency(row.tax)}</td>
                  <td title={`net income = income-tax = ${currency(row.income)}${currency(row.tax)} = ${currency(row.netIncome)}`}>{currency(row.netIncome)}</td>
                  <td>{currency(row.exchangeRate)}</td>
                  <td title={`income = net income * exchange rate = ${currency(row.netIncome)} * ${currency(row.exchangeRate)} = ${currency(row.incomeUah)}`}>{currency(row.incomeUah)}</td>
                  <td title={`tax = income * 0.195 = ${currency(row.incomeUah)} * 0.195 = ${currency(row.taxUah)}`}>{currency(row.taxUah)}</td>
                  <td title={`net income = income-tax = ${currency(row.incomeUah)}${currency(row.taxUah)} = ${currency(row.netIncomeUah)}`}>{currency(row.netIncomeUah)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-group-divider table-secondary">
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td title="Загальна сума нарахованих дивідендів у доларах">{currency(rows.map((row) => row.income).reduce((a, b) => a + b, 0))}</td>
                <td title="Загальна сума утриманих податків на користь США у доларах">{currency(rows.map((row) => -1 * row.tax).reduce((a, b) => a + b, 0))}</td>
                <td title="Нараховано чистими після сплати податків США у доларах">{currency(rows.map((row) => row.netIncome).reduce((a, b) => a + b, 0))}</td>
                <td></td>
                <td title="Загальна сума нарахованих дивідендів у гривні, після сплати податку США">{currency(rows.map((row) => row.incomeUah).reduce((a, b) => a + b, 0))}</td>
                <td title="Сумма податків що маєемо сплатити на користь податкої України">{currency(rows.map((row) => row.taxUah).reduce((a, b) => a + b, 0))}</td>
                <td title="Залишаеться чистими після сплати всіх податків">{currency(rows.map((row) => row.netIncomeUah).reduce((a, b) => a + b, 0))}</td>
              </tr>
            </tfoot>
          </table>
        )}
        <div className="row">
          <div className="col-12 col-sm-6">
            <canvas ref={chartRef} />
          </div>
          <div className="col-12 col-sm-6">
            <Calendar rows={rows} />
          </div>
        </div>
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe />
      <Join />
    </main>
  )
}

export default Dividends

export const Head: HeadFC = () => <title>Розрахунок податкових забовʼязань по дивідендам з виписки Interactive Brokers з урахуванням курсових різниць</title>