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

interface PartialMof {
  isin: string
  days: number | null
  currency: string
  placement: string | null
  ror: number
}

const Ovdp: React.FC<PageProps> = () => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = useState<Chart>()

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
            label: 'Дохідність ОВДП за період (місяці)',
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
    // chart.data.datasets[1].data = data.map((x) => x.history)
    chart.data.labels = Object.keys(best_over_months) // data.map((x) => x.maturity + ' (' + maturity(new Date(x.maturity || new Date())) + ')')
    chart.update()
  }, [chart, best_over_months])

  return (
    <main>
      <Hero title="Інвестуємо в Україні" subtitle="ОВДП" />
      <div className="container py-5">
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
                <tr key={idx} className={[idx > 1 && item.year !== arr[idx - 1].year ? 'table-group-divider' : '', item.months && item.months % 2 === 0 ? 'table-secondary' : ''].join(' ')}>
                  <td>
                    <small className="text-secondary">{item.input_date ? ago(new Date(item.input_date)) : ''} тому</small>
                  </td>
                  <td>{item.provider_name}</td>
                  <td>{item.provider_type}</td>
                  <td>{item.instrument_type}</td>
                  <td>{item.isin}</td>
                  <td>{item.currency}</td>
                  <td>{item.maturity ? item.maturity : ''}</td>
                  <td>{item.months ? item.months : ''}</td>
                  <td className={[item.months && item.yield === best_over_months[item.months] ? 'text-success' : '', item.year && item.yield === best_over_year[item.year] ? 'fw-bold' : ''].join(' ')}>
                    {currency(item.yield)}%
                  </td>
                  <td title={item.comments}>{item.comments ? <i className="fa-regular fa-comment" /> : ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <canvas ref={chartRef} />
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
