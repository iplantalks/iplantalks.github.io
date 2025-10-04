import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Header } from '../../../components/header'
import { queryChart, YahooChartRow } from '../../../utils/yahoo';
import { currency } from '../../../utils/formatters';
import { createChart, LineSeries, UTCTimestamp } from 'lightweight-charts';

export default function Page() {
  const [minYear, setMinYear] = useState(2000)
  const [startYear, setStartYear] = useState(2000)
  const [yahoo, setYahoo] = useState<Record<string, YahooChartRow[]>>({})
  const [newTicker, setNewTicker] = useState('');
  const [tickerToMix, setTickerToMix] = useState('');
  const [mixedTicker, setMixedTicker] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [items, setItems] = useState<Array<{ ticker: string, count: number }>>([]);

  const portfolio = useMemo(() => {
    const inner = items.map(({ ticker, count }) => ({
      ticker,
      count,
      price: yahoo[ticker][yahoo[ticker].length - 1].close,
      value: yahoo[ticker][yahoo[ticker].length - 1].close * count,
    }))
    const sum = inner.reduce((acc, { value }) => acc + value, 0)
    return inner.map(item => ({ ...item, allocation: item.value / sum * 100 }))
  }, [items, yahoo])

  const valueSum = useMemo(() => {
    let sum = 0
    for (const item of items) {
      sum += yahoo[item.ticker][yahoo[item.ticker].length - 1].close * item.count
    }
    return sum
  }, [yahoo, items])

  const add = async () => {
    try {
      const chart = await queryChart(newTicker, new Date(2000, 0, 1), new Date());
      const next = items.map(p => p.ticker === newTicker ? { ...p, count: p.count + newCount } : p);
      if (!next.find(p => p.ticker === newTicker)) {
        next.push({ ticker: newTicker, count: newCount });
      }
      setItems(next);
      setNewTicker('');
      setNewCount(1);
      setYahoo({ ...yahoo, [newTicker]: chart });
      if (new Date(chart[0].date).getFullYear() + 1 > minYear) {
        setMinYear(new Date(chart[0].date).getFullYear() + 1);
        setStartYear(new Date(chart[0].date).getFullYear() + 1);
      }
    } catch (error) {
      alert(`Виникла помилка при додаванні акції\n${error instanceof Error ? error.message : error}`)
    }
  }

  const mix = async () => {
    try {
      const chart = await queryChart(tickerToMix, new Date(2000, 0, 1), new Date());
      setYahoo({ ...yahoo, [tickerToMix]: chart });
      setMixedTicker(tickerToMix);
      setTickerToMix('');
    } catch (error) {
      alert(`Виникла помилка при додаванні акції\n${error instanceof Error ? error.message : error}`)
    }
  }

  return <main>
    <Header />
    <div className="container py-5">
      <h1>Mix & Match &mdash; або додаємо акції у портфель</h1>
      <p>Маєш портфель з декількох акцій, побачив нове відео в YouTube з новою ідеєю, та думаеш чи не добавити нову акцію до свого портфелю?</p>
      <p>За звичай, перед тим як це робити слід дослідити звіти та фундаментальні показники, звіритися зі своїм ризик профілем і таке інше. Окрім цього, варто розрахувати потенційну поведінку нового портфелю на основі історичних данних. Саме це і робить цей калькулятор.</p>
      <h2>Поточний портфель</h2>
      <p>Для початку, введіть данні вашого поточного портфелю</p>
      <table className='table'>
        <thead className='table-dark'>
          <tr>
            <th>ticker</th>
            <th>count</th>
            <th></th>
            <th>price</th>
            <th>value</th>
            <th>allocation</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => <tr key={i}>
            <td>
              <input className='form-control' type='text' value={item.ticker} readOnly={true} disabled={true} />
            </td>
            <td>
              <input className='form-control' type='number' min={1} step={1} value={item.count} onChange={e => setItems(items.map((p, j) => i === j ? { ...p, count: e.target.valueAsNumber } : p))} />
            </td>
            <td>
              <button className='btn btn-danger btn-sm' onClick={() => setItems(items.filter((_, j) => i !== j))}>&times;</button>
            </td>
            <td>
              {currency(yahoo[item.ticker][yahoo[item.ticker].length - 1].close)}
            </td>
            <td>
              {currency(yahoo[item.ticker][yahoo[item.ticker].length - 1].close * item.count)}
            </td>
            <td>
              {currency((yahoo[item.ticker][yahoo[item.ticker].length - 1].close * item.count) / valueSum * 100)}
            </td>
          </tr>)}
        </tbody>
        <tfoot className='table-secondary'>
          <tr>
            <td>
              <input className='form-control' type='text' placeholder="ticker, e.g.: AAPL" value={newTicker} onChange={e => setNewTicker(e.target.value)} />
            </td>
            <td>
              <input className='form-control' type='number' min={1} step={1} placeholder="count, e.g.: 2" value={newCount} onChange={e => setNewCount(e.target.valueAsNumber)} />
            </td>
            <td>
              <button className='btn btn-primary btn-sm' onClick={() => add()} disabled={!newTicker || !newCount}>+</button>
            </td>
            <td></td>
            <td>{currency(valueSum)}</td>
            <td>{currency(portfolio.map(p => p.allocation).reduce((a, b) => a + b, 0))}</td>
          </tr>
        </tfoot>
      </table>
      <p className='row g-3 align-items-center'>
        <span className='col-auto'>Для такого портфелю данні доступні з {minYear}, можете обрати рік початку симуляції</span>
        <span className='col-auto'>
          <select className='form-control' value={startYear} onChange={e => setStartYear(Number(e.target.value))}>
            {new Array(new Date().getFullYear() - minYear).fill(null).map((_, i) => minYear + i).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </span>
      </p>
      <p>Графік performance (%) портфелю з {startYear} року</p>
      <Chart portfolio={portfolio} yahoo={yahoo} startYear={startYear} />
      <p>На графіку відображено як поводили себе окремі акції, а також, чорною лінією - увесь портфель загалом.</p>
      <p>Розрахунок відбуваеється у процентах відносно дати початку розрахунку, так наприклад, якщо акція на початок розрахунків коштувала 50 доларів, а теперь коштує 80 - доіхдність складатиме - (80-50)/50*100 = 60%</p>
      <p>Розрахунок робиться у процентах дохідності, за для того щоб було не важливо який розмір портфелю та ака кількість грошей інвестовано.</p>

      <p>Перед додаванням нової акції, зазначимо, що дохідність портфелю з {startYear} склала <b>{currency(perf(portfolio, yahoo, startYear))}%</b>, sharpe ratio при цьому складав - <b>{currency(sharpe(portfolio, yahoo, startYear))}</b></p>

      <h2>Додаємо нову акцію</h2>
      <p>Отже, тепер саме цікаве, додаємо нову акцію до портфелю</p>
      {!mixedTicker && <div className='row g-3 align-items-center'>
        <div className='col-auto'>
          <input className='form-control' type='text' placeholder="ticker, e.g.: AAPL" value={tickerToMix} onChange={e => setTickerToMix(e.target.value)} />
        </div>
        <div className='col-auto'>
          <button className='btn btn-primary' onClick={() => mix()} disabled={tickerToMix === ''}>Додати</button>
        </div>
      </div>}

      {mixedTicker && <div className='row g-3 align-items-center'>
        <div className='col-auto'>
          <input className='form-control' type='text' defaultValue={mixedTicker} disabled={true} readOnly={true} />
        </div>
        <div className='col-auto'>
        </div>
      </div>}

    </div>
  </main>
}

function sharpeRatio(prices: number[], riskFreeRate = 0) {
  if (prices.length < 2) return 0; // Not enough data

  // Calculate daily returns
  let returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Compute average return (mean)
  let meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Compute standard deviation of returns
  let squaredDiffs = returns.map(r => Math.pow(r - meanReturn, 2));
  let stdDev = Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length);

  // Sharpe Ratio calculation
  return stdDev === 0 ? 0 : (meanReturn - riskFreeRate) / stdDev;
}

const sharpe = (portfolio: Array<{ ticker: string, allocation: number }>, yahoo: Record<string, YahooChartRow[]>, startYear: number): number => {
  let together = 0
  for (const { ticker, allocation } of portfolio) {
    const prices = yahoo[ticker].filter(({ date }) => new Date(date).getFullYear() >= startYear).map(({ close }) => close)
    const sharpe = sharpeRatio(prices)
    together += sharpe * (allocation / 100)
  }
  return together
}

const perf = (portfolio: Array<{ ticker: string, allocation: number }>, yahoo: Record<string, YahooChartRow[]>, startYear: number): number => {
  let together = 0
  for (const { ticker, allocation } of portfolio) {
    const prices = yahoo[ticker].filter(({ date }) => new Date(date).getFullYear() >= startYear).map(({ close }) => close)
    const start = prices[0]
    const end = prices[prices.length - 1]
    const perf = ((end - start) / start) * 100
    together += perf * (allocation / 100)
  }
  return together
}

const Chart = ({ portfolio, yahoo, startYear }: { portfolio: Array<{ ticker: string, allocation: number }>, yahoo: Record<string, YahooChartRow[]>, startYear: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !portfolio.length) {
      return
    }

    const colors = ['55, 162, 235', '255, 99, 132', '76, 191, 192', '254, 159, 64', '154, 102, 255', '255, 205, 86']

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: ref.current.clientHeight, // Math.floor(lineRef.current.clientWidth / 3),
      handleScale: true,
      handleScroll: true,
      localization: { priceFormatter: Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format },
    })

    const together: Record<string, number> = {}
    for (const { ticker, allocation } of portfolio) {
      const data = yahoo[ticker]
        .filter(({ date }) => new Date(date).getFullYear() >= startYear)
        .map(({ date, close }, i, arr) => {
          const time = date.toISOString().split('T').shift()! // Math.round(date.getTime() / 1000) as UTCTimestamp
          const perf = ((close - arr[0].close) / arr[0].close) * 100
          if (!together[time]) {
            together[time] = 0
          }
          together[time] += perf * (allocation / 100)
          return { time: time, value: perf }
        })

      const series = chart.addSeries(LineSeries, {
        title: ticker,
        color: `rgba(${colors[Object.keys(yahoo).indexOf(ticker)]}, 0.3)`
      })
      series.setData(data)
    }

    const portfolioSeries = chart.addSeries(LineSeries, {
      title: 'portfolio',
      color: 'rgba(0, 0, 0, 1.0)',
    })
    portfolioSeries.setData(Object.entries(together).map(([time, value]) => ({ time, value })))

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [portfolio, yahoo, startYear, ref])

  return <div ref={ref} style={{ height: '300px' }} />
}

export const Head: HeadFC = () => <title>Mix and Match - додаємо акції в портфель розумно</title>
