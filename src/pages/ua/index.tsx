import * as React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import '../../styles/common.css'
import { HeadFC } from 'gatsby'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { LineStyle, createChart } from 'lightweight-charts'
import { data, inflation, deposit_uah, deposit_usd, ovdp_uah, ovdp_usd, spy, cash_usd, deposit_usd_orig, colors, useData } from './components/_data'
import { BarChart } from './components/_bar-chart'
import { PercentageBarChart } from './components/_percentage-bar-chart'
import { CumulativeLineChart } from './components/_cumulative_line_chart'
import { CumulativeLinesChart } from './components/_cumulative_lines_chart'

ChartJS.register(ArcElement, Tooltip, Legend)

// function shuffle<T>(array: T[]): T[] {
//   const shuffled = array.slice().sort(() => 0.5 - Math.random())
//   return shuffled.slice(0, Math.floor(Math.random() * shuffled.length))
// }

// const colors = shuffle([
//   '#e2431e',
//   '#f1ca3a',
//   '#6f9654',
//   '#1c91c0',
//   '#4374e0',
//   '#5c3292',
//   '#572a1a',
//   '#999999',
//   '#1a1a1a',
//   '#ea5545',
//   '#f46a9b',
//   '#ef9b20',
//   '#edbf33',
//   '#ede15b',
//   '#bdcf32',
//   '#87bc45',
//   '#27aeef',
//   '#b33dc6',
//   '#e60049',
//   '#0bb4ff',
//   '#50e991',
//   '#e6d800',
//   '#9b19f5',
//   '#ffa300',
//   '#dc0ab4',
//   '#b3d4ff',
//   '#00bfa0',
// ])

const PieChart = ({ data, title }: { data: Record<string, number>; title: string }) => (
  <Doughnut
    data={{
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: colors.map((x) => `rgba(${x}, 1)`),
        },
      ],
    }}
    options={{
      responsive: true,
      animation: false,
      animations: {},
      plugins: {
        title: {
          display: true,
          text: title,
        },
        legend: {
          display: false,
          position: 'top',
        },
      },
    }}
  />
)

interface Allocatable {
  id: string
  value: number
  locked: boolean
}

function allocate(state: Allocatable[], next: Allocatable) {
  if (next.value < 0) {
    next.value = 0
  } else if (next.value > 100) {
    next.value = 100
  }
  const result = [...state]
  const prev = result.find((x) => x.id === next.id)
  if (!prev) {
    return result
  }
  if (result.length === 1) {
    return result
  }
  result[result.findIndex((x) => x.id === next.id)].locked = next.locked

  const lockedValuesSum = result.reduce((sum, x) => sum + (x.locked ? x.value : 0), 0)
  const maxValue = 100 - lockedValuesSum
  if (next.value > maxValue) {
    next.value = maxValue
  }
  let i = Math.abs(next.value - prev.value)
  while (i > 0) {
    let changed = false
    for (let j = 0; j < result.length && i > 0; j++) {
      if (result[j].id !== next.id && !result[j].locked) {
        if (next.value > prev.value && result[j].value > 0) {
          result[j].value--
          i--
          changed = true
        } else if (next.value < prev.value && result[j].value < 100) {
          result[j].value++
          i--
          changed = true
        }
      }
    }
    if (!changed) {
      throw new Error('infinite loop')
    }
  }
  result[result.findIndex((x) => x.id === next.id)].value = next.value

  return result
}

const CheckboxDemo = ({ id, checked, setChecked }: { id: string; checked: boolean; setChecked: (checked: boolean) => void }) => (
  <div className="form-check">
    <input className="form-check-input" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} id={id} />
    <label className="form-check-label" htmlFor={id}>
      {id}
    </label>
  </div>
)

const Market = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  const [showInflation, setShowInflation] = useState(true)
  const [showActives, setShowActives] = useState(true)

  const data = useData()

  const [portfolio, setPortfolio] = useState<Array<{ year: number; value: number }>>([])

  const data1 = { deposit_uah, deposit_usd, ovdp_uah, ovdp_usd, spy, cash_usd }
  const [allocations, setAllocations] = useState<Allocatable[]>([
    { id: 'deposit_uah', value: 20, locked: false },
    { id: 'deposit_usd', value: 20, locked: false },
    { id: 'ovdp_uah', value: 20, locked: false },
    { id: 'ovdp_usd', value: 20, locked: false },
    { id: 'spy', value: 20, locked: false },
    { id: 'cash_usd', value: 0, locked: true },
  ])

  const [minDate, setMinDate] = useState(
    Math.max(
      ...[
        Math.min(...data1.deposit_uah.map((x) => x.year)),
        Math.min(...data1.deposit_usd.map((x) => x.year)),
        Math.min(...data1.ovdp_uah.map((x) => x.year)),
        Math.min(...data1.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [maxDate, setMaxDate] = useState(
    Math.min(
      ...[
        Math.max(...data1.deposit_uah.map((x) => x.year)),
        Math.max(...data1.deposit_usd.map((x) => x.year)),
        Math.max(...data1.ovdp_uah.map((x) => x.year)),
        Math.max(...data1.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [startDate, setStartDate] = useState(
    Math.max(
      ...[
        Math.min(...data1.deposit_uah.map((x) => x.year)),
        Math.min(...data1.deposit_usd.map((x) => x.year)),
        Math.min(...data1.ovdp_uah.map((x) => x.year)),
        Math.min(...data1.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [endDate, setEndDate] = useState(
    Math.min(
      ...[
        Math.max(...data1.deposit_uah.map((x) => x.year)),
        Math.max(...data1.deposit_usd.map((x) => x.year)),
        Math.max(...data1.ovdp_uah.map((x) => x.year)),
        Math.max(...data1.ovdp_usd.map((x) => x.year)),
      ]
    )
  )

  const handleAllocationChange = (id: string, value: number, locked: boolean) => {
    setAllocations(allocate(allocations, { id, value, locked }))
  }

  const handleLockedToggle = (id: string) => {
    const found = allocations.find((x) => x.id === id)
    if (found) {
      found.locked = !found.locked
      setAllocations(allocate(allocations, found))
    }
  }

  const handleEqualize = () => {
    const next = [...allocations]
    for (let i = 0; i < next.length; i++) {
      next[i].value = Math.round(100 / allocations.length)
    }
    if (allocations.length % 2 !== 0) {
      next[0].value += 1
    }
    setAllocations(next)
  }

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: Math.floor(chartRef.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format } })

    const portfolio: Record<number, number[]> = {}
    allocations.forEach(({ id, value }, idx) => {
      // if (!value) {
      //   return
      // }

      const allItems =
        id === 'deposit_uah'
          ? data1.deposit_uah
          : id === 'deposit_usd'
          ? data1.deposit_usd
          : id === 'ovdp_uah'
          ? data1.ovdp_uah
          : id === 'ovdp_usd'
          ? data1.ovdp_usd
          : id === 'spy'
          ? data1.spy
          : id === 'cash_usd'
          ? data1.cash_usd
          : null
      if (!allItems) {
        return
      }
      const items = allItems.filter((x) => x.year >= startDate && x.year <= endDate)
      const series: Array<{ time: string; value: number }> = []
      for (let i = 0; i < items.length; i++) {
        const cumulative = series.length === 0 ? 1 : (1 + items[i].value / 100) * series[i - 1].value
        series.push({ time: `${items[i].year}-01-01`, value: cumulative })

        if (!portfolio[items[i].year]) {
          portfolio[items[i].year] = []
        }
        portfolio[items[i].year].push((items[i].value / 100) * (value / 100))
      }
      if (showActives) {
        chart.addLineSeries({ color: `rgba(${colors[idx]}, .5)`, title: id, priceLineVisible: true }).setData(series)
      }
    })

    const portfolioCombined = Object.entries(portfolio).map(([year, values]) => ({ year: parseInt(year), value: values.reduce((a, b) => a + b, 0) }))
    setPortfolio(portfolioCombined)

    const portfolioCum: Array<{ time: string; value: number }> = []
    for (let i = 0; i < portfolioCombined.length; i++) {
      const cumulative = i === 0 ? 1 : (1 + portfolioCombined[i].value) * portfolioCum[i - 1].value
      portfolioCum.push({ time: `${portfolioCombined[i].year}-01-01`, value: cumulative })
    }
    chart.addLineSeries({ color: 'black', title: 'Portfolio', priceLineVisible: true }).setData(portfolioCum)

    // const portfolio: Array<{ time: string; value: number }> = []
    // for (let i = 0; i < deposit_uah.length; i++) {
    //   const cumulative = i === 0 ? 1 : (1 + deposit_uah[i].value / 100) * portfolio[i - 1].value
    //   portfolio.push({ time: `${deposit_uah[i].year}-01-01`, value: cumulative })
    // }

    // allocations.forEach(({ id, value }, idx) => {
    //   chart.addLineSeries({ color: `rgba(${colors[idx]}, .5)`, title: id, priceLineVisible: true }).setData(
    //     data[id].map((row) => ({
    //       time: `${row.year}-01-01`,
    //       value: row.value / 100,
    //     }))
    //   )
    // })

    if (showInflation) {
      const infl = inflation.filter(({ year }) => year >= startDate && year <= endDate)
      const infitems: Array<{ time: string; value: number }> = []
      for (let i = 0; i < infl.length; i++) {
        const cumulative = i === 0 ? 1 : (1 + infl[i].value / 100) * infitems[i - 1].value
        infitems.push({ time: `${infl[i].year}-01-01`, value: cumulative })
      }
      chart.addLineSeries({ color: 'red', title: 'Inflation', lineStyle: LineStyle.Dashed }).setData(infitems)
    }

    // const cpyfilterd = spy.filter(({ year }) => year >= startDate && year <= endDate)
    // const spyitems: Array<{ time: string; value: number }> = []
    // for (let i = 0; i < cpyfilterd.length; i++) {
    //   const cumulative = i === 0 ? 1 : (1 + cpyfilterd[i].value / 100) * spyitems[i - 1].value
    //   spyitems.push({ time: `${cpyfilterd[i].year}-01-01`, value: cumulative })
    // }
    // chart.addLineSeries({ color: 'blue', title: 'SPY', lineStyle: LineStyle.Dashed }).setData(spyitems)

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [chartRef, allocations, startDate, endDate, showInflation, showActives])

  const [show_cash_usd, set_show_cash_usd] = useState(true)
  const [show_inflation, set_show_inflation] = useState(true)
  const [show_deposit_uah, set_show_deposit_uah] = useState(false)
  const [show_deposit_usd, set_show_deposit_usd] = useState(false)
  const demo_chart_data = useMemo(() => {
    const result: Record<string, Record<string, number>> = {}
    if (show_cash_usd) {
      result['cash_usd'] = cash_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})
    }
    if (show_deposit_uah) {
      result['deposit_uah'] = deposit_uah.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})
    }
    if (show_deposit_usd) {
      result['deposit_usd'] = deposit_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})
    }
    if (show_inflation) {
      result['inflation'] = inflation.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})
    }
    return result
  }, [show_cash_usd, show_deposit_uah, show_deposit_usd])

  return (
    <main>
      <div className="container py-5">
        <h1 className="text-center">👇 из-за вот этого смысла нету</h1>
        <div className="row">
          <div className="col-8">{Object.keys(data).length && <CumulativeLinesChart title="demo" data={demo_chart_data} />}</div>
          <div className="col-4">
            <CheckboxDemo id="show_inflation" checked={show_inflation} setChecked={set_show_inflation} />
            <CheckboxDemo id="show_cash_usd" checked={show_cash_usd} setChecked={set_show_cash_usd} />
            <CheckboxDemo id="show_deposit_uah" checked={show_deposit_uah} setChecked={set_show_deposit_uah} />
            <CheckboxDemo id="show_deposit_usd" checked={show_deposit_usd} setChecked={set_show_deposit_usd} />
          </div>
        </div>

        <hr />

        <details>
          <summary>графики</summary>

          {/* <h1 className="text-center">🇺🇦 Market</h1> */}
          {/* <BarChart title="Hello World" labels={inflation.map((x) => x.year.toString())} data={{ inflation: inflation.map((x) => x.value / 100), usd: cash_usd.map((x) => x.value / 100) }} /> */}
          {/* <BarChart title="Hello World" labels={cash_usd.map((x) => x.year.toString())} data={{ usd: cash_usd.map((x) => x.value / 100) }} /> */}
          <PercentageBarChart title="cash_usd" data={cash_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} inversed={true} />
          <PercentageBarChart title="inflation" data={inflation.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} inversed={true} />
          <PercentageBarChart title="deposit_uah" data={deposit_uah.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} />
          <PercentageBarChart title="deposit_usd" data={deposit_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} />
          <hr />
          <CumulativeLineChart title="cash_usd" data={cash_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} />
          <CumulativeLineChart title="deposit_uah" data={deposit_uah.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {})} />
          <hr />
          <CumulativeLinesChart
            title="demo"
            data={{
              cash_usd: cash_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {}),
              deposit_uah: deposit_uah.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {}),
            }}
          />
          <CumulativeLinesChart
            title="wtf"
            data={{
              cash_usd: cash_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {}),
              deposit_uah: deposit_uah.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {}),
              deposit_usd: deposit_usd.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value / 100 }), {}),
            }}
          />
        </details>

        <h2>Крок перший - оберімо активи</h2>
        <p>
          Ось перелік інструментів що так чи інакше доступні пересічному громадянину, починаючи від найбільш консервативного варіанту тримати гроші під матрацом і закінчуючи найбіль прибутковим але і
          ризиковим фондовим ринком.
        </p>
        <p>Спробуйте клікнути по будь якому з активів за для того щоб переглянути трохи більше деталей, цікафі факти та додати його до портфелю.</p>
        <div className="row">
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">Готівка</div>
              <div className="text-secondary">Долар</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">Депозит</div>
              <div className="text-secondary">Гривня</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">Депозит</div>
              <div className="text-secondary">Долар</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">ОВДП</div>
              <div className="text-secondary">Гривня</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">ОВДП</div>
              <div className="text-secondary">Долар</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">Фондовий ринок</div>
              <div className="text-secondary">Долар</div>
            </div>
            <div>
              <div className="lead text-success">
                <i className="fa-solid fa-arrow-up me-2" />
                4.4%
              </div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="text-secondary me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">Страховка</div>
              <div className="text-secondary">Гривня</div>
            </div>
            <div>
              <div className="lead text-secondary">Coming soon</div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
          <div className="text-secondary me-3 mb-3 col-auto rounded border p-3 d-flex align-items-center justify-content-between">
            <div className="me-3">
              <div className="lead">НПФ</div>
              <div className="text-secondary">Гривня</div>
            </div>
            <div>
              <div className="lead text-secondary">Coming soon</div>
              <div className="text-secondary">
                <small>10Y CAGR</small>
              </div>
            </div>
          </div>
        </div>

        <table align="center">
          <tbody>
            <tr>
              <td className="pe-5">
                <div style={{ maxWidth: '200px' }}>
                  <PieChart data={allocations.reduce((acc, x) => Object.assign(acc, { [x.id]: x.value }), {})} title="Allocation" />
                </div>
              </td>
              <td>
                <p className="text-center">Allocation</p>
                <table>
                  <tbody>
                    {allocations.map(({ id, value, locked }, idx) => (
                      <tr key={id}>
                        <td>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" checked={locked} onChange={() => handleLockedToggle(id)} />
                          </div>
                        </td>
                        <td>
                          <input
                            className="form-range"
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={value}
                            onChange={(event) => handleAllocationChange(id, event.target.valueAsNumber, locked)}
                            disabled={locked}
                          />
                        </td>
                        <td className="px-2">
                          <input
                            className="form-control"
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={value}
                            onChange={(event) => handleAllocationChange(id, event.target.valueAsNumber, locked)}
                            disabled={locked}
                          />
                        </td>
                        <td className="px-2">{id}</td>
                        <td>
                          <div style={{ backgroundColor: `rgba(${colors[idx]}, 1)`, width: '20px' }}>&nbsp;</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td className="ps-2">
                <p className="text-center">Date range</p>
                <table align="center">
                  <tbody>
                    <tr>
                      <td colSpan={3}>
                        <div style={{ display: 'flex' }}>
                          <input
                            className="form-range"
                            type="range"
                            min={minDate}
                            max={Math.min(maxDate, endDate) - 1}
                            step={1}
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.valueAsNumber)}
                            style={{ paddingRight: 0, marginRight: 0, borderRight: 'none' }}
                          />
                          <input
                            className="form-range"
                            type="range"
                            min={Math.max(minDate, startDate) + 1}
                            max={maxDate}
                            step={1}
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.valueAsNumber)}
                            style={{ paddingLeft: 0, marginLeft: 0, borderLeft: 'none' }}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" valign="middle">
                        <input className="form-control" type="number" min={minDate} max={maxDate} value={startDate} onChange={(event) => setStartDate(event.target.valueAsNumber)} />
                      </td>
                      <td align="center" valign="middle">
                        <small>{endDate - startDate} year(s)</small>
                      </td>
                      <td align="right" valign="middle">
                        <input className="form-control" type="number" min={minDate} max={maxDate} value={endDate} onChange={(event) => setEndDate(event.target.valueAsNumber)} />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-center mt-3">
                  <div className="row gy-2 gx-3 align-items-center">
                    <div className="col-auto">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={showInflation} onChange={() => setShowInflation(!showInflation)} id="showInflation" />
                        <label className="form-check-label" htmlFor="showInflation">
                          inflation
                        </label>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={showActives} onChange={() => setShowActives(!showActives)} id="showActives" />
                        <label className="form-check-label" htmlFor="showActives">
                          actives
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="row">
          <div className="col-6">
            <PercentageBarChart title="portfolio" data={portfolio.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value }), {})} />
          </div>
          <div className="col-6">
            <div ref={chartRef} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default Market

export const Head: HeadFC = () => <title>UA Market</title>
