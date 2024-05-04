import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import Hero from '../../components/hero'
import Chart from 'chart.js/auto'
import { Shop } from '../../components/shop'
import Join from '../../components/join'
import { useOvdp } from './_googlesheets'
import { ago } from '../../utils/ago'
import { currency } from '../../utils/formatters'

const Ovdp: React.FC<PageProps> = () => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = useState<Chart>()

  const chart2Ref = useRef<HTMLCanvasElement>(null)
  const [chart2, setChart2] = useState<Chart>()

  const chart3Ref = useRef<HTMLCanvasElement>(null)
  const [chart3, setChart3] = useState<Chart>()

  const ovdp = useOvdp()

  const best_over_year = useMemo(() => {
    const best: Record<number, number> = {}
    for (const year of new Set(ovdp.filter((item) => item.currency === 'UAH').map((item) => item.year))) {
      const max = Math.max(...ovdp.filter((item) => item.year === year).map((item) => item.yield || 0))
      best[year] = max
    }
    return best
  }, [ovdp])

  const best_over_months = useMemo(() => {
    const best: Record<number, number> = {}
    for (const months of new Set(ovdp.filter((item) => item.currency === 'UAH').map((item) => item.months))) {
      if (!months) {
        continue
      }
      const max = Math.max(...ovdp.filter((item) => item.months === months).map((item) => item.yield || 0))
      best[months] = max
    }
    return best
  }, [ovdp])

  const avg_over_months = useMemo(() => {
    const avg: Record<number, number> = {}
    for (const months of new Set(ovdp.filter((item) => item.currency === 'UAH').map((item) => item.months))) {
      if (!months) {
        continue
      }
      const sum = ovdp.filter((item) => item.months === months).reduce((acc, item) => acc + (item.yield || 0), 0)
      avg[months] = sum / ovdp.filter((item) => item.months === months).length
    }
    return avg
  }, [ovdp])

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: new Array(5).fill(0).map((_, i) => i + 1),
        datasets: [
          {
            label: 'MAX дохідність ОВДП (UAH) за період (місяці)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
          {
            label: 'AVG дохідність ОВДП (UAH) за період (місяці)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: false,
            text: '% доходу за період',
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
              text: 'Погашення через N місяців',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Дохідність %',
            },
          },
        },
      },
    })

    setChart(chart)
  }, [])

  useEffect(() => {
    if (!chart) {
      return
    }
    chart.data.datasets[0].data = Object.values(best_over_months)
    chart.data.datasets[1].data = Object.values(avg_over_months)
    chart.data.labels = Object.keys(best_over_months)
    chart.update()
  }, [chart, best_over_months, avg_over_months])

  // TEMPORARY CHART 2 for USD
  useEffect(() => {
    if (!chart2Ref.current) {
      return
    }

    const chart2 = new Chart(chart2Ref.current, {
      type: 'line',
      data: {
        labels: new Array(5).fill(0).map((_, i) => i + 1),
        datasets: [
          {
            label: 'MAX(USD)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
          {
            label: 'AVG(USD)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: false,
            text: '% доходу за період',
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
              text: 'Погашення через N місяців',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Дохідність %',
            },
          },
        },
      },
    })

    setChart2(chart2)
  }, [])

  useEffect(() => {
    if (!chart2) {
      return
    }

    const items = ovdp
      .filter((item) => item.currency === 'USD' && item.months && item.yield)
      .map((item) => ({
        currency: item.currency,
        months: item.months as number,
        yield: item.yield as number,
      }))

    const months = new Set(items.map((item) => item.months))
    const max: Record<number, number> = {}
    const avg: Record<number, number> = {}
    for (const month of months) {
      const rates = items.filter((item) => item.currency === 'USD' && item.months === month).map((item) => item.yield)
      max[month] = Math.max(...rates)
      avg[month] = rates.reduce((acc, rate) => acc + rate, 0) / rates.length
    }
    chart2.data.labels = Array.from(months)
    chart2.data.datasets[0].data = Object.values(max)
    chart2.data.datasets[1].data = Object.values(avg)
    chart2.update()
  }, [chart2, ovdp])

  // TEMPORARY CHART 3 for USD
  useEffect(() => {
    if (!chart3Ref.current) {
      return
    }

    const chart3 = new Chart(chart3Ref.current, {
      type: 'line',
      data: {
        labels: new Array(5).fill(0).map((_, i) => i + 1),
        datasets: [
          {
            label: 'MAX(EUR)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
          {
            label: 'AVG(EUR)',
            data: new Array(5).fill(0),
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: false,
            text: '% доходу за період',
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
              text: 'Погашення через N місяців',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Дохідність %',
            },
          },
        },
      },
    })

    setChart3(chart3)
  }, [])

  useEffect(() => {
    if (!chart3) {
      return
    }

    const items = ovdp
      .filter((item) => item.currency === 'EUR' && item.months && item.yield)
      .map((item) => ({
        currency: item.currency,
        months: item.months as number,
        yield: item.yield as number,
      }))

    const months = new Set(items.map((item) => item.months))
    const max: Record<number, number> = {}
    const avg: Record<number, number> = {}
    for (const month of months) {
      const rates = items.filter((item) => item.currency === 'EUR' && item.months === month).map((item) => item.yield)
      max[month] = Math.max(...rates)
      avg[month] = rates.reduce((acc, rate) => acc + rate, 0) / rates.length
    }
    chart3.data.labels = Array.from(months)
    chart3.data.datasets[0].data = Object.values(max)
    chart3.data.datasets[1].data = Object.values(avg)
    chart3.update()
  }, [chart3, ovdp])

  return (
    <main>
      <Hero title="Інвестуємо в Україні" subtitle="ОВДП" />
      <div className="container-fluid py-5">
        <table className="table table-hover text-center">
          <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>Оновлено</th>
              <th>Постачальник</th>
              <th>Тип постачальника</th>
              <th>Тип інструменту</th>
              <th>ISIN</th>
              <th>Валюта</th>
              <th>
                Погашення <span className="text-secondary">рік</span>
              </th>
              <th>
                Погашення <span className="text-secondary">дата</span>
              </th>
              <th>
                Погашення <span className="text-secondary">місяців</span>
              </th>
              <th>
                Дохідність <span className="text-secondary">%</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {ovdp
              .sort((a, b) => new Date(a.maturity ? a.maturity : new Date()).getTime() - new Date(b.maturity ? b.maturity : new Date()).getTime())
              .map((item, idx, arr) => (
                <tr key={idx} className={idx > 1 && item.months !== arr[idx - 1].months ? 'table-group-divider' : ''}>
                  <td>
                    <small className="text-secondary">{item.input_date ? ago(new Date(item.input_date)) : ''} тому</small>
                  </td>
                  <td>{item.provider_name}</td>
                  <td>{item.provider_type}</td>
                  <td>{item.instrument_type}</td>
                  <td>{item.isin}</td>
                  <td>{item.currency}</td>
                  <td>{item.year}</td>
                  <td>{item.maturity ? item.maturity : ''}</td>
                  <td>{item.months ? item.months : ''}</td>
                  <td className={[item.months && item.yield === best_over_months[item.months] ? 'text-success' : '', item.year && item.yield === best_over_year[item.year] ? 'fw-bold' : ''].join(' ')}>
                    {currency(item.yield)}%{item.yield === best_over_year[item.year] ? <span title={`Найкраща пропозиція ${item.year}`}>🥇</span> : ''}
                  </td>
                  <td title={item.comments}>{item.comments ? <i className="fa-regular fa-comment" /> : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="container py-5">
        <canvas ref={chartRef} />
        <div className="row">
          <div className="col-6">
            <canvas ref={chart2Ref} />
          </div>
          <div className="col-6">
            <canvas ref={chart3Ref} />
          </div>
        </div>
      </div>
      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Як це працює?</h2>
          <p>ОВДП це як депозит, але з трохи більшою дохідністью.</p>
          <p>ОВДП випускає та продає Міністерство Фінансів України.</p>
          <p>Пересічний громадянин не може купити ОВДП у мінфін, вони продаються на так званих аукціьонах великими партіями.</p>
          <p>Покупцями за звичай є банки та фонди.</p>
          <p>Вони в свою чергу потім, перепродають їх нам, зі своєю націнкою, хтось трохи дорожче, хтось трохи дешевше.</p>
        </div>
      </div>
      <Shop />
      <Join />
    </main>
  )
}

export default Ovdp

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
