import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import '../../styles/common.css'
import { Header } from '../../components/header'
import { useState, useEffect, useRef, useMemo } from 'react'
import { YahooChartRow, queryChart } from '../../utils/yahoo'
import { createChart, UTCTimestamp } from 'lightweight-charts'
import { currency } from '../../utils/formatters'
import 'chart.js/auto'
import { Chart } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js'

interface Allocatable {
  id: string
  value: number
  locked: boolean
}

function ago(start: Date | number, end: Date | number | null = null) {
  start = new Date(start)
  end = end ? new Date(end) : new Date()
  var difference = (end.getTime() - start.getTime()) / 1000
  var periods = [
    ['second', 'seconds', 'seconds'],
    ['minute', 'minutes', 'minutes'],
    ['hour', 'hours', 'hours'],
    ['day', 'days', 'days'],
    ['week', 'weeks', 'weeks'],
    ['month', 'months', 'months'],
    ['year', 'years', 'years'],
  ]
  var lengths = [60, 60, 24, 7, 4.35, 12]

  for (var i = 0; difference >= lengths[i]; i++) {
    difference = difference / lengths[i]
  }

  difference = Math.round(difference)

  const cases = [2, 0, 1, 1, 1, 2]
  const text = periods[i][difference % 100 > 4 && difference % 100 < 20 ? 2 : cases[Math.min(difference % 10, 5)]]
  return difference + ' ' + text
}

function allocate(state: Allocatable[], next: Allocatable): Allocatable[] {
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

const Allocator: React.FC = () => {
  const colors = ['55, 162, 235', '255, 99, 132', '76, 191, 192', '254, 159, 64', '154, 102, 255', '255, 205, 86']
  const [yahoo, setYahoo] = useState<Record<string, YahooChartRow[]>>({})
  const oneDay = 86400000
  const [minDate, setMinDate] = useState(new Date(new Date().getFullYear() - 3, new Date().getMonth(), new Date().getDate(), 0, 0, 0).getTime())
  const [maxDate, setMaxDate] = useState(new Date(new Date().toISOString().split('T').shift()!).getTime() - oneDay)
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate(), 0, 0, 0).getTime())
  const [endDate, setEndDate] = useState(new Date(new Date().toISOString().split('T').shift()!).getTime() - oneDay)
  const [input, setInput] = useState('META, PEP\n\nTLT')

  const lineRef = useRef<HTMLDivElement>(null)

  const [allocations, setAllocations] = useState<Allocatable[]>([
    { id: 'A', value: 25, locked: false },
    { id: 'B', value: 25, locked: false },
    { id: 'C', value: 25, locked: false },
    { id: 'D', value: 25, locked: false },
  ])

  const [displayMin, setDisplayMin] = useState(true)
  const [displayMax, setDisplayMax] = useState(true)
  const [displayAvg, setDisplayAvg] = useState(false)
  const [displayBenchmark, setDisplayBenchmark] = useState(true)
  const [displaySymbols, setDisplaySymbols] = useState(true)

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
    if (!lineRef.current || !yahoo['VOO']) {
      return
    }

    const chart = createChart(lineRef.current, {
      width: lineRef.current.clientWidth,
      height: lineRef.current.clientHeight, // Math.floor(lineRef.current.clientWidth / 3),
      handleScale: true,
      handleScroll: true,
      localization: { priceFormatter: Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format },
    })

    const max: Record<string, number> = {}
    const min: Record<string, number> = {}
    const avg: Record<string, number[]> = {}
    const portfolio: Record<string, number> = {}
    for (const symbol in yahoo) {
      if (symbol === 'VOO') {
        continue
      }
      const data = yahoo[symbol]
        .filter(({ date }) => new Date(date).getTime() >= startDate && new Date(date).getTime() <= endDate)
        .map(({ date, close }, i, arr) => {
          const time = date.toISOString().split('T').shift()! // Math.round(date.getTime() / 1000) as UTCTimestamp
          const perf = ((close - arr[0].close) / arr[0].close) * 100
          if (!max[time] || perf > max[time]) {
            max[time] = perf
          }
          if (!min[time] || perf < min[time]) {
            min[time] = perf
          }
          if (!avg[time]) {
            avg[time] = []
          }
          avg[time].push(perf)
          if (!portfolio[time]) {
            portfolio[time] = 0
          }
          portfolio[time] += (allocations.find((x) => x.id === symbol)!.value / 100) * perf
          return { time: time, value: perf }
        })
      if (displaySymbols) {
        const series = chart.addLineSeries({
          title: symbol,
          color: symbol === 'VOO' ? 'rgba(255,165,0, 1.0)' : `rgba(${colors[Object.keys(yahoo).indexOf(symbol)]}, 0.3)`,
        })
        series.setData(data)
      }
    }

    if (displayMin) {
      const minSeries = chart.addLineSeries({
        title: 'min',
        color: 'rgba(200, 0, 0, 0.8)',
        // lineStyle: LineStyle.Dotted,
        // lineType: LineType.Curved,
      })
      minSeries.setData(Object.entries(min).map(([time, value]) => ({ time, value })))
    }
    if (displayMax) {
      const maxSeries = chart.addLineSeries({
        title: 'max',
        color: 'rgba(0, 200, 0, 0.8)',
        // lineStyle: LineStyle.Dotted,
        // lineType: LineType.Curved,
      })
      maxSeries.setData(Object.entries(max).map(([time, value]) => ({ time, value })))
    }

    if (displayAvg) {
      const avgSeries = chart.addLineSeries({
        title: 'avg',
        color: 'rgba(100, 100, 100, 0.4)',
        // lineStyle: LineStyle.Dotted,
        // lineType: LineType.Curved,
      })
      avgSeries.setData(Object.entries(avg).map(([time, values]) => ({ time, value: values.reduce((a, b) => a + b, 0) / values.length })))
    }

    if (displayBenchmark) {
      const vooSeries = chart.addLineSeries({
        title: 'VOO',
        color: 'rgba(255,165,0, 1.0)',
        // lineStyle: LineStyle.Dotted,
        // lineType: LineType.Curved,
      })
      vooSeries.setData(
        yahoo['VOO']
          .filter(({ date }) => new Date(date).getTime() >= startDate && new Date(date).getTime() <= endDate)
          .map(({ date, close }, i, arr) => {
            const perf = ((close - arr[0].close) / arr[0].close) * 100
            return { time: (date.getTime() / 1000) as UTCTimestamp, value: perf }
          })
      )
    }

    const portfolioSeries = chart.addLineSeries({
      title: 'portfolio',
      color: 'rgba(0, 0, 0, 1.0)',
    })
    portfolioSeries.setData(Object.entries(portfolio).map(([time, value]) => ({ time, value })))

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [yahoo, allocations, startDate, endDate, displayMin, displayMax, displayAvg, displayBenchmark, displaySymbols])

  const submit = async () => {
    let symbols = input
      .replace(/[\s,]+/g, ',')
      .split(',')
      .filter((symbol) => !!symbol)
    console.log('submitted', symbols)

    const yahoo: Record<string, YahooChartRow[]> = {}
    for (const symbol of symbols) {
      try {
        yahoo[symbol] = await queryChart(symbol, new Date(948924000000), new Date(new Date().setHours(0, 0, 0, 0)))
        console.log('yfinance', symbol, yahoo[symbol].length)
      } catch (error) {
        console.error('yfinance', symbol, error instanceof Error ? error.message : error)
      }
    }
    symbols = Object.keys(yahoo)
    yahoo['VOO'] = await queryChart('VOO', new Date(948924000000), new Date(new Date().setHours(0, 0, 0, 0)))
    setYahoo(yahoo)

    const minDate = new Date(Math.max(...Object.values(yahoo).map((data) => new Date(data[253].date).getTime()))).getTime()
    const maxDate = new Date(Math.min(...Object.values(yahoo).map((data) => new Date(data[data.length - 1].date).getTime()))).getTime()
    setMinDate(minDate)
    setMaxDate(maxDate)
    setStartDate(minDate)
    setEndDate(maxDate)
    console.log('dates', new Date(minDate).toISOString().split('T').shift(), new Date(maxDate).toISOString().split('T').shift())

    const allocations = symbols.map((id) => ({ id, value: Math.round(100 / symbols.length), locked: false }))
    if (symbols.length % 2 !== 0) {
      allocations[0].value += 1
    }
    setAllocations(allocations)
    // setInput(symbols.join(', '))
    console.log('allocations', allocations)
  }

  useEffect(() => {
    submit()
  }, [])

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h2>&Alpha;&Iota;&Iota;&Theta;&Kappa;&Alpha;&Tau;&Theta;&Rho;</h2>
        <p>Метою цього тула є наглядна демонстрація того як саме аллокація впливає на дохідність портфелю.</p>
        <p>Спробуйте підібрати таку аллокацію при котрій ваш портфель дасть більш менш співставну дохідність відносно ринку</p>
        <p>А потім, саме цікаве - змініть період, хоч трохи - пазл має відразу скластися :)</p>

        <div className="row">
          <div className="col-2">
            <p className="text-center">
              <b>Крок 1: акції</b>
            </p>
            <p className="text-center">
              <button className="btn btn-primary btn-sm" onClick={submit}>
                submit
              </button>
            </p>
            <textarea className="form-control" rows={4} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div className="col-6">
            <p className="text-center">
              <b>Крок 2: аллокація</b>
            </p>
            <div className="row">
              <div className="col-4">
                <Chart
                  type="doughnut"
                  options={{
                    responsive: true,
                    animation: false,
                    plugins: {
                      title: {
                        display: false,
                      },
                      legend: {
                        display: false,
                      },
                    },
                  }}
                  data={{
                    labels: allocations.map((x) => x.id),
                    datasets: [
                      {
                        label: '%',
                        data: allocations.map((x) => x.value),
                      },
                    ],
                  }}
                />
              </div>
              <div className="col-8">
                <table className="table table-borderless align-middle table-sm">
                  <tbody>
                    {allocations.map(({ id, value, locked }) => (
                      <tr key={id}>
                        <td className="text-center">{id}</td>
                        <td>
                          <input
                            className="form-control"
                            type="number"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => handleAllocationChange(id, e.target.valueAsNumber, locked)}
                            disabled={locked}
                            style={{ width: '5em' }}
                          />
                        </td>
                        <td>
                          <input className="form-range" type="range" min="0" max="100" value={value} onChange={(e) => handleAllocationChange(id, e.target.valueAsNumber, locked)} disabled={locked} />
                        </td>
                        <td>
                          <input className="form-check-input" type="checkbox" checked={locked} onChange={() => handleLockedToggle(id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="text-center">&Sigma;</td>
                      <td className="text-center">
                        <input className="form-control" type="number" min="0" max="100" value={allocations.reduce((acc, a) => acc + a.value, 0)} disabled={true} style={{ width: '5em' }} />
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={handleEqualize}>
                          equalize
                        </button>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div className="col-4">
            <p className="text-center">
              <b>Крок 3: період</b>
            </p>
            <table className="table table-borderless align-middle table-sm">
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div style={{ display: 'flex' }}>
                      <input
                        className="form-range"
                        type="range"
                        min={minDate}
                        max={Math.min(maxDate, endDate)}
                        step={oneDay}
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.valueAsNumber)}
                        style={{ paddingRight: 0, marginRight: 0, borderRight: 'none' }}
                      />
                      <input
                        className="form-range"
                        type="range"
                        min={Math.max(minDate, startDate)}
                        max={maxDate}
                        step={oneDay}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.valueAsNumber)}
                        style={{ paddingLeft: 0, marginLeft: 0, borderLeft: 'none' }}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="middle">
                    <input
                      className="form-control"
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={new Date(startDate).toISOString().split('T').shift()}
                      onChange={(event) => setStartDate(event.target.valueAsNumber)}
                    />
                  </td>
                  <td align="center" valign="middle">
                    <small>{ago(startDate, endDate)}</small>
                  </td>
                  <td align="right" valign="middle">
                    <input
                      className="form-control"
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={new Date(endDate).toISOString().split('T').shift()}
                      onChange={(event) => setEndDate(event.target.valueAsNumber)}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <table width="100%">
                      <tbody>
                        <tr>
                          <td align="left" valign="top">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setStartDate(minDate)}>
                              min
                            </button>
                            <br />
                            <button
                              title="start of year"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                setStartDate(
                                  new Date(minDate).getFullYear() === new Date(startDate).getFullYear()
                                    ? new Date(new Date(startDate).getFullYear() + 1, 0, 1, 12, 0, 0, 0).getTime()
                                    : new Date(new Date(startDate).getFullYear(), 0, 1, 12, 0, 0, 0).getTime()
                                )
                              }
                            >
                              soy
                            </button>
                            <button
                              title="end of year"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setStartDate(new Date(new Date(startDate).getFullYear(), 11, 31, 23, 59, 59, 999).getTime())}
                            >
                              eoy
                            </button>
                            {/* <br />
                                <button>6m</button>
                                <button>1y</button>
                                <button>3y</button>
                                <button>5y</button> */}
                          </td>
                          <td align="right" valign="top">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setEndDate(maxDate)}>
                              max
                            </button>
                            <br />
                            <button title="start of year" className="btn btn-sm btn-outline-primary" onClick={() => setEndDate(new Date(new Date(endDate).getFullYear(), 0, 1, 12, 0, 0, 0).getTime())}>
                              soy
                            </button>
                            <button
                              title="end of year"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                setEndDate(
                                  new Date().getFullYear() === new Date(endDate).getFullYear()
                                    ? new Date(new Date(endDate).getFullYear() - 1, 11, 31, 23, 59, 59, 999).getTime()
                                    : new Date(new Date(endDate).getFullYear(), 11, 31, 23, 59, 59, 999).getTime()
                                )
                              }
                            >
                              eoy
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="d-flex">
            <div className="form-check me-3" title="Відображати мінімальну дохідність">
              <input className="form-check-input" type="checkbox" id="displayMin" checked={displayMin} onChange={() => setDisplayMin(!displayMin)} />
              <label className="form-check-label" htmlFor="displayMin">
                min
              </label>
            </div>
            <div className="form-check me-3" title="Відображати середню дохідність">
              <input className="form-check-input" type="checkbox" id="displayAvg" checked={displayAvg} onChange={() => setDisplayAvg(!displayAvg)} />
              <label className="form-check-label" htmlFor="displayAvg">
                avg
              </label>
            </div>
            <div className="form-check me-3" title="Відображати максимально можливу дохідність">
              <input className="form-check-input" type="checkbox" id="displayMax" checked={displayMax} onChange={() => setDisplayMax(!displayMax)} />
              <label className="form-check-label" htmlFor="displayMax">
                max
              </label>
            </div>
            <div className="form-check me-3" title="Відображати дохідність ринку">
              <input className="form-check-input" type="checkbox" id="displayBenchmark" checked={displayBenchmark} onChange={() => setDisplayBenchmark(!displayBenchmark)} />
              <label className="form-check-label" htmlFor="displayBenchmark">
                benchmark
              </label>
            </div>
            <div className="form-check me-3" title="Відображати дохідність акцій">
              <input className="form-check-input" type="checkbox" id="displaySymbols" checked={displaySymbols} onChange={() => setDisplaySymbols(!displaySymbols)} />
              <label className="form-check-label" htmlFor="displaySymbols">
                symbols
              </label>
            </div>
            <div className="text-secondary">👈 спробуйте попереключати режими за для більш зручної роботи</div>
          </div>
          <div ref={lineRef} style={{ height: '300px' }} />
        </div>

        <div className="my-5">
          <p>
            Задумайтеся теперь ось про що - усілякі блогери, репорти і т.п. показують якусь цифру дохідність за якийсь період, та навіть portfolio visualizer робить теж саме - тепер, побачивши як це
            працює в динаміці ви вже ніколи не будете дивитися на це так само
          </p>
        </div>

        <div className="my-5">
          <h2>Як це порахувати</h2>
          <p>
            На прикладі{' '}
            {Object.keys(yahoo)
              .filter((t) => t !== 'VOO')
              .join(', ')}
            , нам потрібні історичні данні, беремо їх з Yahoo Finance, якщо ж розрахунок робиться в Google Sheets то за допомогою ф-ії GOOGLEFINANCE
          </p>
          <p>Маючи історичні данні, дохідність акції за період складатиме (end_price - start_price) / start_price * 100 відсотків</p>
          {yahoo && Object.keys(yahoo).length > 0 && (
            <p>
              Тобто якщо купували {Object.keys(yahoo)[0]} за ${round(yahoo[Object.keys(yahoo)[0]][0].close, 2)}, а продали за $
              {round(yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close, 2)}, то дохідність складатиме (
              {round(yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close, 2)} - {round(yahoo[Object.keys(yahoo)[0]][0].close, 2)}) /{' '}
              {round(yahoo[Object.keys(yahoo)[0]][0].close, 2)} * 100 ={' '}
              {round(((yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close - yahoo[Object.keys(yahoo)[0]][0].close) / yahoo[Object.keys(yahoo)[0]][0].close) * 100, 2)}%
            </p>
          )}
          <p>Наступний крок - аллокації активів</p>
          <p>Тут все дуже просто, нам необхиодмо помножити дохідність кожного з активів на його аллокацію, та скласти результати - це і буде дохідністью портфеля</p>
          {yahoo && Object.keys(yahoo).length > 1 && (
            <>
              <p>
                Так наприклад, уявімо що наш портфель має 70% {Object.keys(yahoo)[0]} та 30% {Object.keys(yahoo)[1]}
              </p>
              <p>
                {Object.keys(yahoo)[0]} мі купували по ${round(yahoo[Object.keys(yahoo)[0]][0].close, 2)} і зараз вона коштує $
                {round(yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close, 2)}, отже дохідність (
                {round(yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close, 2)} - {round(yahoo[Object.keys(yahoo)[0]][0].close, 2)})/
                {round(yahoo[Object.keys(yahoo)[0]][0].close, 2)} ={' '}
                {round((yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close - yahoo[Object.keys(yahoo)[0]][0].close) / yahoo[Object.keys(yahoo)[0]][0].close, 2)}
              </p>
              <p>
                {Object.keys(yahoo)[1]} мі купували по ${round(yahoo[Object.keys(yahoo)[1]][0].close, 2)} і зараз вона коштує $
                {round(yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close, 2)}, отже дохідність (
                {round(yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close, 2)} - {round(yahoo[Object.keys(yahoo)[1]][0].close, 2)})/
                {round(yahoo[Object.keys(yahoo)[1]][0].close, 2)} ={' '}
                {round((yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close - yahoo[Object.keys(yahoo)[1]][0].close) / yahoo[Object.keys(yahoo)[1]][0].close, 2)}
              </p>
              <p>
                Таким чином, дохідність портфеля складе ({Object.keys(yahoo)[0].toLowerCase()}_performance * {Object.keys(yahoo)[0].toLowerCase()}_allocation + {Object.keys(yahoo)[1].toLowerCase()}
                _performance * {Object.keys(yahoo)[1].toLowerCase()}_allocation) = (
                {round((yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close - yahoo[Object.keys(yahoo)[0]][0].close) / yahoo[Object.keys(yahoo)[0]][0].close, 2)} * 0.7 +{' '}
                {round((yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close - yahoo[Object.keys(yahoo)[1]][0].close) / yahoo[Object.keys(yahoo)[1]][0].close, 2)} * 0.3) ={' '}
                {round(
                  ((yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close - yahoo[Object.keys(yahoo)[0]][0].close) / yahoo[Object.keys(yahoo)[0]][0].close) * 0.7 +
                    ((yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close - yahoo[Object.keys(yahoo)[1]][0].close) / yahoo[Object.keys(yahoo)[1]][0].close) * 0.3,
                  2
                )}
                , тобто{' '}
                {round(
                  (((yahoo[Object.keys(yahoo)[0]][yahoo[Object.keys(yahoo)[0]].length - 1].close - yahoo[Object.keys(yahoo)[0]][0].close) / yahoo[Object.keys(yahoo)[0]][0].close) * 0.7 +
                    ((yahoo[Object.keys(yahoo)[1]][yahoo[Object.keys(yahoo)[1]].length - 1].close - yahoo[Object.keys(yahoo)[1]][0].close) / yahoo[Object.keys(yahoo)[1]][0].close) * 0.3) *
                    100,
                  2
                )}
                %
              </p>
              <p>Далі, кількість активів не важлива, хоч два, хоч двісті, розрахунок буде тим самим.</p>
            </>
          )}
        </div>

        <AllocateThemAll yahoo={yahoo} />
      </div>
    </main>
  )
}

export default Allocator
export const Head: HeadFC = () => <title>Allocator</title>

function round(num: number, dec: number): number {
  return Math.round(num * 10 ** dec) / 10 ** dec
}

function calculateAllocations(numberOfAssets = 1): number[][] {
  if (typeof numberOfAssets !== 'number' || numberOfAssets === 0 || numberOfAssets < 0) {
    // throw new Error('Invalid input')
    return []
  }
  if (numberOfAssets === 1) {
    return [[1]]
  }
  const step = 0.01

  function generateAllocations(assetsLeft: number, currentAllocation: number[] = []): number[][] {
    const sumSoFar = currentAllocation.reduce((a, b) => a + b, 0)
    if (assetsLeft === 1) {
      return [[...currentAllocation, round(1 - sumSoFar, 2)]]
    }

    const allocationsArray = []
    // for (let i = 0; i <= 1 - sumSoFar; i += step) {
    for (let i = 0; i <= 1 - sumSoFar + step / 2; i += step) {
      const allocation = [...currentAllocation, round(i, 2)]
      allocationsArray.push(...generateAllocations(assetsLeft - 1, allocation))
    }

    return allocationsArray
  }

  return generateAllocations(numberOfAssets)
}

function AllocateThemAll({ yahoo }: { yahoo: Record<string, YahooChartRow[]> }) {
  if (!yahoo || !Object.values(yahoo).length) {
    return null
  }
  const tickers = useMemo(() => Object.keys(yahoo).filter((t) => t !== 'VOO'), [yahoo])
  const allocations = useMemo(() => calculateAllocations(tickers.length), [tickers])
  const { data, min, max } = useMemo(() => {
    const data: Record<string, YahooChartRow[]> = Object.keys(yahoo)
      .filter((t) => t !== 'VOO')
      .reduce((acc, ticker) => Object.assign(acc, { [ticker]: yahoo[ticker].map((item) => ({ ...item, date: new Date(new Date(item.date).toISOString().split('T').shift()!) })) }), {})

    const min = Math.max(...Object.values(data).map((arr) => arr[0].date.getTime()))
    const max = Math.min(...Object.values(data).map((arr) => arr[arr.length - 1].date.getTime()))

    return {
      data: Object.keys(data).reduce(
        (acc, ticker) => Object.assign(acc, { [ticker]: data[ticker].filter((x) => new Date(x.date).getTime() >= min && new Date(x.date).getTime() <= max) }),
        {}
      ) as Record<string, YahooChartRow[]>,
      min,
      max,
    }
  }, [yahoo])

  if (!data || !Object.values(data).length || !tickers || !tickers.length) {
    return null
  }

  const simulateFewYears = (data: Record<string, YahooChartRow[]>, horizon: number) => {
    if (!data || !Object.values(data).length) {
      return null
    }
    const days = data[tickers[0]].length
    if (days < horizon) {
      return null
    }

    const report = []
    let best_allocation = undefined
    let best_performance = undefined
    for (const allocation of allocations) {
      const simulations = []
      for (let d = 0; d < days - horizon; d++) {
        let portfolio = 0
        for (const t of tickers) {
          const s = data[t][d].close
          const e = data[t][d + horizon].close
          const p = (e - s) / s
          const a = p * allocation[tickers.indexOf(t)]
          portfolio += a
        }
        simulations.push(portfolio)
      }
      const avg = simulations.reduce((a, b) => a + b, 0) / simulations.length
      if (avg > (best_performance || 0)) {
        best_performance = avg
        best_allocation = allocation
      }
      report.push({ allocation, performance: avg })
    }

    const top5 = report.sort((a, b) => b.performance - a.performance).slice(0, 5)

    return { report: top5, best_allocation, best_performance }
  }

  const oneYear = useMemo(() => simulateFewYears(data, 1 * 252), [data])
  const twoYears = useMemo(() => simulateFewYears(data, 2 * 252), [data])
  const fiveYears = useMemo(() => simulateFewYears(data, 5 * 252), [data])

  return (
    <div className="my-5">
      <h2>Allocate'em All 🤘🎸</h2>
      <p>
        Власне тул дозволяє візуально подивитися як аллокація впливає на результати портфелью, але ж ми як люди не в змозі переклікати та переварити усі варіації, саме тому, ось розрахунок який
        зробила машина переклікавши взагалі все доступні комбінації аллокацій на різних відрізках часу
      </p>

      <p>
        Загалом маємо {tickers.length} акцій, а отже існує {allocations.length} варіантів аллокації з кроком в 1%
      </p>

      <p>
        Маємо історію за {new Date(max).getFullYear() - new Date(min).getFullYear()} років, {Math.floor((max - min) / (1000 * 60 * 60 * 24))} днів, діапазон дат з{' '}
        {new Date(min).toISOString().split('T').shift()} до {new Date(max).toISOString().split('T').shift()}
      </p>

      <p>
        На прикладі горизонту в один рік, ми будемо рахувати усі {allocations.length} аллокацій, для усіх {Math.floor((max - min) / (1000 * 60 * 60 * 24))} днів, починаючи з{' '}
        {new Date(min).toISOString().split('T').shift()} і до максимальної дати мінус один рік {new Date(max - 86400000).toISOString().split('T').shift()}
      </p>

      <p>Так наприклад, беремо першву з {allocations.length} аллокацій</p>

      <ul>
        {tickers.map((t, i) => (
          <li key={t}>
            {t} - {round(allocations[0][i] * 100, 2)}%
          </li>
        ))}
      </ul>

      <p>І починаємо рахувати дохідності за рік, для кожного дня</p>

      <p>Так, для першого дня {new Date(min).toISOString().split('T').shift()}, мали наступні ціни</p>

      <ul>
        {tickers.map((t) => (
          <li key={t}>
            {t} - ${round(data[t][0].close || 0, 2)}
          </li>
        ))}
      </ul>

      <p>Через рік ({new Date(data[tickers[0]][252].date).toISOString().split('T').shift()}), ціни стали такими</p>

      <ul>
        {tickers.map((t) => (
          <li key={t}>
            {t} - ${round(data[t][252].close || 0, 2)}
          </li>
        ))}
      </ul>

      <p>Отже дохідність кожної окремої акції склала</p>

      <ul>
        {tickers.map((t, i) => (
          <li key={t}>
            {t} - {round((((data[t][252].close || 0) - (data[t][0].close || 0)) / (data[t][0].close || 1)) * 100, 2)}%
          </li>
        ))}
      </ul>

      <p>
        А отже дохідність портфеля складе{' '}
        {round((((data[tickers[tickers.length - 1]][252].close || 0) - (data[tickers[tickers.length - 1]][0].close || 0)) / (data[tickers[tickers.length - 1]][0].close || 1)) * 100, 2)}%
      </p>

      <p>Далі беремо наступний день {data[tickers[0]][1].date.toISOString().split('T').shift()} і повторюємо розрахунок</p>
      <p>Робимо так {Math.floor((max - min) / (1000 * 60 * 60 * 24))} разів для кожного дня</p>

      <p>Після чого беремо наступну аллокацію</p>

      <ul>
        {tickers.map((t, i) => (
          <li key={t}>
            {t} - {round(allocations[1][i] * 100, 2)}%
          </li>
        ))}
      </ul>

      <p>І знову перераховуемо усі дні</p>

      <p>Таким чином нам потрібно виконати 100500 мільоній розрахунків, що не є можливим для людини 🤷‍♂️</p>

      <p>Саме тому ми вимушуємо машину порахувати це за нас, нижче розрахунки на різних горизонтах</p>

      {oneYear && (
        <>
          <h3>1 year horizon</h3>
          <p>Отже, на горизонті одного року найкращими є наступні аллокації</p>
          <ul>
            {tickers.map((t, i) => (
              <li key={t}>
                {t} - {round(oneYear.best_allocation![i] * 100, 2)}%
              </li>
            ))}
          </ul>
          <p>Що дає середню дохідність - {round(oneYear.best_performance! * 100, 2)}%</p>
        </>
      )}

      {twoYears && (
        <>
          <h3>2 years horizon</h3>
          <p>Отже, на горизонті двух років найкращими є наступні аллокації</p>
          <ul>
            {tickers.map((t, i) => (
              <li key={t}>
                {t} - {round(twoYears.best_allocation![i] * 100, 2)}%
              </li>
            ))}
          </ul>
          <p>Що дає середню дохідність - {round(twoYears.best_performance! * 100, 2)}%</p>
        </>
      )}

      {fiveYears && (
        <>
          <h3>5 years horizon</h3>
          <p>Отже, на горизонті пʼяти років найкращими є наступні аллокації</p>
          <ul>
            {tickers.map((t, i) => (
              <li key={t}>
                {t} - {round(fiveYears.best_allocation![i] * 100, 2)}%
              </li>
            ))}
          </ul>
          <p>Що дає середню дохідність - {round(fiveYears.best_performance! * 100, 2)}%</p>
        </>
      )}

      <p>Уважний читач відразу помітить щось не ладне і запитаеться що відбувається?!</p>

      <p>
        Справа в тому, що не залежно від кількості активів, такий підхід вибиратиме завжди той актив що є найбільш прибутковим в середньому і підбирати аллокації лише за допомогою дохідності не є
        гарною ідеєю
      </p>
    </div>
  )
}
