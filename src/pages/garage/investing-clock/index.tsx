import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import { useRef, useState, useEffect, useMemo } from 'react'
import './styles.css'
import { Header } from '../../../components/header'
import Join from '../../../components/join'
import { proxy } from '../../../utils/proxy'

import 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'
import { BubbleDataPoint, Chart as ChartJs, ChartTypeRegistry, Point } from 'chart.js/auto'
import { Chart, getElementAtEvent, getElementsAtEvent, getDatasetAtEvent } from 'react-chartjs-2'
import { ChartData, ChartEvent, ChartOptions } from 'chart.js/auto'
import { useAuth } from '../../../context/auth'
import { TradingViewDataItem, useTradingView } from '../../../utils/tradingview/tradingview'
import { YahooChartRow, queryChart } from '../../../utils/yahoo'

function color_green(value: number) {
  if (value < 2) {
    return '#bad0af' // light green
  }
  if (value < 4) {
    return '#83af70' // medium green
  }
  return '#488f31' // dark green
}

function color_red(value: number) {
  if (value < 2) {
    return '#f0b8b8' // light red
  }
  if (value < 4) {
    return '#e67f83' // medium red
  }
  return '#de425b' // dark red
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  animation: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        footer: (items) => {
          try {
            const idx = items[0].dataIndex
            const curr_gdp = items[0].dataset.data[idx]
            if (curr_gdp === undefined || curr_gdp === null) {
              return
            }
            const curr_inflation = items[1].dataset.data[idx]
            if (curr_inflation === undefined || curr_inflation === null) {
              return
            }
            const prev_gdp = items[0].dataset.data[idx - 1]
            if (prev_gdp === undefined || prev_gdp === null) {
              return
            }
            const prev_inflation = items[1].dataset.data[idx - 1]
            if (prev_inflation === undefined || prev_inflation === null) {
              return
            }
            const grows_recovers = curr_gdp > prev_gdp
            const inflation_rises = curr_inflation > prev_inflation
            // console.log({ curr_gdp, curr_inflation, prev_gdp, prev_inflation, grows_recovers, inflation_rises })
            if (grows_recovers && inflation_rises) {
              return 'Overheat'
            } else if (inflation_rises && !grows_recovers) {
              return 'Stagflation'
            } else if (!inflation_rises && !grows_recovers) {
              return 'Reflation'
            } else {
              return 'Recovery'
            }
          } catch (error) {
            return
          }
        },
        afterFooter: (items) => {
          try {
            const idx = items[0].dataIndex
            const curr_gdp = items[0].dataset.data[idx]
            if (curr_gdp === undefined || curr_gdp === null) {
              return
            }
            const curr_inflation = items[1].dataset.data[idx]
            if (curr_inflation === undefined || curr_inflation === null) {
              return
            }
            const prev_gdp = items[0].dataset.data[idx - 1]
            if (prev_gdp === undefined || prev_gdp === null) {
              return
            }
            const prev_inflation = items[1].dataset.data[idx - 1]
            if (prev_inflation === undefined || prev_inflation === null) {
              return
            }
            const gdp_arrow = curr_gdp > prev_gdp ? '⬆️' : '⬇️'
            const inflation_arrow = curr_inflation > prev_inflation ? '⬆️' : '⬇️'
            return `${gdp_arrow} ${prev_gdp} - ${curr_gdp} GDP\n${inflation_arrow} ${prev_inflation} - ${curr_inflation} Inflation`
          } catch (error) {
            return
          }
        },
      },
    },
  },
}

const TableRow = ({ country, gdp, ir }: { country: string; gdp: TradingViewDataItem[]; ir: TradingViewDataItem[] }) => {
  if (gdp.length < 2 || ir.length < 2) {
    return null
  }

  const gdp_curr = gdp[gdp.length - 1].close
  const gdp_prev = gdp[gdp.length - 2].close
  const gdp_color = gdp_curr < 2 ? 'text-danger' : gdp_curr > 4 ? 'text-success' : ''

  const id_curr = ir[ir.length - 1].close
  const id_prev = ir[ir.length - 2].close
  const id_color = id_curr < 2 ? 'text-success' : id_curr > 4 ? 'text-danger' : ''

  const inflation_rises = id_curr > id_prev
  const inflation_falls = id_curr < id_prev
  const growth_recovers = gdp_curr > gdp_prev
  const growth_weaknens = gdp_curr < gdp_prev

  let phase = 'unknown'
  let phase_color = 'text-secondary'

  if (growth_recovers && inflation_falls) {
    phase = 'Recovery'
    phase_color = 'text-success'
  } else if (inflation_rises && growth_recovers) {
    phase = 'Overheat'
    phase_color = 'text-danger'
  } else if (growth_weaknens && inflation_rises) {
    phase = 'Stagflation'
    phase_color = 'text-warning'
  } else if (inflation_falls && growth_weaknens) {
    phase = 'Reflation'
    phase_color = 'text-info'
  }

  return (
    <tr>
      <td>
        <img src={'https://s3-symbol-logo.tradingview.com/country/' + country + '.svg'} alt={country} title={country} className="rounded-circle" />
      </td>
      <td>
        {gdp_curr > gdp_prev && <i className="fa-solid fa-arrow-up me-2 text-success" />}
        {gdp_curr < gdp_prev && <i className="fa-solid fa-arrow-down me-2 text-danger" />}
        <a className="text-decoration-none" style={{ color: 'inherit' }} href={`https://www.tradingview.com/symbols/ECONOMICS-${country}GDPYY/`} target="_blank">
          <span className={gdp_color}>{gdp_curr}%</span>
        </a>
      </td>
      <td>
        {id_curr > id_prev && <i className="fa-solid fa-arrow-up me-2 text-success" />}
        {id_curr < id_prev && <i className="fa-solid fa-arrow-down me-2 text-danger" />}
        <a className="text-decoration-none" style={{ color: 'inherit' }} href={`https://www.tradingview.com/symbols/ECONOMICS-${country}IRYY/`} target="_blank">
          <span className={id_color}>{id_curr}%</span>
        </a>
      </td>
      <td>
        <span className={phase_color}>{phase}</span>
      </td>
    </tr>
  )
}

function addMonths(data: Date, months: number) {
  const d = new Date(data)
  d.setMonth(d.getMonth() + months)
  return d
}

const InvestingClock = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

  const ref = useRef(null)

  const us_gdp = useTradingView('ECONOMICS:USGDPYY', '3M', 10, 600000)
  const us_ir = useTradingView('ECONOMICS:USIRYY', '3M', 10, 600000)

  const cn_gdp = useTradingView('ECONOMICS:CNGDPYY', '3M', 10, 600000)
  const cn_ir = useTradingView('ECONOMICS:CNIRYY', '3M', 10, 600000)

  const eu_gdp = useTradingView('ECONOMICS:EUGDPYY', '3M', 10, 600000)
  const eu_ir = useTradingView('ECONOMICS:EUIRYY', '3M', 10, 600000)

  const ua_gdp = useTradingView('ECONOMICS:UAGDPYY', '3M', 10, 600000)
  const ua_ir = useTradingView('ECONOMICS:UAIRYY', '3M', 10, 600000)

  const [ndx, setNdx] = useState<YahooChartRow[]>([])
  const [spgsci, setSpgsci] = useState<YahooChartRow[]>([])
  const [irx, setIrx] = useState<YahooChartRow[]>([])
  const [agg, setAgg] = useState<YahooChartRow[]>([])

  const [q, setQ] = useState('')

  useEffect(() => {
    const period2 = new Date()
    const period1 = new Date(period2.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
    queryChart('^NDX', period1, period2).then(setNdx)
    queryChart('^SPGSCI', period1, period2).then(setSpgsci)
    queryChart('^IRX', period1, period2).then(setIrx)
    queryChart('AGG', period1, period2).then(setAgg)
  }, [])

  const [corner, setCorner] = useState('')

  const demo = useMemo(() => {
    if (!q && !us_gdp.length) {
      return
    }
    if (!q && us_gdp.length) {
      setQ(us_gdp[us_gdp.length - 1].date.split('T').shift() || '')
      return
    }
    const start = new Date(q)
    const end = addMonths(start, 3)
    const filtered_ndx = ndx.filter((x) => x.date >= start && x.date < end)
    const filtered_spgsci = spgsci.filter((x) => x.date >= start && x.date < end)
    const filtered_irx = irx.filter((x) => x.date >= start && x.date < end)
    const filtered_agg = agg.filter((x) => x.date >= start && x.date < end)
    return {
      labels: filtered_ndx.map((x) => x.date.toISOString().split('T').shift()),
      datasets: [
        {
          label: 'cyclical growth (stocks)',
          data: filtered_ndx.map((x) => (x.close - filtered_ndx[0].close) / filtered_ndx[0].close),
        },
        {
          label: 'cyclical value (commodities)',
          data: filtered_spgsci.map((x) => (x.close - filtered_spgsci[0].close) / filtered_spgsci[0].close),
        },
        {
          label: 'defensive value (cash)',
          data: filtered_irx.map((x) => (x.close - filtered_irx[0].close) / filtered_irx[0].close),
        },
        {
          label: 'defensive growth (bonds)',
          data: filtered_agg.map((x) => (x.close - filtered_agg[0].close) / filtered_agg[0].close),
        },
      ],
    } as ChartData<'line'>
  }, [q, ndx, spgsci, irx, agg])

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>Investing Clock</h1>

        <p>TODO: опис що воно таке та як працює</p>

        <table className="table text-center">
          <thead>
            <tr>
              <th className="fw-normal"></th>
              <th className="fw-normal px-2">
                ВВП
                <br />
                <small className="text-secondary">GDP Growth</small>
              </th>
              <th className="fw-normal">
                Інфляція
                <br />
                <small className="text-secondary">Inflation Rate</small>
              </th>
              <th className="fw-normal">
                Фаза
                <br />
                <small className="text-secondary">Investment Clock</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRow country="US" gdp={us_gdp} ir={us_ir} />
            <TableRow country="CN" gdp={cn_gdp} ir={cn_ir} />
            <TableRow country="EU" gdp={eu_gdp} ir={eu_ir} />
            <TableRow country="UA" gdp={ua_gdp} ir={ua_ir} />
          </tbody>
        </table>

        <details>
          <summary>Примітки</summary>
          <ul>
            <li>
              стрілочками <i className="fa-solid fa-arrow-up" /> та <i className="fa-solid fa-arrow-down" /> відмічається як змінився показник відносно попереднього періода
            </li>
            <li>вважається що значення у проміжку 2..4 відсотка є нормальними, значення вище та нижче помічаються червоним та зеленим кольором</li>
            <li>
              фаза вираховується відносно зміни показнику, наприклад ВВП <i className="fa-solid fa-arrow-down" />, а інфляція <i className="fa-solid fa-arrow-up" /> - Stagflation, і також відмічається
              кольором
            </li>
            <li>
              джерело даних -{' '}
              <a href="https://www.tradingview.com/markets/world-economy/indicators/" target="_blank">
                TradingView
              </a>
            </li>
            <li>кожен з показників клікабельний та веде на відповідну сторінку з графіком</li>
          </ul>
        </details>

        <h2 className="mt-5">
          <img src="https://s3-symbol-logo.tradingview.com/country/US.svg" alt="US" title="US" className="rounded-circle me-2" width="24" height="24" style={{ verticalAlign: 'baseline' }} /> United
          States <span className="text-secondary">YoY</span>
        </h2>

        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1 pe-5">
            <Chart
              ref={ref}
              type="bar"
              options={{
                ...options,
                onHover: (event, elements, chart) => {
                  if (!event.native) {
                    return
                  }
                  // console.log(getElementAtEvent(e.chart, { nativeEvent: e.native }))
                  // console.log(e)
                  // console.log('hello', ChartJs.helpers)
                  const { x, y } = getRelativePosition(event.native, chart) // FIXME: wtf types
                  const idx = chart.scales.x.getValueForPixel(x)
                  if (idx === undefined) {
                    return
                  }
                  setQ(us_gdp[idx].date.split('T').shift() || '')
                  // console.log(x, y, idx)
                  const curr_gdp = us_gdp[idx]?.close
                  const curr_inflation = us_ir[idx]?.close
                  const prev_gdp = us_gdp[idx - 1]?.close
                  const prev_inflation = us_ir[idx - 1]?.close
                  // console.log(idx, currentGDP, currentCPI, previousGDP, previousCPI)
                  const grows_recovers = curr_gdp > prev_gdp
                  const inflation_rises = curr_inflation > prev_inflation
                  // console.log(x, y, isGDPIncreasing, isCPIIncreasing)

                  if (grows_recovers && inflation_rises) {
                    setCorner('tr')
                  } else if (inflation_rises && !grows_recovers) {
                    setCorner('br')
                  } else if (!inflation_rises && !grows_recovers) {
                    setCorner('bl')
                  } else {
                    setCorner('tl')
                  }
                },
              }}
              data={{
                labels: us_gdp.map((x) => x.date.split('T').shift()),
                datasets: [
                  {
                    label: 'USGDPYY',
                    data: us_gdp.map((x) => x.close),
                    backgroundColor: us_gdp.map((x) => color_green(x.close)),
                  },
                  {
                    label: 'USIRYY',
                    data: us_ir.map((x) => x.close),
                    backgroundColor: us_ir.map((x) => color_red(x.close)),
                  },
                ],
              }}
            />
          </div>
          <div className={'clock ' + corner}>
            <img width="400" alt={'investment clock' + corner} src="https://investorpolis.com/wp-content/uploads/2022/02/The-investment-clock.png" />
          </div>
        </div>

        <details>
          <summary>Примітки</summary>
          <ul>
            <li>USGDPYY - ВВП</li>
            <li>USIRYY - інфляція</li>
            <li>Значення ВВП оновлюється щоквартала</li>
            <li>Графік показує значення ВВП та інфляції</li>
            <li>В залежності від значення міняється насиченість кольору</li>
            <li>Якщо поводити мишкою по графіку - справа підсвічується фаза</li>
            <li>Дата по осі X - початок періоду, тобто 2024-01-01 - перший квартал</li>
            <li>Розрахунок робиться відповідно зміни значень щодо попереднього кварталу</li>
          </ul>
        </details>

        <p>TODO: ідея в тому щоб подивитися як у період {q} вели себе різні види активів</p>
        <div>
          {demo && (
            <Chart
              type="line"
              options={{
                responsive: true,
                animation: false,
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      format: {
                        style: 'percent',
                      },
                    },
                  },
                },
              }}
              data={demo}
            />
          )}
        </div>

        <p>TODO: потрібно розібратися з індексами</p>

        <h2>Індекси</h2>
        <ul>
          <li>NDX - recovery</li>
          <li>SPGSCI - overheat</li>
          <li>IRX - stagflation</li>
          <li>AGG - reflation</li>
        </ul>

        <h2>Індекси</h2>
        <p>
          Закалом виділяють 11 секторів єкономіки, по кожному з них є свої індекси, які ми і будемо використовувати за для розрахунків. Також, окремо, виділимо TLT як репрезентативний індекс
          облігацій.
        </p>
        <ul>
          <li>
            <b>Overheat</b> - cyclical value, commodities
            <ul>
              <li>
                Materials Sector (
                <a href="https://finance.yahoo.com/quote/XLB/" target="_blank">
                  XLB
                </a>
                )
              </li>
              <li>
                Energy Sector (
                <a href="https://finance.yahoo.com/quote/XLE/" target="_blank">
                  XLE
                </a>
                )
              </li>
              <li>
                Industrials Sector (
                <a href="https://finance.yahoo.com/quote/XLI/" target="_blank">
                  XLI
                </a>
                )
              </li>
            </ul>
          </li>
          <li>
            <b>Stagflation</b> - defensive value, cash
            <ul>
              <li>
                Utilities Sector (
                <a href="https://finance.yahoo.com/quote/XLU/" target="_blank">
                  XLU
                </a>
                )
              </li>
              <li>
                Consumer Staples Sector (
                <a href="https://finance.yahoo.com/quote/XLP/" target="_blank">
                  XLP
                </a>
                )
              </li>
              <li>
                Health Care Sector (
                <a href="https://finance.yahoo.com/quote/XLV/" target="_blank">
                  XLV
                </a>
                )
              </li>
            </ul>
          </li>
          <li>
            <b>Reflation</b> - defensive growth, bonds
            <ul>
              <li>
                Technology Sector (
                <a href="https://finance.yahoo.com/quote/XLK/" target="_blank">
                  XLK
                </a>
                )
              </li>
              <li>
                Communication Service Sector (
                <a href="https://finance.yahoo.com/quote/XLC/" target="_blank">
                  XLC
                </a>
                )
              </li>
              <li>
                Treasury Bonds (
                <a href="https://finance.yahoo.com/quote/TLT/" target="_blank">
                  TLT
                </a>
                )
              </li>
            </ul>
          </li>
          <li>
            <b>Recovery</b> - cyclical value, stocks
            <ul>
              <li>
                Financials Sector (
                <a href="https://finance.yahoo.com/quote/XLF/" target="_blank">
                  XLF
                </a>
                )
              </li>
              <li>
                Consumer Discretionary Sector (
                <a href="https://finance.yahoo.com/quote/XLY/" target="_blank">
                  XLY
                </a>
                )
              </li>
              <li>
                Industrials Sector (
                <a href="https://finance.yahoo.com/quote/XLI/" target="_blank">
                  XLI
                </a>
                )
              </li>
            </ul>
          </li>
        </ul>

        <h2>Індекси</h2>
        <ul>
          <li>VT - stocks</li>
          <li>GLAG - bonds</li>
          <li>SHV - cash</li>
          <li>DBC - commodities</li>
        </ul>
      </div>
      <Join />
    </main>
  )
}

export default InvestingClock
export const Head: HeadFC = () => <title>Investing Clock</title>
