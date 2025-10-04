import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC, navigate } from 'gatsby'
import Chart from 'chart.js/auto'
import { currency, round } from '../../../utils/formatters'
import { getExchangeRates } from '../../../utils/exchange-rate'
import statements from '../../../images/exchange-rate-differences/statements.png'
import msmoney from '../../../images/exchange-rate-differences/msmoney.png'
import popup from '../../../images/exchange-rate-differences/popup.png'
import Join from '../../../components/join'
import { findSecurityInfo, parseMsMoneyOfxReport, parseOfxDateTime } from '../../../utils/ibkr/ofx'
import tooltip from '../../../images/tooltip.png'
import { useAuth } from '../../../context/auth'
import { Header } from '../../../components/header'

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
  // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
  const income = rows
    .filter((row) => row.date.getMonth() === month)
    .map((row) => row.netIncomeUah)
    .reduce((a, b) => a + b, 0)
  return (
    <div>
      <div className="text-neutral-500 text-center">{months[month]}</div>
      {income > 0 ? <div className='font-bold text-center'>{currency(income)} <span className="text-neutral-500">грн</span></div> : <div className='text-center'>-</div>}
    </div>
  )
}

const Calendar = ({ rows }: { rows: Row[] }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mt-10 mb-5">Календар виплат</h2>
      <div className="grid grid-cols-6 gap-4">
        {numbers.map((month) => (
          <div className="p-4 border border-neutral-200 rounded" key={month}>
            <CalendarMonth month={month} rows={rows} />
          </div>
        ))}
      </div>
    </div>
  )
}

const Dividends = () => {
  const { user } = useAuth()
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])

  const [rows, setRows] = useState<Row[]>([])

  const tax30 = useMemo(() => rows.filter((row) => (Math.abs(row.tax) / row.income) * 100 > 20).sort((a, b) => Math.abs(b.tax) - Math.abs(a.tax))?.[0], [rows])

  const handle = (text: string) => {
    const ofx = parseMsMoneyOfxReport(text)
    // window['ofx'] = ofx
    const rows: Row[] = []
    for (const income of ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.INCOME || []) {
      if (income.INCOMETYPE !== 'DIV') {
        continue
      }
      const ticker = findSecurityInfo(ofx, income.SECID)
      if (!ticker || !ticker.TICKER || !ticker.SECNAME) {
        continue
      }
      if (ticker.TICKER === 'BND' && income.TOTAL == 21.95) {
        console.log('BND')
        console.log(income)
        // window['income'] = income
        // window['ticker'] = ticker
      }
      const tax = ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVTRANLIST?.INVBANKTRAN?.find(
        (t) => t.STMTTRN.TRNTYPE === 'OTHER' && t.STMTTRN.MEMO?.startsWith(income.INVTRAN.MEMO?.split(' PER SHARE ').shift() + ' PER SHARE ')
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
        // t.incomeUah = t.netIncome * t.exchangeRate // WRONG: https://t.me/c/1440806120/12717/27029
        t.incomeUah = t.income * t.exchangeRate
        t.taxUah = t.incomeUah * 0.14 // 9% ПДФО + 5% військовий збір
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
            t.taxUah = t.incomeUah * 0.14
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
    if (typeof window === 'undefined') {
      return
    }
    fetch('/exchange-rate-differences/interactive-brokers/dividends/sample.ofx')
      .then((res) => res.text())
      .then(handle)
  }, [])

  return (
    <main>
      <Header />

      <div className="container mx-auto my-5 p-4">
        <p className='mb-3'>З дивідендів, що виплачувалися впродовж року, мусимо сплатити податки на прикінці звітного періоду, але як та де швиденько подивитися картину в цілому?</p>
        <p className='mb-3'>Саме це і є метою ціеї сторінки, вивантажте звіт msmoney за потрібний період, та подивіться на розрахунки.</p>

        <div className="my-5">
          <label htmlFor="ofx" className="block mb-2">Звіт MS Money <a href="sample.ofx" download>приклад</a></label>
          <input id="ofx" className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" type="file" accept=".ofx" multiple={true} onChange={(e) => handleFileChoosen(e.target.files![0])} />
        </div>
        <details className="my-3">
          <summary>Покрокова інструкція &mdash; як сформувати звіт</summary>
          <p className='mb-3'>
            Переходимо на сторінку <b>Statements</b> розділу <b>Performance & Reports</b>
          </p>
          <p className='mb-3'>
            <img src={statements} style={{ maxWidth: '50vw' }} />
          </p>
          <p className='mb-3'>
            Зправа, знизу, буде кнопка для формування звіту <b>MS Money</b>
          </p>
          <p className='mb-3'>
            <img src={msmoney} style={{ maxWidth: '50vw' }} />
          </p>
          <p className='mb-3'>Зʼявиться віконце для вибору дат, за якими буде сформовано звіт. Виберіть, приблизні, дати коли ви купляли будь які акції</p>
          <p className='mb-3'>
            <img src={popup} style={{ maxWidth: '50vw' }} />
          </p>
        </details>

        <div className="bg-neutral-100 p-4 text-sm">
          Зверніть увагу, усі розрахунки та колонки мають пояснення, що і як рахується,
          <br />
          за для того щоб їх побачити підведіть курсор мишки та трохи зачейкайте
          <br />
          <img src={tooltip} width="341" />
          <br />
          Була ідея добавити іконки <i className="fa-solid fa-circle-info"></i>, але це треба буде пів таблички обкласти цими іконками і замість них нічого видно не буде :)
        </div>

        {rows.length && (
          <table className="table-auto w-full my-5 border-collapse">
            <thead className="sticky top-0 bg-black text-white text-sm">
              <tr>
                <th title="Дата" className="font-normal text-left p-2">
                  date
                </th>
                <th title="Ticker акції" className="font-normal text-left p-2">
                  ticker
                </th>
                <th title="Нарахування за кожну акцію" className="font-normal text-left p-2">
                  price <span className="opacity-50">$</span>
                </th>
                <th title="Розрахована кількість акцій units = income / price" className="font-normal text-left p-2">
                  units
                </th>
                <th title="Нарахування у далларах" className="font-normal text-left p-2">
                  income <span className="opacity-50">$</span>
                </th>
                <th title="Утримано податків зі сторони IBKR на користь США у доларах" className="font-normal text-left p-2">
                  tax <span className="opacity-50">$</span>
                </th>
                <th title="Розрахований процент податку" className="font-normal text-left p-2">
                  tax <span className="opacity-50">%</span>
                </th>
                <th title="Нараховано чистими після податку США у доларах" className="font-normal text-left p-2">
                  net income <span className="opacity-50">$</span>
                </th>
                <th title="Курс НБУ на дату нарахування" className="font-normal text-left p-2">
                  usd/uah
                </th>
                <th title="Нараховано у гривні загалом, без урахування податків США" className="font-normal text-left p-2">
                  income <span className="opacity-50">&#8372;</span>
                </th>
                <th title="Податок України - 9% ПДФО та 5% військовий збір, разом 14%. ВАЖЛИВО: податком обкладається зарахована сума, без урахування податку США" className="font-normal text-left p-2">
                  tax <span className="opacity-50">&#8372;</span>
                </th>
                <th title="Фін. результат чистими, після сплати всіх податків у гривні" className="font-normal text-left p-2">
                  net income <span className="opacity-50">&#8372;</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {rows.map((row, idx) => (
                <tr className={`border-t border-neutral-300 ${idx % 2 === 0 ? 'bg-neutral-100' : 'bg-white'}`} key={row.id}>
                  <td className='p-2' title={row.metadata.income.date}>{row.date.toLocaleDateString()}</td>
                  <td className='p-2' title={row.name}>{row.ticker}</td>
                  <td className='p-2'>{currency(row.metadata.income.price)}</td>
                  <td className='p-2'>{Math.round(row.income / row.metadata.income.price)}</td>
                  <td className='p-2' title={row.metadata.income.memo}>{currency(row.income)}</td>
                  <td className='p-2' title={row.metadata.tax.memo}>{currency(row.tax)}</td>
                  <td className='p-2'>{round((Math.abs(row.tax) / row.income) * 100, 2)}</td>
                  <td className='p-2' title={`net income = income-tax = ${currency(row.income)}${currency(row.tax)} = ${currency(row.netIncome)}`}>{currency(row.netIncome)}</td>
                  <td className='p-2 bg-neutral-200'>{currency(row.exchangeRate)}</td>
                  <td className='p-2' title={`income = income * exchange rate = ${currency(row.income)} * ${currency(row.exchangeRate)} = ${currency(row.incomeUah)}`}>{currency(row.incomeUah)}</td>
                  <td className='p-2' title={`tax = income * 0.14 = ${currency(row.incomeUah)} * 0.14 = ${currency(row.taxUah)}`}>{currency(row.taxUah)}</td>
                  <td className='p-2' title={`net income = income-tax = ${currency(row.incomeUah)}${currency(row.taxUah)} = ${currency(row.netIncomeUah)}`}>{currency(row.netIncomeUah)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-200 border-t border-neutral-300">
              <tr>
                <td className='p-2'>Разом</td>
                <td className='p-2'></td>
                <td className='p-2'></td>
                <td className='p-2'></td>
                <td className='p-2' title="Загальна сума нарахованих дивідендів у доларах">{currency(rows.map((row) => row.income).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2' title="Загальна сума утриманих податків на користь США у доларах">{currency(rows.map((row) => -1 * row.tax).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2'></td>
                <td className='p-2' title="Нараховано чистими після сплати податків США у доларах">{currency(rows.map((row) => row.netIncome).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2'></td>
                <td className='p-2' title="Загальна сума нарахованих дивідендів у гривні, після сплати податку США">{currency(rows.map((row) => row.incomeUah).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2' title="Сумма податків що маєемо сплатити на користь податкої України">{currency(rows.map((row) => row.taxUah).reduce((a, b) => a + b, 0))}</td>
                <td className='p-2' title="Залишаеться чистими після сплати всіх податків">{currency(rows.map((row) => row.netIncomeUah).reduce((a, b) => a + b, 0))}</td>
              </tr>
            </tfoot>
          </table>
        )}


        <details className="my-3">
          <summary>Примітки</summary>
          <p className='mb-3'>Ідея цієї таблички швиденько подивитися нараховані дивіденди, та розраховані податкові забовʼязання з урахуванням курсових різниць.</p>
          <p className='mb-3'>Майже кожна комірка у табличці має пояснення з формулою та цифрами розрахунку, за для того щоб його побачити слід підвести курсор мишки та трохи зачекати.</p>
          <ul className='list-disc list-inside ml-5'>
            <li>
              Данні з виписки Interactive Brokers
              <ul className='list-disc list-inside ml-5'>
                <li>
                  <b>date</b> - дата надходження дивідендів з виписки Interactive Brokers
                </li>
                <li>
                  <b>ticker</b> - символ компанії, що сплатила дивіденди
                </li>
                <li>
                  <b>price</b> - нарахування за кожну акцію, береться з повідомлення &laquo;AAPL(US0378331005) CASH DIVIDEND USD 0.22 PER SHARE (Ordinary Dividend)&raquo;
                </li>
                <li>
                  <b>income</b> - нарахування дивідендів у доларах до оподаткування
                </li>
                <li>
                  <b>tax</b> - податок утриманий на стороні Interactive Brokers, в ідеалі має бути 15%, списується автоматично
                </li>
              </ul>
            </li>
            <li>
              Розрахунки
              <ul className='list-disc list-inside ml-5'>
                <li>
                  <b>units</b> - кількість акцій з яких було виплачено дивіденди, розрахунок - <code>income / price</code>
                </li>
                <li>
                  <b>tax %</b> - рохрахунок проценту податку, рахується так <code>tax / income * 100</code>, мета - наглядно побачити де скільки утримується
                </li>
                <li>
                  <b>net income</b> - розрахований чистий прибуток, який фактично додано до балансу аккаунту після утримання податку Interactive Brokers. Рахуемо як <code>income - tax</code>
                </li>
              </ul>
            </li>
            <li>
              Курсові різниці
              <ul className='list-disc list-inside ml-5'>
                <li>
                  <b>usd/uah</b> - курс долара на дату виплати дивідендів, данні тягнемо з <a className='text-blue-500' href="https://bank.gov.ua">bank.gov.ua</a> на дату виплати дивідендів, так наприклад для 2022-12-30 данні
                  забираються{' '}
                  <a className='text-blue-500' href="https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=20221230&json" target="_blank">
                    звідси
                  </a>{' '}
                  і ця ж <a className='text-blue-500' href="https://bank.gov.ua/ua/markets/exchangerates?date=30.12.2023">сторінка для людей</a>
                </li>
                <li>
                  <b>income</b> - дохід у гривні, рахується як <code>income * usd/uah</code>, тобто ми беремо <b>не оподаткований</b> дохід у доларах та множимо на курс на дату. Чудова нагода
                  завітати до iTalks та сказати дякую одному з експертів що{' '}
                  <a className='text-blue-500' href="https://t.me/c/1440806120/12717/27029" target="_blank">
                    підказав
                  </a>
                </li>
                <li>
                  <b>tax</b> - податок України 9% ПДФО та 5% війсковий збір, разом 14%, розраховується відносно доходу у гривні розрахованого у попередньому кроці як <code>income * tax</code>
                </li>
                <li>
                  <b>net income</b> - дохід &laquo;чистими&raquo; у гривні, після вирахування податку
                </li>
              </ul>
            </li>
          </ul>
        </details>


        <Calendar rows={rows} />

      </div>

      {tax30 && (
        <div className="bg-red-100 mt-5 mb-0">
          <div className="container mx-auto my-0 p-4">
            <h3 className='text-2xl font-bold mb-3'>Зі звіту, схоже що відбувається подвійне оподаткування</h3>
            <p className='mb-3'>Між Україною та США є домовленність про відсутність подвійного оподаткування, тобто якщо я сплатив податки в США, то не маю повторно їх сплачувати тут</p>
            <p className='mb-3'>Але за замовчанням ця опція виключена</p>
            <p className='mb-3'>
              І замість очікуваних <b>15%</b> податку, IB списує усі <b>30%</b>, так наприклад <b>{tax30?.ticker}</b> мав би списати <b>{currency(tax30?.income * 0.15)}</b>, а списав{' '}
              <b>{currency(Math.abs(tax30.tax))}</b>
            </p>
            <details>
              <summary>Як виправити</summary>
              <p>
                Ось <a className='text-blue-500' href="https://t.me/c/1440806120/12717/22009" target="_blank">тут</a> була гарна переписка з прикладами, куди йти, що робити, які тікети відкривати і т.д.
              </p>
            </details>
          </div>
        </div>
      )}

      <Join />
    </main>
  )
}

export default Dividends

export const Head: HeadFC = () => <title>Розрахунок податкових забовʼязань по дивідендам з виписки Interactive Brokers з урахуванням курсових різниць</title>
