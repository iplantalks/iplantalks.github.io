import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC } from 'gatsby'
import '../../styles/common.css'
import { currency, round } from '../../utils/formatters'
import { getExchangeRate } from '../../utils/exchange-rate'
import Chart from 'chart.js/auto'
import Join from '../../components/join'
import Hero from '../../components/hero'
import ExchangeRateDifferencesLinks from '../../components/exchange-rate-differences-links'
import Subscribe from '../../components/subscribe'

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
}

const Forecast = () => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = useState<Chart>()
  const [short, setShort] = useState(true)
  const [tax, setTax] = useState(19.5)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [devalvation1, setDevalvation1] = useState(12)
  const [devalvation2, setDevalvation2] = useState(10)
  const [devalvation3, setDevalvation3] = useState(7)
  const [devalvation4, setDevalvation4] = useState(5)

  useEffect(() => {
    getExchangeRate(new Date()).then((er) => setExchangeRate(round(er, 2)))
  }, [])

  useEffect(() => {
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

    return rows
  }, [tax, expectedReturn, exchangeRate, devalvation1, devalvation2, devalvation3, devalvation4, chart])

  return (
    <main>
      <Hero title="Курсові різниці" subtitle="Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості" />

      <div className="container py-5">
        <div className="row">
          <p className="col-12 col-sm-4">
            <label htmlFor="date" className="form-label">
              Початковий курс валюти
            </label>
            <input type="number" className="form-control" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.valueAsNumber)} />
          </p>
          <p className="col-12 col-sm-4">
            <label htmlFor="date" className="form-label">
              Ставка податку на інвест прибуток
            </label>
            <input type="number" className="form-control" value={tax} onChange={(e) => setTax(e.target.valueAsNumber)} />
          </p>
          <p className="col-12 col-sm-4">
            <label htmlFor="date" className="form-label">
              Прогнозована дохідність
            </label>
            <input type="number" className="form-control" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.valueAsNumber)} />
          </p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Роки інвестування</th>
              <th colSpan={4}>Курс гривні до долара при різних % девальвації нац.валюти та прибутковості інвестицій</th>
              <th colSpan={4}>Розрахункова % ставка податку на інвестиційний прибуток</th>
            </tr>
            <tr>
              <th>темпи девальвації</th>
              <td>
                <input type="number" className="form-control" value={devalvation1} onChange={(e) => setDevalvation1(e.target.valueAsNumber)} />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation2} onChange={(e) => setDevalvation2(e.target.valueAsNumber)} />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation3} onChange={(e) => setDevalvation3(e.target.valueAsNumber)} />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation4} onChange={(e) => setDevalvation4(e.target.valueAsNumber)} />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation1} disabled />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation2} disabled />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation3} disabled />
              </td>
              <td>
                <input type="number" className="form-control" value={devalvation4} disabled />
              </td>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((row) => (short ? row.year === 1 || row.year % 5 === 0 : true))
              .map((row) => (
                <tr className="text-center" key={row.year}>
                  <td>{row.year}</td>
                  <td>{currency(row.exchangeRate1)}</td>
                  <td>{currency(row.exchangeRate2)}</td>
                  <td>{currency(row.exchangeRate3)}</td>
                  <td>{currency(row.exchangeRate4)}</td>
                  <td>{currency(row.tax1)}%</td>
                  <td>{currency(row.tax2)}%</td>
                  <td>{currency(row.tax3)}%</td>
                  <td>{currency(row.tax4)}%</td>
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
      </div>

      <ExchangeRateDifferencesLinks />
      <Subscribe />
      <Join />
    </main>
  )
}

export default Forecast

export const Head: HeadFC = () => <title>Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості</title>
