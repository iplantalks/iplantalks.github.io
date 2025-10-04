import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC, navigate } from 'gatsby'
import { currency, round } from '../../utils/formatters'
import { getExchangeRate } from '../../utils/exchange-rate'
import Chart from 'chart.js/auto'
import Join from '../../components/join'
import { Header } from '../../components/header'
import { useAuth } from '../../context/auth'

interface Row {
  year: number
  exchangeRate1: number
  exchangeRate2: number
  exchangeRate3: number
  exchangeRate4: number
  tax1: number
  tax2: number
  tax3: number
  tax4: number
  perf1: number
  perf2: number
  perf3: number
  perf4: number
}

const Forecast = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

  const chartRef = useRef<HTMLCanvasElement>(null)
  const returnsChartRef = useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = useState<Chart>()
  const [returnsChart, setReturnsChart] = useState<Chart>()
  const [short, setShort] = useState(true)
  const [tax, setTax] = useState(19.5)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [devalvation1, setDevalvation1] = useState(12)
  const [devalvation2, setDevalvation2] = useState(10)
  const [devalvation3, setDevalvation3] = useState(7)
  const [devalvation4, setDevalvation4] = useState(5)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    getExchangeRate(new Date()).then((er) => setExchangeRate(round(er, 2)))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (!chartRef.current) {
      return
    }

    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: new Array(50).fill(0).map((_, i) => i + 1),
        datasets: [
          {
            label: '12% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '10% девальваця',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '7% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '5% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: '% податку на інвест.прибуток при різних % девальвації та дохідності інвестування',
          },
        },
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value',
            },
          },
        },
      },
    })

    setChart(chart)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (!returnsChartRef.current) {
      return
    }

    const chart = new Chart(returnsChartRef.current, {
      type: 'line',
      data: {
        labels: new Array(50).fill(0).map((_, i) => i + 1),
        datasets: [
          {
            label: '12% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '10% девальваця',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '7% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
          {
            label: '5% девальвація',
            data: new Array(50).fill(0),
            // fill: false,
            // cubicInterpolationMode: 'monotone',
            // tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: '% прибуток при різних % девальвації',
          },
        },
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value',
            },
          },
        },
      },
    })

    setReturnsChart(chart)
  }, [])

  const rows = useMemo(() => {
    const rows: Row[] = []

    const year = 1
    const exchangeRate1 = exchangeRate * (1 + devalvation1 / 100)
    const exchangeRate2 = exchangeRate * (1 + devalvation2 / 100)
    const exchangeRate3 = exchangeRate * (1 + devalvation3 / 100)
    const exchangeRate4 = exchangeRate * (1 + devalvation4 / 100)

    const returns = Math.pow(1 + expectedReturn / 100, year)
    const divider = expectedReturn <= 0 ? 1 : returns - 1

    const tax1 = (tax * (returns * exchangeRate1 - exchangeRate <= 0 ? 0 : returns * exchangeRate1 - exchangeRate)) / exchangeRate1 / divider
    const tax2 = (tax * (returns * exchangeRate2 - exchangeRate <= 0 ? 0 : returns * exchangeRate2 - exchangeRate)) / exchangeRate2 / divider
    const tax3 = (tax * (returns * exchangeRate3 - exchangeRate <= 0 ? 0 : returns * exchangeRate3 - exchangeRate)) / exchangeRate3 / divider
    const tax4 = (tax * (returns * exchangeRate4 - exchangeRate <= 0 ? 0 : returns * exchangeRate4 - exchangeRate)) / exchangeRate4 / divider

    const perf1 = (returns * exchangeRate1 - exchangeRate <= 0 ? 0 : returns * exchangeRate1 - exchangeRate) / exchangeRate1 / divider
    const perf2 = (returns * exchangeRate2 - exchangeRate <= 0 ? 0 : returns * exchangeRate2 - exchangeRate) / exchangeRate2 / divider
    const perf3 = (returns * exchangeRate3 - exchangeRate <= 0 ? 0 : returns * exchangeRate3 - exchangeRate) / exchangeRate3 / divider
    const perf4 = (returns * exchangeRate4 - exchangeRate <= 0 ? 0 : returns * exchangeRate4 - exchangeRate) / exchangeRate4 / divider

    rows.push({
      year,
      exchangeRate1,
      exchangeRate2,
      exchangeRate3,
      exchangeRate4,
      tax1,
      tax2,
      tax3,
      tax4,
      perf1,
      perf2,
      perf3,
      perf4,
    })

    for (let i = 1; i < 50; i++) {
      const year = i + 1
      const exchangeRate1 = rows[i - 1].exchangeRate1 * (1 + devalvation1 / 100)
      const exchangeRate2 = rows[i - 1].exchangeRate2 * (1 + devalvation2 / 100)
      const exchangeRate3 = rows[i - 1].exchangeRate3 * (1 + devalvation3 / 100)
      const exchangeRate4 = rows[i - 1].exchangeRate4 * (1 + devalvation4 / 100)

      const returns = Math.pow(1 + expectedReturn / 100, year)
      const divider = expectedReturn <= 0 ? 1 : returns - 1

      const tax1 = (tax * (returns * exchangeRate1 - exchangeRate <= 0 ? 0 : returns * exchangeRate1 - exchangeRate)) / exchangeRate1 / divider
      const tax2 = (tax * (returns * exchangeRate2 - exchangeRate <= 0 ? 0 : returns * exchangeRate2 - exchangeRate)) / exchangeRate2 / divider
      const tax3 = (tax * (returns * exchangeRate3 - exchangeRate <= 0 ? 0 : returns * exchangeRate3 - exchangeRate)) / exchangeRate3 / divider
      const tax4 = (tax * (returns * exchangeRate4 - exchangeRate <= 0 ? 0 : returns * exchangeRate4 - exchangeRate)) / exchangeRate4 / divider

      const perf1 = returns * exchangeRate1 - exchangeRate <= 0 ? 0 : returns * exchangeRate1 - exchangeRate / exchangeRate1 / divider
      const perf2 = returns * exchangeRate2 - exchangeRate <= 0 ? 0 : returns * exchangeRate2 - exchangeRate / exchangeRate2 / divider
      const perf3 = returns * exchangeRate3 - exchangeRate <= 0 ? 0 : returns * exchangeRate3 - exchangeRate / exchangeRate3 / divider
      const perf4 = returns * exchangeRate4 - exchangeRate <= 0 ? 0 : returns * exchangeRate4 - exchangeRate / exchangeRate4 / divider

      rows.push({
        year,
        exchangeRate1,
        exchangeRate2,
        exchangeRate3,
        exchangeRate4,
        tax1,
        tax2,
        tax3,
        tax4,
        perf1,
        perf2,
        perf3,
        perf4,
      })
    }

    if (chart) {
      chart.data.datasets[0].label = `${devalvation1}% девальвація`
      chart.data.datasets[1].label = `${devalvation2}% девальвація`
      chart.data.datasets[2].label = `${devalvation3}% девальвація`
      chart.data.datasets[3].label = `${devalvation4}% девальвація`

      chart.data.datasets[0].data = rows.map((row) => row.tax1)
      chart.data.datasets[1].data = rows.map((row) => row.tax2)
      chart.data.datasets[2].data = rows.map((row) => row.tax3)
      chart.data.datasets[3].data = rows.map((row) => row.tax4)
      chart.update()
    }

    if (returnsChart) {
      returnsChart.data.datasets[0].label = `${devalvation1}% девальвація`
      returnsChart.data.datasets[1].label = `${devalvation2}% девальвація`
      returnsChart.data.datasets[2].label = `${devalvation3}% девальвація`
      returnsChart.data.datasets[3].label = `${devalvation4}% девальвація`

      returnsChart.data.datasets[0].data = rows.map((row) => row.perf1)
      returnsChart.data.datasets[1].data = rows.map((row) => row.perf2)
      returnsChart.data.datasets[2].data = rows.map((row) => row.perf3)
      returnsChart.data.datasets[3].data = rows.map((row) => row.perf4)
      returnsChart.update()
    }

    return rows
  }, [tax, expectedReturn, exchangeRate, devalvation1, devalvation2, devalvation3, devalvation4, chart])

  return (
    <main>
      <Header />

      <div className="bg-rainbow text-white">
        <div className="container mx-auto my-0 px-4 py-10">
          <div className="flex gap-5 items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold">Курсові різниці</h1>
              <p className="text-3xl my-5">💡 Податки, прибуток і девальвація на одному графіку. Переглянь відео 👉</p>
              <p>
                <a className="inline-block border border-white text-white text-lg px-6 py-2 rounded hover:bg-white hover:!text-black transition font-semibold" href="https://t.me/iPlanTalksBot?start=ZGw6Mjc2NDc4">
                  Отримати безкоштовний курс
                </a>
              </p>
            </div>
            <iframe className='aspect-video' width="560" height="315" src="https://www.youtube.com/embed/aawVzBjOzqs?si=Y42Mlj3pF9rYVYh8" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
        </div>
      </div>

      <div className="container mx-auto my-5 p-4">
        <div className="grid grid-cols-3 gap-5">
          <p>
            <label htmlFor="date" className="block mb-2">
              Початковий курс валюти
            </label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.valueAsNumber)} />
            {/*disabled={!found}*/}
          </p>
          <p>
            <label htmlFor="date" className="block mb-2">
              Ставка податку на інвест прибуток
            </label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={tax} onChange={(e) => setTax(e.target.valueAsNumber)} />
            {/*disabled={!found}*/}
          </p>
          <p>
            <label htmlFor="date" className="block mb-2">
              Прогнозована дохідність
            </label>
            <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={expectedReturn} min={1} step={1} onChange={(e) => setExpectedReturn(e.target.valueAsNumber)} />
            {/*disabled={!found}*/}
          </p>
        </div>

        <table className="table-auto w-full my-5">
          <thead className='text-sm'>
            <tr>
              <th className='p-2 text-left'>Роки інвестування</th>
              <th className='p-2 text-left' colSpan={4}>Курс гривні до долара при різних % девальвації нац.валюти та прибутковості інвестицій</th>
              <th className='p-2 text-left' colSpan={4}>Розрахункова % ставка податку на інвестиційний прибуток</th>
            </tr>
            <tr className='border-t border-neutral-200'>
              <th className='p-2 text-left'>темпи девальвації</th>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={devalvation1} onChange={(e) => setDevalvation1(e.target.valueAsNumber)} />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={devalvation2} onChange={(e) => setDevalvation2(e.target.valueAsNumber)} />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={devalvation3} onChange={(e) => setDevalvation3(e.target.valueAsNumber)} />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={devalvation4} onChange={(e) => setDevalvation4(e.target.valueAsNumber)} />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100" value={devalvation1} disabled />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100" value={devalvation2} disabled />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100" value={devalvation3} disabled />
              </td>
              <td className='p-2'>
                <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100" value={devalvation4} disabled />
              </td>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((row) => (short ? row.year === 1 || row.year % 5 === 0 : true))
              .map((row) => (
                <tr className='border-t border-neutral-200 text-center' key={row.year}>
                  <td className='p-2'>{row.year}</td>
                  <td className='p-2'>{currency(row.exchangeRate1)}</td>
                  <td className='p-2'>{currency(row.exchangeRate2)}</td>
                  <td className='p-2'>{currency(row.exchangeRate3)}</td>
                  <td className='p-2'>{currency(row.exchangeRate4)}</td>
                  <td className='p-2'>{currency(row.tax1)}%</td>
                  <td className='p-2'>{currency(row.tax2)}%</td>
                  <td className='p-2'>{currency(row.tax3)}%</td>
                  <td className='p-2'>{currency(row.tax4)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
        <p>
          <label>
            <input type="checkbox" checked={short} onChange={(e) => setShort(e.target.checked)} /> Скоротити таблицю
          </label>
        </p>
        <canvas ref={chartRef} />
        <canvas ref={returnsChartRef} />
      </div >

      <Join />
    </main >
  )
}

export default Forecast

export const Head: HeadFC = () => <title>Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості</title>
