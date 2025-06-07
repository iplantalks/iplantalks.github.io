import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import '../../styles/common.css'
import { Header } from '../../components/header'
import { useState, useEffect, useRef, useMemo } from 'react'
import { YahooChartRow, queryChart } from '../../utils/yahoo'
import { createChart, UTCTimestamp } from 'lightweight-charts'
import { currency } from '../../utils/formatters'

const TenDays: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<YahooChartRow[]>([])
  const [symbol, setSymbol] = useState('AAPL')
  const [days, setDays] = useState(10)
  const [period, setPeriod] = useState('10')

  useEffect(() => {
    queryChart(symbol, new Date('2000-01-01'), new Date(new Date().setHours(0, 0, 0, 0))).then((data) => {
      setData(data.sort((a, b) => a.date.getTime() - b.date.getTime()))
    })
  }, [symbol])

  const filtered = useMemo(() => {
    if (data.length === 0) {
      return []
    }
    const years = parseInt(period || '10')
    return data.slice(data.length - years * 252).map((d) => ({
      time: (d.date.getTime() / 1000) as UTCTimestamp,
      value: d.close,
    }))
  }, [data, period])

  const dailyReturns = useMemo(() => {
    if (!filtered.length) {
      return []
    }
    const items: Array<{ time: UTCTimestamp; value: number }> = []
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1]
      const curr = filtered[i]
      items.push({
        time: curr.time,
        value: (curr.value - prev.value) / prev.value,
      })
    }
    return items
  }, [filtered])

  const bestDays = useMemo(() => {
    return dailyReturns
      .slice(0)
      .sort((a, b) => b.value - a.value)
      .slice(0, days)
  }, [dailyReturns, days])

  const worstDays = useMemo(() => {
    return dailyReturns
      .slice(0)
      .sort((a, b) => a.value - b.value)
      .slice(0, days)
  }, [dailyReturns, days])

  const randomDays = useMemo(() => {
    return dailyReturns
      .slice(0)
      .sort(() => Math.random() - 0.5)
      .slice(0, days)
  }, [dailyReturns, days])

  const dailyReturnsWithoutBestDays = useMemo(() => {
    const dates = bestDays.map((d) => d.time)
    return dailyReturns.filter((d) => !dates.includes(d.time))
  }, [dailyReturns, bestDays])

  const dailyReturnsWithoutWorstDays = useMemo(() => {
    const dates = worstDays.map((d) => d.time)
    return dailyReturns.filter((d) => !dates.includes(d.time))
  }, [dailyReturns, worstDays])

  const dailyReturnsWithoutRandomDays = useMemo(() => {
    const dates = randomDays.map((d) => d.time)
    return dailyReturns.filter((d) => !dates.includes(d.time))
  }, [dailyReturns, randomDays])

  const cumulative = (dailyReturns: Array<{ time: UTCTimestamp; value: number }>) => {
    if (!dailyReturns.length) {
      return []
    }
    const items: Array<{ time: UTCTimestamp; value: number }> = []
    for (let i = 0; i < dailyReturns.length; i++) {
      const prev = i == 0 ? 1 : items[i - 1].value
      const curr = dailyReturns[i].value
      items.push({
        time: dailyReturns[i].time,
        value: prev * (1 + curr),
      })
    }
    return items.map((d) => ({ time: d.time, value: d.value - 1 }))
  }

  const cumulativeDailyReturns = useMemo(() => {
    return cumulative(dailyReturns)
  }, [dailyReturns])

  const cumulativeDailyReturnsWithoutBestDays = useMemo(() => {
    return cumulative(dailyReturnsWithoutBestDays)
  }, [dailyReturnsWithoutBestDays])

  const cumulativeDailyReturnsWithoutWorstDays = useMemo(() => {
    return cumulative(dailyReturnsWithoutWorstDays)
  }, [dailyReturnsWithoutWorstDays])

  const cumulativeDailyReturnsWithoutRandomDays = useMemo(() => {
    return cumulative(dailyReturnsWithoutRandomDays)
  }, [dailyReturnsWithoutRandomDays])

  useEffect(() => {
    if (!ref || !ref.current || !dailyReturns.length) {
      return
    }

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 300,
    })

    const cumulativeDailyReturnsSeries = chart.addLineSeries({ color: 'black', title: symbol, priceFormat: { type: 'percent' } })
    cumulativeDailyReturnsSeries.setData(cumulativeDailyReturns)

    const cumulativeDailyReturnsWithoutBestDaysSeries = chart.addLineSeries({ color: 'red', title: `Without ${days} Best Days`, priceFormat: { type: 'percent' } })
    cumulativeDailyReturnsWithoutBestDaysSeries.setData(cumulativeDailyReturnsWithoutBestDays)

    const cumulativeDailyReturnsWithoutWorstDaysSeries = chart.addLineSeries({ color: 'green', title: `Without ${days} Worst Days`, priceFormat: { type: 'percent' } })
    cumulativeDailyReturnsWithoutWorstDaysSeries.setData(cumulativeDailyReturnsWithoutWorstDays)

    const cumulativeDailyReturnsWithoutRandomDaysSeries = chart.addLineSeries({ color: 'orange', title: `Without ${days} Random Days`, priceFormat: { type: 'percent' } })
    cumulativeDailyReturnsWithoutRandomDaysSeries.setData(cumulativeDailyReturnsWithoutRandomDays)

    chart.timeScale().fitContent()

    chart.applyOptions({
      localization: {
        priceFormatter: Intl.NumberFormat(undefined, { style: 'percent' }).format,
      },
    })

    return () => {
      chart.remove()
    }
  }, [ref, cumulativeDailyReturns, cumulativeDailyReturnsWithoutBestDays, cumulativeDailyReturnsWithoutWorstDays, cumulativeDailyReturnsWithoutRandomDays])

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h2>Ten Days 📈</h2>
        <p>Якщо ви хоч інколи думали про те щоб вичекати більш гарні умови для входу, або про те щоб вийти з ринку на деякий час - ця сторінка саме для вас.</p>
        <p>Власне робилося по гарячим слідам запитання:</p>
        <blockquote className="px-5 py-3 text-secondary">
          <p>Добрий день. Питання від чайника: поясніть будь ласка тезу, чому так?</p>
          <p>"протягом 10 років є найкрутіші умовні 10 днів.</p>
          <p>якщо в них не попасти, то буде умовно 7% річних, якщо попасти - то буде 10% річних."</p>
          <p>
            я не дуже розумію за рахунок чого відбувається такий великий приріст дохідності лише за 10 років? адже якщо нас умовно кажучи цікавить прирост капіталу (тобто т.А і т.Б) і те що
            відбувається всередені між цими точками- не має значення.
          </p>
        </blockquote>

        <p>У цій симуляції буде показано що відбудеться якщо ви "прогуляєте" пʼять днів і як це вплине на фінальний результат.</p>
        <div className="my-5">
          <div className="row">
            <div className="col">
              Акція
              <input className="form-control" type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </div>
            <div className="col">
              Кількість
              <input className="form-control" type="number" min="1" max="99" value={days} onChange={(e) => setDays(e.target.valueAsNumber)} />
            </div>
            <div className="col">
              Період
              <select className="form-select" onChange={(e) => setPeriod(e.target.value)}>
                <option value="10">10 років</option>
                <option value="5">5 років</option>
                <option value="3">3 років</option>
                <option value="2">2 років</option>
                <option value="1">1 років</option>
              </select>
            </div>
          </div>
        </div>

        <div className="my-5">
          <div ref={ref} style={{ height: '300px' }} />
        </div>

        <div className="my-5">
          <p>Дуже цікаво, дійсно, лише неділя-дві радикально впливають на результати. Але ще цікавіше те як працює зворотнє припущення з пропуском найгірших днів.</p>
          <p>
            <b>ВАЖЛИВО</b> розуміти що у цьому розрахунку ми рахуємо трохи не звичний нам формат - це щось близьке до щоденного входу та виходу з ринку, якщо б ми рахували прибутковість від першого
            дня - то там нічого особливого би не змінилося, адже дійсно, купивши акцію десять років тому за $20 і продавши сьогодні за $200 - маємо прибуток в 900%, якщо в середині цього періоду мі
            вийдемо в один з найкращих днів то фактично втратимо його дохідність від фінальної суми, але малювати таке буде дуже не наглядно адже лінії на графіку будут дуже близько
          </p>
        </div>

        <div className="my-5">
          <h2>Як це рахується</h2>
          <p>Спочатку забираємо історичні данні з Yahoo Finance</p>
          <p>
            <a href={`https://finance.yahoo.com/quote/{symbol}/history/`} target="_blank">
              https://finance.yahoo.com/quote/{symbol}/history/
            </a>
          </p>
          <p className="text-secondary">
            Примітка: для GoogleSheets використовуємо <code>=GOOGLEFINANCE("{symbol}", "price", "1990-01-01", TODAY(), "DAILY")</code>
          </p>
          <p>Далі фільтруємо ці данні, залишаючі {period} останніх років</p>
          <p className="text-secondary">Примітка: тут лише рабочі дні, отже в році 252 дня, тобо нам потрібні останні {parseInt(period || '10') * 252} днів</p>
          <table className="table">
            <thead>
              <tr>
                <th>day</th>
                <th>date</th>
                <th>price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 3).map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                  <td>{currency(d.value)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>&hellip;</td>
              </tr>
              {filtered.slice(filtered.length - 3).map((d, i) => (
                <tr key={i}>
                  <td>{filtered.findIndex((x) => x.time === d.time) + 1}</td>
                  <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                  <td>{currency(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Маючі ці данні, розраховуємо щоденну дохідність за формулою <code>(curr-prev)/prev</code>
          </p>
          <p className="text-secondary">Примітка: тут в нас виходить на один рядок менше, адже не зможемо порахувати дохідність першого дня</p>
          <table className="table">
            <thead>
              <tr>
                <th>day</th>
                <th>date</th>
                <th>prev</th>
                <th>curr</th>
                <th>(curr-prev)/prev</th>
              </tr>
            </thead>
            <tbody>
              {dailyReturns
                .slice(0, 3)
                .map((d, i) => ({
                  ...d,
                  date: new Date(d.time * 1000).toISOString().split('T').shift(),
                  curr: filtered.find((x) => x.time === d.time)?.value || 0,
                  prev: filtered[filtered.findIndex((x) => x.time === d.time) - 1]?.value || 0,
                  perc: 100 * d.value,
                }))
                .map((d, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d.date}</td>
                    <td>{currency(d.prev)}</td>
                    <td>{currency(d.curr)}</td>
                    <td>{currency(d.perc)}%</td>
                  </tr>
                ))}
              <tr>
                <td colSpan={5}>&hellip;</td>
              </tr>
              {dailyReturns
                .slice(dailyReturns.length - 3)
                .map((d, i) => ({
                  ...d,
                  date: new Date(d.time * 1000).toISOString().split('T').shift(),
                  curr: filtered.find((x) => x.time === d.time)?.value || 0,
                  prev: filtered[filtered.findIndex((x) => x.time === d.time) - 1]?.value || 0,
                  perc: 100 * d.value,
                }))
                .map((d, i) => (
                  <tr key={i}>
                    <td>{d.date}</td>
                    <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                    <td>{currency(d.prev)}</td>
                    <td>{currency(d.curr)}</td>
                    <td>{currency(d.perc)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p>
            Маючи щоденні дохідності знаходимо {days} найкращих та найгірших днів, а також за для забави беремо {days} випадкових днів
          </p>
          <div className="row">
            <div className="col-4">
              <p className="text-center">
                <b>Найкращі дні</b>
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Дохід</th>
                  </tr>
                </thead>
                <tbody>
                  {bestDays.map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                      <td>{(d.value * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-4">
              <p className="text-center">
                <b>Найгірші дні</b>
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Дохід</th>
                  </tr>
                </thead>
                <tbody>
                  {worstDays.map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                      <td>{(d.value * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-4">
              <p className="text-center">
                <b>Випадкові дні</b>
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Дохід</th>
                  </tr>
                </thead>
                <tbody>
                  {randomDays.map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                      <td>{(d.value * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p>Маючі відповідні дні можемо відфільтрувати та побудувати таблички з:</p>
          <ul>
            <li>- щоденна дохідність</li>
            <li>- щоденна дохідність без найкращих днів</li>
            <li>- щоденна дохідність без найгірших днів</li>
            <li>- щоденна дохідність без випадкових днів</li>
          </ul>
          <p>А також їхні кумулятивні дохідності</p>
          <p>
            За для розрахунку кумулятивної дохідності використовуємо формулу: <code>prev*(1+curr)</code>
          </p>
          <p>Ось приклад розрахунку кумулятивної дохідності:</p>
          <p className="text-secondary">Примітка: робимо теж саме для табличок без найращих, найгірших та випадкових днів</p>
          <table className="table">
            <thead>
              <tr>
                <th>day</th>
                <th>date</th>
                <th>price</th>
                <th>daily returns</th>
                <th>cumulative returns</th>
              </tr>
            </thead>
            <tbody>
              {cumulativeDailyReturns.slice(0, 5).map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                  <td>${currency(filtered.find((x) => x.time === d.time)?.value || 0)}</td>
                  <td>{currency(100 * (dailyReturns.find((x) => x.time === d.time)?.value || 0))}%</td>
                  <td>{(d.value * 100).toFixed(2)}%</td>
                </tr>
              ))}
              <tr>
                <td colSpan={5}>&hellip;</td>
              </tr>
              {cumulativeDailyReturns.slice(cumulativeDailyReturns.length - 5).map((d, i) => (
                <tr key={i}>
                  <td>{cumulativeDailyReturns.findIndex((x) => x.time === d.time) + 1}</td>
                  <td>{new Date(d.time * 1000).toISOString().split('T').shift()}</td>
                  <td>${currency(filtered.find((x) => x.time === d.time)?.value || 0)}</td>
                  <td>{currency(100 * (dailyReturns.find((x) => x.time === d.time)?.value || 0))}%</td>
                  <td>{(d.value * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default TenDays
export const Head: HeadFC = () => <title>Ten Days</title>
