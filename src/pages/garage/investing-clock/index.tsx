import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import { useRef, useState, useEffect, useMemo } from 'react'
import '../../../styles/common.css'
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

function ycharts(ticker: string): Promise<Array<{ date: string; value: number }>> {
  return proxy('https://ycharts.com/charts/fund_data.json?securities=id:I:' + ticker + ',include:true,,', 3600)
    .then((r) => r.json())
    .then((data) => data.chart_data[0][0].raw_data.map(([x, y]: Array<number>) => ({ date: new Date(x).toISOString().split('T').shift(), value: y })))
}

function filter20(data: Array<{ date: string; value: number }>) {
  return data
    .filter((x) => x.date.startsWith('202'))
    .filter((x) => !x.date.startsWith('2020-'))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function useUSRGDPG() {
  const [data, setData] = useState<Array<{ date: string; value: number }>>([])
  useEffect(() => {
    ycharts('USRGDPG').then(filter20).then(setData)
  }, [])
  return data
}

function useUSIR() {
  const [data, setData] = useState<Array<{ date: string; value: number }>>([])
  useEffect(() => {
    ycharts('USIR').then(filter20).then(setData)
  }, [])
  return data
}

const options: ChartOptions<'bar'> = {
  responsive: true,
  animation: false,
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

  const [xlb, setXlb] = useState<YahooChartRow[]>([])
  const [xle, setXle] = useState<YahooChartRow[]>([])
  const [xli, setXli] = useState<YahooChartRow[]>([])
  const [xlu, setXlu] = useState<YahooChartRow[]>([])
  const [xlp, setXlp] = useState<YahooChartRow[]>([])
  const [xlv, setXlv] = useState<YahooChartRow[]>([])
  const [xlk, setXlk] = useState<YahooChartRow[]>([])
  const [xlc, setXlc] = useState<YahooChartRow[]>([])
  const [xlf, setXlf] = useState<YahooChartRow[]>([])
  const [xly, setXly] = useState<YahooChartRow[]>([])
  const [tlt, setTlt] = useState<YahooChartRow[]>([])

  useEffect(() => {
    const period2 = new Date()
    const period1 = new Date(period2.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
    queryChart('XLB', period1, period2).then(setXlb)
    queryChart('XLE', period1, period2).then(setXle)
    queryChart('XLI', period1, period2).then(setXli)
    queryChart('XLU', period1, period2).then(setXlu)
    queryChart('XLP', period1, period2).then(setXlp)
    queryChart('XLV', period1, period2).then(setXlv)
    queryChart('XLK', period1, period2).then(setXlk)
    queryChart('XLC', period1, period2).then(setXlc)
    queryChart('XLF', period1, period2).then(setXlf)
    queryChart('XLY', period1, period2).then(setXly)
    queryChart('TLT', period1, period2).then(setTlt)
  }, [])

  useMemo(() => {
    // overheat - xlb, xle, xli
    const overheat: Array<{ date: string; value: number }> = []
    // new Date(Math.max(xlb[0].date.getTime(), xle[0].date.getTime(), xli[0].date.getTime())).toI
    // const dates = new Set([...xlb.map((x) => x.date), ...xle.map((x) => x.date), ...xli.map((x) => x.date)])
    const xlb_reversed = xlb.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const xle_reversed = xle.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const xli_reversed = xli.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    // console.log(dates.size, xlb.length) //, xle.length, xli.length)
    // while (true) {}
    // stagflation - xlu, xlp, xlv
    // reflation - xlk, xlc, tlt
    // recovery - xlf, xly, xli
  }, [xlb, xle, xli, xlu, xlp, xlv, xlk, xlc, xlf, xly, tlt])

  const gdp = useUSRGDPG()
  const ir = useUSIR()
  const [corner, setCorner] = useState('')

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
                  // console.log(x, y, idx)
                  const currentGDP = us_gdp[idx]?.close
                  const currentCPI = us_ir[idx]?.close
                  const previousGDP = us_gdp[idx - 1]?.close
                  const previousCPI = us_ir[idx - 1]?.close
                  // console.log(idx, currentGDP, currentCPI, previousGDP, previousCPI)
                  const isGDPIncreasing = currentGDP > previousGDP
                  const isCPIIncreasing = currentCPI > previousCPI
                  // console.log(x, y, isGDPIncreasing, isCPIIncreasing)

                  if (isGDPIncreasing && isCPIIncreasing) {
                    setCorner('tr')
                  } else if (isGDPIncreasing && !isCPIIncreasing) {
                    setCorner('tl')
                  } else if (!isGDPIncreasing && isCPIIncreasing) {
                    setCorner('br')
                  } else if (!isGDPIncreasing && !isCPIIncreasing) {
                  } else {
                    setCorner('bl')
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
            <li>Графік показує значення ВВП та інфляції</li>
            <li>В залежності від значення міняється насиченість кольору</li>
            <li>Якщо поводити мишкою по графіку - справа підсвічується фаза</li>
          </ul>
        </details>

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

        <p className="mt-5">Індекси</p>
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
