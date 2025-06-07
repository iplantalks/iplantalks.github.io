import * as React from 'react'
import { FC, useState, useEffect, useMemo, useRef } from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { currency, round } from '../utils/formatters'
import { getExchangeRate, getExhcangeRateHistory } from '../utils/exchange-rate'
import '../styles/common.css'
import '../styles/reversal-exchange-rate.css'
import { getOVDP } from '../utils/privatbank/ovdp'
import { createChart } from 'lightweight-charts'
import { rri } from '../utils/rri'
import Join from '../components/join'
import { Header } from '../components/header'

interface Row {
  year: number
  uah: number
  usd: number
  reverse: number
  change: number
  forecast: number
}

const ReversalExchangeRatePage: FC<PageProps> = () => {
  const chartUah = useRef<HTMLDivElement>(null)
  const chartUsd = useRef<HTMLDivElement>(null)
  const chartDev = useRef<HTMLDivElement>(null)

  const [money, setMoney] = useState(1000)
  const [currentExchangeRate, setCurrentExchangeRate] = useState(37.4)
  const [expectedReturnUah, setExpectedReturnUah] = useState(18)
  const [expectedReturnUsd, setExpectedReturnUsd] = useState(4)
  const [years, setYears] = useState(10)
  const [expectedDevaluation, setExpectedDevaluation] = useState(10)
  const [startExchangeRate, setStartExchangeRate] = useState(0)
  const [endExchangeRate, setEndExchangeRate] = useState(0)
  const [overallRRI, setOverallRRI] = useState(0)

  const rows = useMemo(() => {
    const result: Row[] = []
    for (var i = 0; i < years; i++) {
      const prev = result[i - 1]
      const year = i + 1
      const uah = i === 0 ? money * currentExchangeRate * (1 + expectedReturnUah / 100) : prev.uah * (1 + expectedReturnUah / 100)
      const usd = i === 0 ? money * (1 + expectedReturnUsd / 100) : prev.usd * (1 + expectedReturnUsd / 100)
      const reverse = uah / usd
      const change = (reverse / currentExchangeRate) * 100 - 100
      const forecast = i === 0 ? currentExchangeRate * (1 + expectedDevaluation / 100) : prev.forecast * (1 + expectedDevaluation / 100)
      result.push({ year, uah, usd, reverse, change, forecast })
    }
    return result
  }, [money, currentExchangeRate, expectedReturnUah, expectedReturnUsd, expectedDevaluation, years])

  const last = useMemo(() => rows[rows.length - 1], [rows])
  const min = useMemo(() => Math.floor(last.forecast / 2 / 10) * 10, [rows])
  const max = useMemo(() => Math.ceil((last.forecast * 2) / 10) * 10, [rows])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    getExchangeRate(new Date()).then((er) => setCurrentExchangeRate(round(er, 2)))
    getOVDP().then((ovdp) => {
      const items = ovdp.filter((item) => item.bidyield && item.matturity.getFullYear() === new Date().getFullYear())
      setExpectedReturnUah(Math.round(items.findLast((item) => item.currency === 'UAH')?.bidyield || expectedReturnUah))
      setExpectedReturnUsd(Math.round(items.findLast((item) => item.currency === 'USD')?.bidyield || expectedReturnUsd))
    })
  }, [])

  useEffect(() => {
    if (!chartUah.current) {
      return
    }

    const chart = createChart(chartUah.current, {
      width: chartUah.current.clientWidth,
      height: Math.floor(chartUah.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    var uah = chart.addLineSeries({ color: 'red', title: 'UAH' })
    var usd = chart.addLineSeries({ color: 'blue', title: 'USD' })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'currency', currency: 'UAH' }).format } })

    uah.setData(
      rows.map((row) => ({
        time: `${new Date().getFullYear() + row.year}-01-01`,
        value: row.uah,
      }))
    )

    usd.setData(
      rows.map((row) => ({
        time: `${new Date().getFullYear() + row.year}-01-01`,
        value: row.usd * row.forecast,
      }))
    )

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [rows])

  useEffect(() => {
    if (!chartUsd.current) {
      return
    }

    const chart = createChart(chartUsd.current, {
      width: chartUsd.current.clientWidth,
      height: Math.floor(chartUsd.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    var uah = chart.addLineSeries({ color: 'red', title: 'UAH' })
    var usd = chart.addLineSeries({ color: 'blue', title: 'USD' })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format } })

    uah.setData(
      rows.map((row) => ({
        time: `${new Date().getFullYear() + row.year}-01-01`,
        value: row.uah / row.forecast,
      }))
    )

    usd.setData(
      rows.map((row) => ({
        time: `${new Date().getFullYear() + row.year}-01-01`,
        value: row.usd,
      }))
    )

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [rows])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    getExhcangeRateHistory().then((history) => {
      if (!chartDev.current) {
        return
      }

      setStartExchangeRate(history[0].close)
      setEndExchangeRate(history[history.length - 1].close)
      setOverallRRI(rri(history[history.length - 1].date.getFullYear() - history[0].date.getFullYear(), history[0].close, history[history.length - 1].close))

      const chart = createChart(chartDev.current, {
        width: chartDev.current.clientWidth,
        height: Math.floor(chartDev.current.clientWidth / 3),
      })

      var line = chart.addLineSeries({ color: 'orange', title: 'USD/UAH' })

      chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'currency', currency: 'UAH' }).format } })

      line.setData(
        history
          .map((row) => ({
            time: row.date.toISOString().substring(0, 10),
            value: row.close,
          }))
          .filter(({ value }) => !!value)
      )

      chart.timeScale().fitContent()

      return () => {
        chart.remove()
      }
    })
  }, [])

  return (
    <main>
      <Header />
      {/* <Hero title="Курсові різниці" subtitle="Курс розвороту" /> */}

      <div className="container py-5">
        <p>Даний калькулятор дозволяє порівняти ефективність інвестування в гривневі та валютні інструменти - шляхом визначення паритетного майбутнього курсу долара до гривні.</p>
        <p>&nbsp;</p>
        <p>Наприклад.</p>
        <p>
          У вас є якась сума, скажімо, <span className="text-success">{money} доларів</span>.
        </p>
        <p>Ви хочете проінвестувати її на {years} років в депозити, ОВДП або інші інструменти.</p>
        <p>
          Зараз ви бачите, що в гривні (депозит, ОВДП) можна отримати &mdash; <span className="text-primary">{expectedReturnUah}%</span> річних, а в валюті &mdash;{' '}
          <span className="text-warning">{expectedReturnUsd}%</span> річних, відповідно.
        </p>
        <p>&nbsp;</p>
        <p>Через {years} років вам хотілося б мати кошти в доларах.</p>
        <p>
          На сьогодні курс 1 долара = <span className="text-danger">{currency(currentExchangeRate)} грн</span>.
        </p>
        <p>&nbsp;</p>
        <div className="alert alert-secondary">
          Постає питання: Що ефективніше - покласти зараз існуючу валюту на доларовий вклад, чи обміняти все на гривню, інвестувати в гривневий інструмент під більший відсоток, а через {years} років
          на отриману суму знову купити валюту?
        </div>
        <p>&nbsp;</p>
        <p>Щоб вам легше було прийняти таке рішення, скористайтеся нашим калькулятором. Давайте введемо дані з прикладу.</p>

        <div className="row g-3 align-items-center py-3">
          <div className="col-auto">
            <input id="moneyInput" className="form-control text-success" type="number" min="1" value={money} onChange={(e) => setMoney(e.target.valueAsNumber)} required />
          </div>
          <div className="col-auto">
            <label htmlFor="moneyInput" className="col-form-label">
              початкова сума у доларах,
            </label>
          </div>
          <div className="col-auto">
            <input id="uahusdInput" className="form-control text-danger" type="number" min="1" value={currentExchangeRate} onChange={(e) => setCurrentExchangeRate(e.target.valueAsNumber)} required />
          </div>
          <div className="col-auto">
            <label htmlFor="uahusdInput" className="col-form-label">
              поточний курс долару
            </label>
          </div>
        </div>

        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Дохідність (%) та сумма накопичень (грн) інструменту у грн.</th>
              <th>Дохідність (%) та сумма накопичень ($) інструменту у $</th>
              <th>Курс розвороту</th>
              <th>Роки</th>
              <th>% зміни від поточного курсу</th>
              <th>Прогноз курсу з темпом девальвації</th>
            </tr>
            <tr>
              <th>
                <input className="form-control text-primary" type="number" min="1" max="100" value={expectedReturnUah} onChange={(e) => setExpectedReturnUah(e.target.valueAsNumber)} required />
              </th>
              <th>
                <input className="form-control text-warning" type="number" min="1" max="100" value={expectedReturnUsd} onChange={(e) => setExpectedReturnUsd(e.target.valueAsNumber)} required />
              </th>
              <th></th>
              <th>
                <input style={{ minWidth: '4em' }} className="form-control" type="number" min="1" max="100" value={years} onChange={(e) => setYears(e.target.valueAsNumber)} required />
              </th>
              <th></th>
              <th>
                <input className="form-control" id="infInput" type="number" min="1" max="100" value={expectedDevaluation} onChange={(e) => setExpectedDevaluation(e.target.valueAsNumber)} required />
              </th>
            </tr>
          </thead>
          <tbody id="result" className="table-group-divider">
            {rows.map(({ uah, usd, reverse, year, change, forecast }) => (
              <tr key={year}>
                <td style={{ color: 'red' }}>{currency(uah)}</td>
                <td style={{ color: 'blue' }}>{currency(usd)}</td>
                <td>{currency(reverse)}</td>
                <td>{year}</td>
                <td>{currency(change)}</td>
                <td>{currency(forecast)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="alert alert-secondary my-4">
          <p>
            Отже ми бачимо - що курс розвороту через {years} років становитиме &mdash; <span className="text-success">{currency(last.reverse)} грн</span>. Це курс, при якому ефективність доларового і
            гривневого вкладення будуть однакові.
          </p>
          <p>
            Якщо на вашу думку, через {years} років курс долара до гривні буде більшим, скажімо <span className="text-secondary">{currency(max)} грн</span> за долар - то ви маєте прагнути до того, щоб
            вкладати вашу валюту одразу в валютний інструмент.
          </p>
          <p>
            Якщо ж на вашу думку курс буде меншим - скажімо <span className="text-secondary">{currency(min)} грн</span> за долар - то ефективніше зараз обміняти валюту, покласти на гривневий вклад, а
            потім знову на отриману суму купити долар.
          </p>
        </div>

        <p>
          В нашому прикладі через {years} років на гривневому вкладі інвестор матиме - <span className="text-primary">{currency(last.uah)} грн</span>.
        </p>
        <p>
          На валютному вкладі - <span className="text-warning">{currency(last.usd)} дол</span>.
        </p>
        <p>&nbsp;</p>
        <p>
          Давайте проведемо розрахунки, скільки доларів на руки отримав би інвестор, при гривневому вкладі за умови майбутнього курса <span className="text-secondary">{currency(min)} грн</span> за
          долар, та <span className="text-secondary">{currency(max)} грн</span> за долар.
        </p>
        <p>&nbsp;</p>
        <p>
          <span className="text-secondary">{currency(min)} грн за дол</span> = <span className="text-primary">{currency(last.uah)}</span> / <span className="text-secondary">{currency(min)}</span> ={' '}
          {currency(last.uah / min)} дол, що <b>більше</b> за отримані <span className="text-warning">{currency(last.usd)} дол</span> на валютному вкладі.
        </p>
        <p>
          <span className="text-secondary">{currency(max)} грн грн за дол</span> = <span className="text-primary">{currency(last.uah)}</span> / <span className="text-secondary">{currency(max)}</span>{' '}
          = {currency(last.uah / max)} дол, що <b>менше</b> за отримані <span className="text-warning">{currency(last.usd)} дол</span> на валютному вкладі.
        </p>

        <h2 className="mt-5">Графік зростання капіталу у гривні</h2>
        <div ref={chartUah} />

        <h2 className="mt-5">Графік зростання капіталу у долларах</h2>
        <div ref={chartUsd} />

        <h2 className="mt-5">Графік курсу гривні відносно долару США</h2>
        <p>
          За період з 2002 вартість доллара змінилася з {currency(startExchangeRate)} грн до {currency(endExchangeRate)} грн, що складає {currency(overallRRI * 100)}% річних
        </p>
        <div ref={chartDev} />
      </div>

      <div className="container py-5">
        <h2 className="mb-3">Авторство</h2>
        <div className="d-flex">
          <div className="flex-shrink-0">
            <img src="https://iplan.ua/wp-content/uploads/2021/07/iplan-web-2.jpg" alt="Артем Ваганов" width="239" height="159" />
          </div>
          <div className="flex-grow-1 ms-3">
            <p>
              Автор таблиці - Артем Ваганов, фінансовий планер{' '}
              <a href="https://iplan.ua/about-us/#vahanov" target="_blank">
                iPlan.ua
              </a>
              , засновник спільноти
              <a href="https://t.me/iPlanTalksBot?start=ZGw6OTIzNzU" target="_blank">
                iPlan Talks
              </a>
              , автор Телеграм каналу{' '}
              <a href="https://t.me/dengirabotayut" target="_blank">
                Гроші працюють
              </a>
              .
            </p>
          </div>
        </div>

        <h2 className="mt-5 mb-3">Джерела</h2>
        <ul>
          <li>
            <a href="https://docs.google.com/spreadsheets/d/1sCxUUS63wJ04LnjuokY2EQ5gDgekScSZn-PhfKLNxYY" target="_blank">
              Приклад самостійного розрахунку в Google Sheets
            </a>
          </li>
          <li>
            <a href="https://api.privatbank.ua/#p24/exchange" target="_blank">
              Курси валют ПриватБанку
            </a>
          </li>
          <li>
            <a href="https://index.minfin.com.ua/ua/economy/index/devaluation/" target="_blank">
              Девальвація української гривні
            </a>
          </li>
          <li>
            <a href="https://finance.yahoo.com/quote/UAH%3DX/chart" target="_blank">
              Курс гривні щодо доллару
            </a>
          </li>
          <li>
            <a href="https://privatbank.ua/ovdp" target="_blank">
              Облігації внутрішньої державної позики України
            </a>
          </li>
        </ul>
      </div>

      <div className="bg-warning-subtle">
        <div className="container py-5">
          Увага! Калькулятор не прогнозує майбутній курс, він лише визначає курс - після якого ефективність доларових та гривневих інвестицій перевертається. Міркування щодо можливості чи не
          можливості таргетування певного курсу через необхідний вам проміжок часу - ви робите самостійно та на ваш розсуд.
        </div>
      </div>

      <Join />
    </main>
  )
}

export default ReversalExchangeRatePage

export const Head: HeadFC = () => <title>Курс розвороту</title>
