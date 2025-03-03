import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import '../../../styles/common.css'
import { Header } from '../../../components/header'
import { queryChart, YahooChartRow } from '../../../utils/yahoo'
import Chart from 'chart.js/auto'

const MonteCarlo = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ticker, setTicker] = useState('AAPL')
  const [backward, setBackward] = useState(100)
  const [forward, setForward] = useState(30)
  const [data, setData] = useState<YahooChartRow[]>([])

  const onSubmit = () => {
    queryChart(ticker, new Date(2000, 0, 1), new Date()).then(rows => rows.slice(rows.length - backward)).then(setData)
  }

  useEffect(() => {
    onSubmit()
  }, [])

  useEffect(() => {
    if (!ref.current || !data.length) {
      return
    }

    const dates = data.map(d => d.date)
    const past: Array<number | null> = data.map(d => d.close)

    const next_p10: Array<number | null> = past.map((_, i) => i === past.length - 1 ? past[i] : null)
    const next_p25: Array<number | null> = past.map((_, i) => i === past.length - 1 ? past[i] : null)
    const next_p50: Array<number | null> = past.map((_, i) => i === past.length - 1 ? past[i] : null)
    const next_p75: Array<number | null> = past.map((_, i) => i === past.length - 1 ? past[i] : null)
    const next_p90: Array<number | null> = past.map((_, i) => i === past.length - 1 ? past[i] : null)

    const sim = monteCarlo2(data.map(d => d.close), forward, 10000)

    for (let i = 0; i < sim.length; i++) {
      var date = new Date(dates[dates.length - 1]).getTime() + 24 * 60 * 60 * 1000
      dates.push(new Date(date))

      next_p10.push(sim[i].percentiles.p10)
      next_p25.push(sim[i].percentiles.p25)
      next_p50.push(sim[i].percentiles.p50)
      next_p75.push(sim[i].percentiles.p75)
      next_p90.push(sim[i].percentiles.p90)
    }

    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: dates.map(d => d.toDateString()),
        datasets: [
          {
            label: 'Historical',
            data: past,
          },
          {
            label: '10th Percentile',
            data: next_p10,
          },
          {
            label: '25th Percentile',
            data: next_p25,
          },
          {
            label: '50th Percentile',
            data: next_p50,
          },
          {
            label: '75th Percentile',
            data: next_p75,
          },
          {
            label: '90th Percentile',
            data: next_p90,
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: 'Monte Carlo Simulation',
          },
        },
        elements: {
          point: {
            pointStyle: false
          }
        },
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Price ($)',
            },
          },
        },
      }
    })

    return () => chart.destroy()
  }, [data])

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>Monte Carlo 🪄</h1>
        <div className="row">
          <div className='col'>
            <label className='form-label'>Ticker</label>
            <input className='form-control' placeholder="Stock, e.g.: VOO, VTI, AAPL, ..." value={ticker} onChange={(e) => setTicker(e.target.value)} />
          </div>
          <div className='col'>
            <label className='form-label'>Backward</label>
            <div className="d-flex gap-2 align-items-center">
              <input className='form-control' placeholder="Backward days" type="number" min="30" max="600" step="10" style={{ width: '6em' }} value={backward} onChange={(e) => setBackward(e.target.valueAsNumber)} />
              <input className='form-range' placeholder="Backward days" type="range" min="30" max="600" step="10" value={backward} onChange={(e) => setBackward(e.target.valueAsNumber)} />
            </div>
          </div>
          <div className='col'>
            <label className='form-label'>Forward</label>
            <div className="d-flex gap-2 align-items-center">
              <input className='form-control' placeholder="Forward days" type="number" min="5" max="100" step="1" style={{ width: '6em' }} value={forward} onChange={(e) => setForward(e.target.valueAsNumber)} />
              <input className='form-range' placeholder="Forward days" type="range" min="5" max="100" step="1" value={forward} onChange={(e) => setForward(e.target.valueAsNumber)} />
            </div>
          </div>
          <div className='col'>
            <label className='form-label'>&nbsp;</label>
            <div>
              <input className='btn btn-primary btn-block' type="submit" value="Submit" onClick={onSubmit} />
            </div>
          </div>
        </div>
        <canvas ref={ref} />
      </div>
    </main>
  )
}

export default MonteCarlo
export const Head: HeadFC = () => <title>Monte Carlo</title>



function monteCarlo2(prices: number[], days = 30, simulations = 1000): { day: number; percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number } }[] {
  // Calculate historical log returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  // Calculate mean and standard deviation of log returns
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Last known price (starting point for simulation)
  const lastPrice = prices[prices.length - 1];

  // Store all simulation results for each day
  const simulationResults: number[][] = Array(days).fill(0).map(() => []);

  // Run simulations
  for (let sim = 0; sim < simulations; sim++) {
    let currentPrice = lastPrice;

    for (let day = 0; day < days; day++) {
      // Generate random normal value (Box-Muller transform)
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      // Calculate next price using Geometric Brownian Motion
      const dailyReturn = mean + stdDev * z;
      currentPrice = currentPrice * Math.exp(dailyReturn);

      // Store result for this day
      simulationResults[day].push(currentPrice);
    }
  }

  // Calculate percentiles for each day
  return simulationResults.map((dayPrices, day) => {
    // Sort prices for percentile calculation
    dayPrices.sort((a, b) => a - b);

    // Calculate index positions for the percentiles
    const p5Index = Math.floor(simulations * 0.1);
    const p25Index = Math.floor(simulations * 0.25);
    const p50Index = Math.floor(simulations * 0.5);
    const p75Index = Math.floor(simulations * 0.75);
    const p95Index = Math.floor(simulations * 0.9);

    return {
      day: day + 1,
      percentiles: {
        p10: dayPrices[p5Index],
        p25: dayPrices[p25Index],
        p50: dayPrices[p50Index],
        p75: dayPrices[p75Index],
        p90: dayPrices[p95Index]
      }
    };
  });
}
