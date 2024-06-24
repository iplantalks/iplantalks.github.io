import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
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

const InvestingClock = () => {
  const ref = useRef(null)
  const gdp = useUSRGDPG()
  const ir = useUSIR()
  const [corner, setCorner] = useState('')

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>Investing Clock</h1>

        {/* VT - stocks
        GLAG - bonds
        SHV - cash
        DBC - commodities */}

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
                  const currentGDP = gdp[idx]?.value
                  const currentCPI = ir[idx]?.value
                  const previousGDP = gdp[idx - 1]?.value
                  const previousCPI = ir[idx - 1]?.value
                  // console.log(idx, currentGDP, currentCPI, previousGDP, previousCPI)
                  const isGDPIncreasing = currentGDP > previousGDP
                  const isCPIIncreasing = currentCPI > previousCPI
                  console.log(x, y, isGDPIncreasing, isCPIIncreasing)

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
                labels: gdp.map((x) => x.date),
                datasets: [
                  {
                    label: 'USRGDPG',
                    data: gdp.map((x) => x.value),
                    backgroundColor: gdp.map((x) => color_green(x.value)),
                  },
                  {
                    label: 'USIR',
                    data: ir.map((x) => x.value),
                    backgroundColor: ir.map((x) => color_red(x.value)),
                  },
                ],
              }}
            />
          </div>
          <div className={'clock ' + corner}>
            <img width="400" alt={'investment clock' + corner} src="https://investorpolis.com/wp-content/uploads/2022/02/The-investment-clock.png" />
          </div>
        </div>
      </div>
      <Join />
    </main>
  )
}

export default InvestingClock
export const Head: HeadFC = () => <title>Investing Clock</title>
