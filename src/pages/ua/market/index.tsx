import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import '../../../styles/common.css'
import { HeadFC } from 'gatsby'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { LineStyle, createChart } from 'lightweight-charts'

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
const colors = ['55, 162, 235', '255, 99, 132', '76, 191, 192', '254, 159, 64', '154, 102, 255', '255, 205, 86']

const inflation = [
  { year: 1998, value: 20 },
  { year: 1999, value: 19.2 },
  { year: 2000, value: 25.8 },
  { year: 2001, value: 6.1 },
  { year: 2002, value: -0.6 },
  { year: 2003, value: 8.2 },
  { year: 2004, value: 12.3 },
  { year: 2005, value: 10.3 },
  { year: 2006, value: 11.6 },
  { year: 2007, value: 16.6 },
  { year: 2008, value: 22.3 },
  { year: 2009, value: 12.3 },
  { year: 2010, value: 9.1 },
  { year: 2011, value: 4.6 },
  { year: 2012, value: -0.2 },
  { year: 2013, value: 0.5 },
  { year: 2014, value: 24.9 },
  { year: 2015, value: 43.3 },
  { year: 2016, value: 12.4 },
  { year: 2017, value: 13.7 },
  { year: 2018, value: 9.8 },
  { year: 2019, value: 4.1 },
  { year: 2020, value: 5 },
  { year: 2021, value: 10 },
  { year: 2022, value: 26.6 },
  { year: 2023, value: 3.8 },
  { year: 2024, value: 3.8 },
]

const exchange_rate = [
  { year: 1998, value: 2.44 },
  { year: 1999, value: 4.13 },
  { year: 2000, value: 5.44 },
  { year: 2001, value: 5.37 },
  { year: 2002, value: 5.32 },
  { year: 2003, value: 5.33 },
  { year: 2004, value: 5.31 },
  { year: 2005, value: 5.12 },
  { year: 2006, value: 5.05 },
  { year: 2007, value: 5.05 },
  { year: 2008, value: 5.26 },
  { year: 2009, value: 7.79 },
  { year: 2010, value: 7.93 },
  { year: 2011, value: 7.94 },
  { year: 2012, value: 7.99 },
  { year: 2013, value: 7.99 },
  { year: 2014, value: 10.95 },
  { year: 2015, value: 23.44 },
  { year: 2016, value: 26.2 },
  { year: 2017, value: 26.98 },
  { year: 2018, value: 26.54 },
  { year: 2019, value: 27.25 },
  { year: 2020, value: 28.06 },
  { year: 2021, value: 27.89 },
  { year: 2022, value: 29.25 },
  { year: 2023, value: 36.57 },
  { year: 2024, value: 42 },
]

const deposit_uah = [
  { year: 1998, value: 40 },
  { year: 1999, value: 49.2 },
  { year: 2000, value: 31.8 },
  { year: 2001, value: 20.3 },
  { year: 2002, value: 22.5 },
  { year: 2003, value: 15.5 },
  { year: 2004, value: 16.4 },
  { year: 2005, value: 15.5 },
  { year: 2006, value: 14.7 },
  { year: 2007, value: 14.5 },
  { year: 2008, value: 10.7 },
  { year: 2009, value: 20 },
  { year: 2010, value: 17 },
  { year: 2011, value: 14.4 },
  { year: 2012, value: 16.3 },
  { year: 2013, value: 17.7 },
  { year: 2014, value: 19.5 },
  { year: 2015, value: 21 },
  { year: 2016, value: 20 },
  { year: 2017, value: 16.4 },
  { year: 2018, value: 14.1 },
  { year: 2019, value: 15.5 },
  { year: 2020, value: 11.9 },
  { year: 2021, value: 8.4 },
  { year: 2022, value: 8.8 },
  { year: 2023, value: 13.9 },
  { year: 2024, value: 13.1 },
]

const deposit_usd = [
  { year: 1998, value: 6.8 },
  { year: 1999, value: 6.8 },
  { year: 2000, value: 6.8 },
  { year: 2001, value: 6 },
  { year: 2002, value: 8.4 },
  { year: 2003, value: 8.4 },
  { year: 2004, value: 10.5 },
  { year: 2005, value: 10.6 },
  { year: 2006, value: 10.1 },
  { year: 2007, value: 9.8 },
  { year: 2008, value: 10.1 },
  { year: 2009, value: 13.3 },
  { year: 2010, value: 11.6 },
  { year: 2011, value: 7.8 },
  { year: 2012, value: 7.5 },
  { year: 2013, value: 6.8 },
  { year: 2014, value: 8.3 },
  { year: 2015, value: 9.1 },
  { year: 2016, value: 6.8 },
  { year: 2017, value: 4.8 },
  { year: 2018, value: 3.3 },
  { year: 2019, value: 3.4 },
  { year: 2020, value: 1.2 },
  { year: 2021, value: 1 },
  { year: 2022, value: 0.8 },
  { year: 2023, value: 0.8 },
  { year: 2024, value: 3.4 },
]

const ovdp_uah = [
  { year: 2009, value: 12.21 },
  { year: 2010, value: 10.4 },
  { year: 2011, value: 9.2 },
  { year: 2012, value: 12.9 },
  { year: 2013, value: 13.1 },
  { year: 2014, value: 14 },
  { year: 2015, value: 13.1 },
  { year: 2016, value: 9.2 },
  { year: 2017, value: 10.5 },
  { year: 2018, value: 17.8 },
  { year: 2019, value: 16.9 },
  { year: 2020, value: 10.2 },
  { year: 2021, value: 11.3 },
  { year: 2022, value: 18.3 },
  { year: 2023, value: 19 },
  { year: 2024, value: 13.1 },
]

const ovdp_usd = [
  { year: 2011, value: 8.92 },
  { year: 2012, value: 8.92 },
  { year: 2013, value: 7.63 },
  { year: 2014, value: 5.8 },
  { year: 2015, value: 8.74 },
  { year: 2016, value: 7.29 },
  { year: 2017, value: 4.8 },
  { year: 2018, value: 5.97 },
  { year: 2019, value: 5.88 },
  { year: 2020, value: 3.38 },
  { year: 2021, value: 3.75 },
  { year: 2022, value: 3.98 },
  { year: 2023, value: 4.71 },
  { year: 2024, value: 4.71 },
]

const spy = [
  { year: 1998, value: 28.34 },
  { year: 1999, value: 20.89 },
  { year: 2000, value: -9.03 },
  { year: 2001, value: -11.85 },
  { year: 2002, value: -21.97 },
  { year: 2003, value: 28.36 },
  { year: 2004, value: 10.74 },
  { year: 2005, value: 4.83 },
  { year: 2006, value: 15.61 },
  { year: 2007, value: 5.48 },
  { year: 2008, value: -36.55 },
  { year: 2009, value: 25.94 },
  { year: 2010, value: 14.82 },
  { year: 2011, value: 2.1 },
  { year: 2012, value: 15.89 },
  { year: 2013, value: 32.15 },
  { year: 2014, value: 13.52 },
  { year: 2015, value: 1.38 },
  { year: 2016, value: 11.77 },
  { year: 2017, value: 21.61 },
  { year: 2018, value: -4.23 },
  { year: 2019, value: 31.21 },
  { year: 2020, value: 18.02 },
  { year: 2021, value: 28.47 },
  { year: 2022, value: -18.01 },
  { year: 2023, value: 24.29 },
  { year: 2024, value: 12.7 },
]

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

const Market = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  const [showInflation, setShowInflation] = useState(true)
  const [showActives, setShowActives] = useState(true)

  const data = { deposit_uah, deposit_usd, ovdp_uah, ovdp_usd, spy }
  const [allocations, setAllocations] = useState<Allocatable[]>([
    { id: 'deposit_uah', value: 20, locked: false },
    { id: 'deposit_usd', value: 20, locked: false },
    { id: 'ovdp_uah', value: 20, locked: false },
    { id: 'ovdp_usd', value: 20, locked: false },
    { id: 'spy', value: 20, locked: false },
  ])

  const [minDate, setMinDate] = useState(
    Math.max(
      ...[
        Math.min(...data.deposit_uah.map((x) => x.year)),
        Math.min(...data.deposit_usd.map((x) => x.year)),
        Math.min(...data.ovdp_uah.map((x) => x.year)),
        Math.min(...data.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [maxDate, setMaxDate] = useState(
    Math.min(
      ...[
        Math.max(...data.deposit_uah.map((x) => x.year)),
        Math.max(...data.deposit_usd.map((x) => x.year)),
        Math.max(...data.ovdp_uah.map((x) => x.year)),
        Math.max(...data.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [startDate, setStartDate] = useState(
    Math.max(
      ...[
        Math.min(...data.deposit_uah.map((x) => x.year)),
        Math.min(...data.deposit_usd.map((x) => x.year)),
        Math.min(...data.ovdp_uah.map((x) => x.year)),
        Math.min(...data.ovdp_usd.map((x) => x.year)),
      ]
    )
  )
  const [endDate, setEndDate] = useState(
    Math.min(
      ...[
        Math.max(...data.deposit_uah.map((x) => x.year)),
        Math.max(...data.deposit_usd.map((x) => x.year)),
        Math.max(...data.ovdp_uah.map((x) => x.year)),
        Math.max(...data.ovdp_usd.map((x) => x.year)),
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
        id === 'deposit_uah' ? data.deposit_uah : id === 'deposit_usd' ? data.deposit_usd : id === 'ovdp_uah' ? data.ovdp_uah : id === 'ovdp_usd' ? data.ovdp_usd : id === 'spy' ? data.spy : null
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
    console.log(portfolioCombined)
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

  return (
    <main>
      <div className="container py-5">
        {/* <h1 className="text-center">🇺🇦 Market</h1> */}

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
              <td>
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
              </td>
            </tr>
          </tbody>
        </table>

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
        <div ref={chartRef} />
      </div>
    </main>
  )
}

export default Market

export const Head: HeadFC = () => <title>UA Market</title>
