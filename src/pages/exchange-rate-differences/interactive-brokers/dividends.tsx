import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC } from 'gatsby'
import '../../../styles/common.css'
import Chart, { CoreChartOptions } from 'chart.js/auto'
import { currency, round } from '../../../utils/formatters'
import { getExchangeRate, getExchangeRates } from '../../../utils/exchange-rate'
import statements from '../../../images/exchange-rate-differences/statements.png'
import msmoney from '../../../images/exchange-rate-differences/msmoney.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import Hero from '../../../components/hero'
import ExchangeRateDifferencesLinks from '../../../components/exchange-rate-differences-links'
import Subscribe from '../../../components/subscribe'
import { findSecurityInfo, parseMsMoneyOfxReport, parseOfxDateTime } from '../../../utils/ibkr/ofx'
import { Shop } from '../../../components/shop'

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
        <div className="col-4 mb-3" key={month}>
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

  const tax30 = useMemo(() => rows.filter((row) => (Math.abs(row.tax) / row.income) * 100 > 20).sort((a, b) => Math.abs(b.tax) - Math.abs(a.tax))?.[0], [rows])

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

    const minDate = new Date(Math.min(...rows.map((t) => t.date.getTime())))
    const maxDate = new Date(Math.max(...rows.map((t) => t.date.getTime())))
    getExchangeRates(minDate, maxDate).then((rates) => {
      const next = [...rows]
      console.log(rates)
      next.forEach((t) => {
        t.exchangeRate = rates[t.date.toISOString().split('T').shift()!]
        t.incomeUah = t.netIncome * t.exchangeRate
        t.taxUah = t.incomeUah * 0.105
        t.netIncomeUah = t.incomeUah - t.taxUah
        return t
      })
      setRows(next)
    })

    /*
    for (const date of Array.from(new Set(rows.map((t) => t.date)))) {
      getExchangeRate(date).then((exchangeRate) => {
        const next = [...rows]
        next.forEach((t) => {
          if (t.date == date) {
            t.exchangeRate = exchangeRate
            t.incomeUah = t.netIncome * exchangeRate
            t.taxUah = t.incomeUah * 0.105
            t.netIncomeUah = t.incomeUah - t.taxUah
          }
          return t
        })
        setRows(next)
      })
    }
    */

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
            <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
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
                <th title="Розрахований процент податку" className="fw-normal">
                  tax <span className="text-secondary">%</span>
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
                <th title="Подакток України - 9% ПДФО та 1.5% війсковий сбір, разом 10.5%" className="fw-normal">
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
                  <td>{round((Math.abs(row.tax) / row.income) * 100, 2)}</td>
                  <td title={`net income = income-tax = ${currency(row.income)}${currency(row.tax)} = ${currency(row.netIncome)}`}>{currency(row.netIncome)}</td>
                  <td className="table-secondary">{currency(row.exchangeRate)}</td>
                  <td title={`income = net income * exchange rate = ${currency(row.netIncome)} * ${currency(row.exchangeRate)} = ${currency(row.incomeUah)}`}>{currency(row.incomeUah)}</td>
                  <td title={`tax = income * 0.105 = ${currency(row.incomeUah)} * 0.105 = ${currency(row.taxUah)}`}>{currency(row.taxUah)}</td>
                  <td title={`net income = income-tax = ${currency(row.incomeUah)}${currency(row.taxUah)} = ${currency(row.netIncomeUah)}`}>{currency(row.netIncomeUah)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-group-divider table-secondary">
              <tr>
                <td>Разом</td>
                <td></td>
                <td></td>
                <td></td>
                <td title="Загальна сума нарахованих дивідендів у доларах">{currency(rows.map((row) => row.income).reduce((a, b) => a + b, 0))}</td>
                <td title="Загальна сума утриманих податків на користь США у доларах">{currency(rows.map((row) => -1 * row.tax).reduce((a, b) => a + b, 0))}</td>
                <td></td>
                <td title="Нараховано чистими після сплати податків США у доларах">{currency(rows.map((row) => row.netIncome).reduce((a, b) => a + b, 0))}</td>
                <td></td>
                <td title="Загальна сума нарахованих дивідендів у гривні, після сплати податку США">{currency(rows.map((row) => row.incomeUah).reduce((a, b) => a + b, 0))}</td>
                <td title="Сумма податків що маєемо сплатити на користь податкої України">{currency(rows.map((row) => row.taxUah).reduce((a, b) => a + b, 0))}</td>
                <td title="Залишаеться чистими після сплати всіх податків">{currency(rows.map((row) => row.netIncomeUah).reduce((a, b) => a + b, 0))}</td>
              </tr>
            </tfoot>
          </table>
        )}
        <details className="my-3">
          <summary>Примітки</summary>
          <p>Ідея цієї таблички швиденько подивитися курсові різниці без необхідності вираховувати все руками, за для можливості звіритися з іншими тулами.</p>
          <p>Майже кожна комірка у табличці має пояснення з формулою та цифрами розрахунку, за для того щоб його побачити слід підвести курсор мишки та трохи зачекати.</p>
          <ul>
            <li>
              Данні з виписки Interactive Brokers
              <ul>
                <li>
                  <b>date</b> - дата надходження дивідендів з виписки Interactive Brokers
                </li>
                <li>
                  <b>ticker</b> - символ компанії що сплатила дивіденді
                </li>
                <li>
                  <b>price</b> - нарахування за кожну акцію, береться з повідомлення &laquo;AAPL(US0378331005) CASH DIVIDEND USD 0.22 PER SHARE (Ordinary Dividend)&raquo;
                </li>
                <li>
                  <b>income</b> - нарахування дивідендів у долларах до оподаткування
                </li>
                <li>
                  <b>tax</b> - податок утриманий на стороні Interactive Brokers, в ідеалі має бути 15%, списуется автоматично
                </li>
              </ul>
            </li>
            <li>
              Розрахунки
              <ul>
                <li>
                  <b>units</b> - кількість акцій з яких було виплачено дивіденді, розрахунок - <code>income / price</code>
                </li>
                <li>
                  <b>tax %</b> - рохрахунок проценту податку, рахується так <code>tax / income * 100</code>, мета - наглядно побачити де скільки утримуется
                </li>
                <li>
                  <b>net income</b> - розрахований чистий прибуток, який фактично прибавився до балансу аккаунту після утримання податку Interactive Brokers. Рахуемо як <code>income - tax</code>
                </li>
              </ul>
            </li>
            <li>
              Курсові різниці
              <ul>
                <li>
                  <b>usd/uah</b> - курс доллара на дату виплати дивідендів, данні тягнемо з <a href="https://bank.gov.ua">bank.gov.ua</a> на дату виплати дивідендів, так наприклад для 2022-12-30 данні
                  забираються{' '}
                  <a href="https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=20221230&json" target="_blank">
                    звідси
                  </a>{' '}
                  і ця ж <a href="https://bank.gov.ua/ua/markets/exchangerates?date=30.12.2023">сторінка для людей</a>
                </li>
                <li>
                  <b>income</b> - дохід у гривні, рахується як <code>net income * usd/uah</code>, тобто ми беремо вже оподаткований дохід у долларах та множимо на курс на дату
                </li>
                <li>
                  <b>tax</b> - податок України 9% ПДФО та 1.5% війсковий збір, разом 10.5%, розраховується відносно доходу у гривні розрахованого у попередньому кроці як <code>income * tax</code>
                </li>
                <li>
                  <b>net income</b> - дохід &laquo;чистими&raquo; у гривні, після вирахування податку
                </li>
              </ul>
            </li>
          </ul>
        </details>
        <div className="row">
          <div className="col-12 col-sm-6">
            <canvas ref={chartRef} />
          </div>
          <div className="col-12 col-sm-6">
            <Calendar rows={rows} />
          </div>
        </div>
      </div>

      {tax30 && (
        <div className="bg-danger-subtle">
          <div className="container py-5">
            <h3>Зі звіту, схоже що відбувається подвійне оподаткування</h3>
            <p>Між Україною та США є домовленність про відсутність подвійного оподаткування, тобто якщо я сплати податки в США то не маю повторно їх сплачувати тут</p>
            <p>Але за замовчанням ця опція виключена</p>
            <p>
              І замість очікуваних <b>15%</b> податку, IB списує усі <b>30%</b>, так наприклад <b>{tax30?.ticker}</b> мав би списати <b>{currency(tax30?.income * 0.15)}</b>, а списав{' '}
              <b>{currency(Math.abs(tax30.tax))}</b>
            </p>
            <details>
              <summary>Як виправити</summary>
              <p>
                Ось{' '}
                <a href="https://t.me/c/1440806120/12717/22009" target="_blank">
                  тут
                </a>{' '}
                була гарна переписка з прикладами, куди ідти, що робити, які тікети відкривати і т.д.
              </p>
              <p>TODO: нужно последовательность действий и пример письма сюда добавить</p>
            </details>
          </div>
        </div>
      )}

      <ExchangeRateDifferencesLinks />
      <Subscribe youtube="https://www.youtube.com/watch?v=Fiylm8c8yAc" />
      <Shop />
      <Join />
    </main>
  )
}

export default Dividends

export const Head: HeadFC = () => <title>Розрахунок податкових забовʼязань по дивідендам з виписки Interactive Brokers з урахуванням курсових різниць</title>
