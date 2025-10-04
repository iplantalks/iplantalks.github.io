import * as React from 'react'
import { FC, useState, useEffect, useMemo, useRef } from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { currency, round } from '../utils/formatters'
import { getExchangeRate, getExhcangeRateHistory } from '../utils/exchange-rate'
import '../styles/reversal-exchange-rate.css'
import { getOVDP } from '../utils/privatbank/ovdp'
import { createChart, LineSeries } from 'lightweight-charts'
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

    var uah = chart.addSeries(LineSeries, { color: 'red', title: 'UAH' })
    var usd = chart.addSeries(LineSeries, { color: 'blue', title: 'USD' })

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

    var uah = chart.addSeries(LineSeries, { color: 'red', title: 'UAH' })
    var usd = chart.addSeries(LineSeries, { color: 'blue', title: 'USD' })

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

      var line = chart.addSeries(LineSeries, { color: 'orange', title: 'USD/UAH' })

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

      <div className="container mx-auto my-5 p-4">
        <p className="mb-3">Даний калькулятор дозволяє порівняти ефективність інвестування в гривневі та валютні інструменти - шляхом визначення паритетного майбутнього курсу долара до гривні.</p>
        <p className="mb-3">&nbsp;</p>
        <p className="mb-3">Наприклад.</p>
        <p className="mb-3">
          У вас є якась сума, скажімо, <span className="text-green-500">{money} доларів</span>.
        </p>
        <p className="mb-3">Ви хочете проінвестувати її на {years} років в депозити, ОВДП або інші інструменти.</p>
        <p className="mb-3">
          Зараз ви бачите, що в гривні (депозит, ОВДП) можна отримати &mdash; <span className="text-blue-500">{expectedReturnUah}%</span> річних, а в валюті &mdash;{' '}
          <span className="text-orange-500">{expectedReturnUsd}%</span> річних, відповідно.
        </p>
        <p className="mb-3">&nbsp;</p>
        <p className="mb-3">Через {years} років вам хотілося б мати кошти в доларах.</p>
        <p className="mb-3">
          На сьогодні курс 1 долара = <span className="text-red-500">{currency(currentExchangeRate)} грн</span>.
        </p>
        <p className="mb-3">&nbsp;</p>
        <div className="bg-neutral-100 p-4 my-4">
          Постає питання: Що ефективніше - покласти зараз існуючу валюту на доларовий вклад, чи обміняти все на гривню, інвестувати в гривневий інструмент під більший відсоток, а через {years} років
          на отриману суму знову купити валюту?
        </div>
        <p className="mb-3">&nbsp;</p>
        <p className="mb-3">Щоб вам легше було прийняти таке рішення, скористайтеся нашим калькулятором. Давайте введемо дані з прикладу.</p>

        <div className="flex gap-3 mb-3 items-center">
          <div className="col-auto">
            <input id="moneyInput" className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-green-500" type="number" min="1" value={money} onChange={(e) => setMoney(e.target.valueAsNumber)} required />
          </div>
          <div className="col-auto">
            <label htmlFor="moneyInput" className="col-form-label">
              початкова сума у доларах,
            </label>
          </div>
          <div className="col-auto">
            <input id="uahusdInput" className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-red-500" type="number" min="1" value={currentExchangeRate} onChange={(e) => setCurrentExchangeRate(e.target.valueAsNumber)} required />
          </div>
          <div className="col-auto">
            <label htmlFor="uahusdInput" className="col-form-label">
              поточний курс долару
            </label>
          </div>
        </div>

        <table className="table-auto w-full border-collapse my-5">
          <thead>
            <tr>
              <th className='p-2 text-left'>Дохідність (%) та сумма накопичень (грн) інструменту у грн.</th>
              <th className='p-2 text-left'>Дохідність (%) та сумма накопичень ($) інструменту у $</th>
              <th className='p-2 text-left'>Курс розвороту</th>
              <th className='p-2 text-left'>Роки</th>
              <th className='p-2 text-left'>% зміни від поточного курсу</th>
              <th className='p-2 text-left'>Прогноз курсу з темпом девальвації</th>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left'>
                <input className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-blue-500" type="number" min="1" max="100" value={expectedReturnUah} onChange={(e) => setExpectedReturnUah(e.target.valueAsNumber)} required />
              </th>
              <th className='p-2 text-left'>
                <input className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-orange-500" type="number" min="1" max="100" value={expectedReturnUsd} onChange={(e) => setExpectedReturnUsd(e.target.valueAsNumber)} required />
              </th>
              <th className='p-2 text-left'></th>
              <th className='p-2 text-left'>
                <input style={{ minWidth: '4em' }} className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black" type="number" min="1" max="100" value={years} onChange={(e) => setYears(e.target.valueAsNumber)} required />
              </th>
              <th className='p-2 text-left'></th>
              <th className='p-2 text-left'>
                <input className="px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" id="infInput" type="number" min="1" max="100" value={expectedDevaluation} onChange={(e) => setExpectedDevaluation(e.target.valueAsNumber)} required />
              </th>
            </tr>
          </thead>
          <tbody id="result" className="table-group-divider">
            {rows.map(({ uah, usd, reverse, year, change, forecast }, idx) => (
              <tr className={`border-t border-neutral-300 ${idx % 2 === 0 ? 'bg-neutral-100' : 'bg-white'}`} key={year}>
                <td className='p-2 text-red-500'>{currency(uah)}</td>
                <td className='p-2 text-blue-500'>{currency(usd)}</td>
                <td className='p-2'>{currency(reverse)}</td>
                <td className='p-2'>{year}</td>
                <td className='p-2'>{currency(change)}</td>
                <td className='p-2'>{currency(forecast)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-neutral-100 p-4 my-4">
          <p className="mb-3">
            Отже ми бачимо - що курс розвороту через {years} років становитиме &mdash; <span className="text-green-500">{currency(last.reverse)} грн</span>. Це курс, при якому ефективність доларового і
            гривневого вкладення будуть однакові.
          </p>
          <p className="mb-3">
            Якщо на вашу думку, через {years} років курс долара до гривні буде більшим, скажімо <span className="text-neutral-500">{currency(max)} грн</span> за долар - то ви маєте прагнути до того, щоб
            вкладати вашу валюту одразу в валютний інструмент.
          </p>
          <p className="mb-3">
            Якщо ж на вашу думку курс буде меншим - скажімо <span className="text-neutral-500">{currency(min)} грн</span> за долар - то ефективніше зараз обміняти валюту, покласти на гривневий вклад, а
            потім знову на отриману суму купити долар.
          </p>
        </div>

        <p className="mb-3">
          В нашому прикладі через {years} років на гривневому вкладі інвестор матиме - <span className="text-blue-500">{currency(last.uah)} грн</span>.
        </p>
        <p className="mb-3">
          На валютному вкладі - <span className="text-orange-500">{currency(last.usd)} дол</span>.
        </p>
        <p className="mb-3">&nbsp;</p>
        <p className="mb-3">
          Давайте проведемо розрахунки, скільки доларів на руки отримав би інвестор, при гривневому вкладі за умови майбутнього курса <span className="text-neutral-500">{currency(min)} грн</span> за
          долар, та <span className="text-neutral-500">{currency(max)} грн</span> за долар.
        </p>
        <p className="mb-3">&nbsp;</p>
        <p className="mb-3">
          <span className="text-neutral-500">{currency(min)} грн за дол</span> = <span className="text-blue-500">{currency(last.uah)}</span> / <span className="text-neutral-500">{currency(min)}</span> ={' '}
          {currency(last.uah / min)} дол, що <b>більше</b> за отримані <span className="text-orange-500">{currency(last.usd)} дол</span> на валютному вкладі.
        </p>
        <p className="mb-3">
          <span className="text-neutral-500">{currency(max)} грн грн за дол</span> = <span className="text-blue-500">{currency(last.uah)}</span> / <span className="text-neutral-500">{currency(max)}</span>{' '}
          = {currency(last.uah / max)} дол, що <b>менше</b> за отримані <span className="text-orange-500">{currency(last.usd)} дол</span> на валютному вкладі.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-5">Графік зростання капіталу у гривні</h2>
        <div ref={chartUah} />

        <h2 className="text-2xl font-bold mt-10 mb-5">Графік зростання капіталу у доларах</h2>
        <div ref={chartUsd} />

        <h2 className="text-2xl font-bold mt-10 mb-5">Графік курсу гривні відносно долару США</h2>
        <p className='mb-5'>
          За період з 2002 вартість долара змінилася з {currency(startExchangeRate)} грн до {currency(endExchangeRate)} грн, що складає {currency(overallRRI * 100)}% річних
        </p>
        <div ref={chartDev} />
      </div>

      <div className="container mx-auto my-5 p-4">
        <h2 className="text-2xl font-bold mb-5">Авторство</h2>
        <div className="flex gap-5 items-start">
          <div>
            <img src="https://iplan.ua/wp-content/uploads/2021/07/iplan-web-2.jpg" alt="Артем Ваганов" width="239" height="159" />
          </div>
          <div>
            <p className="mb-3">
              Автор таблиці - Артем Ваганов, фінансовий планер{' '}
              <a className='text-blue-500' href="https://iplan.ua/about-us/#vahanov" target="_blank">
                iPlan.ua
              </a>
              , засновник спільноти
              <a className='text-blue-500' href="https://t.me/iPlanTalksBot?start=ZGw6OTIzNzU" target="_blank">
                iPlan Talks
              </a>
              , автор Телеграм каналу{' '}
              <a className='text-blue-500' href="https://t.me/dengirabotayut" target="_blank">
                Гроші працюють
              </a>
              .
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-5 mt-5">Джерела</h2>
        <ul className='list-disc list-inside ml-5'>
          <li>
            <a className='text-blue-500' href="https://docs.google.com/spreadsheets/d/1sCxUUS63wJ04LnjuokY2EQ5gDgekScSZn-PhfKLNxYY" target="_blank">
              Приклад самостійного розрахунку в Google Sheets
            </a>
          </li>
          <li>
            <a className='text-blue-500' href="https://api.privatbank.ua/#p24/exchange" target="_blank">
              Курси валют ПриватБанку
            </a>
          </li>
          <li>
            <a className='text-blue-500' href="https://index.minfin.com.ua/ua/economy/index/devaluation/" target="_blank">
              Девальвація української гривні
            </a>
          </li>
          <li>
            <a className='text-blue-500' href="https://finance.yahoo.com/quote/UAH%3DX/chart" target="_blank">
              Курс гривні щодо долару
            </a>
          </li>
          <li>
            <a className='text-blue-500' href="https://privatbank.ua/ovdp" target="_blank">
              Облігації внутрішньої державної позики України
            </a>
          </li>
        </ul>
      </div>

      <div className="bg-yellow-100 mt-5 mb-0">
        <div className="container mx-auto my-0 p-4">
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
