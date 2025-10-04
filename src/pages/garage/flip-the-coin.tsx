import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import '../../styles/common.css'
import { Header } from '../../components/header'
import { useState, useEffect, useRef, useMemo } from 'react'
import { YahooChartRow, queryChart } from '../../utils/yahoo'
import { BaselineSeries, CandlestickSeries, IChartApi, createChart } from 'lightweight-charts'
import { currency } from '../../utils/formatters'
import Join from '../../components/join'

const symbols = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'BRK-A',
  'BRK-B',
  'TSM',
  'LLY',
  'V',
  'JPM',
  'UNH',
  'WMT',
  'MA',
  'JNJ',
  'XOM',
  'NVO',
  'HD',
  'PG',
  'COST',
  'ORCL',
  'MRK',
  'ASML',
  'ADBE',
  'AMD',
  'CRM',
  'TM',
  'CVX',
  'KO',
  'BAC',
  'PEP',
  'ACN',
  'MCD',
  'NVS',
  'TMO',
  'NFLX',
  'CSCO',
  'AZN',
  'INTC',
  'ABT',
  'SHEL',
  'TMUS',
  'SAP',
  'WFC',
  'INTU',
  'CMCSA',
  'DHR',
  'QCOM',
  'DIS',
  'VZ',
  'AMGN',
  'PFE',
  'TXN',
  'IBM',
  'NKE',
  'BHP',
  'TTE',
  'UNP',
  'HSBC',
  'CAT',
  'PM',
  'BX',
  'GE',
  'HDB',
  'SPGI',
  'MS',
  'RY',
  'AMAT',
  'UPS',
  'AXP',
  'ISRG',
  'HON',
  'BA',
  'SNY',
  'COP',
  'LOW',
  'BKNG',
  'GS',
  'RTX',
  'SONY',
  'BLK',
  'SYK',
  'PLD',
  'UL',
  'NEE',
  'MDT',
  'LMT',
  'SCHW',
  'VRTX',
  'ELV',
  'GILD',
  'TJX',
  'LRCX',
  'TD',
  'DE',
  'SBUX',
  'REGN',
  'BMY',
  'PGR',
  'MDLZ',
]

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

const FlipTheCoin = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

  const ref = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<YahooChartRow[]>([])
  const [before, setBefore] = useState<YahooChartRow[]>([])
  const [after, setAfter] = useState<YahooChartRow[]>([])

  const [turn, setTurn] = useState(1)
  const [bank, setBank] = useState(10000)
  const [symbol, setSymbol] = useState(symbols[Math.floor(Math.random() * symbols.length)])

  const [target, setTarget] = useState(0)
  const [targetMin, setTargetMin] = useState(0)
  const [targetMax, setTargetMax] = useState(9999)
  const [days, setDays] = useState(30)
  const [bid, setBid] = useState(1000)
  const [bidMax, setBidMax] = useState(10000)

  const [reveled, setReveled] = useState(false)

  const [result, setResult] = useState('unknown')

  const forecastPercent = useMemo(() => {
    if (!before.length) {
      return 0
    }
    return Math.round((target / before[before.length - 1].close - 1) * 100)
  }, [target, before])

  const actualPercent = useMemo(() => {
    if (!after.length) {
      return 0
    }
    return Math.round((after[days - 1].close / before[before.length - 1].close - 1) * 100)
  }, [days, after])

  const setup = () => {
    setReveled(false)
    setDays(30)
    setResult('unknown')
    setSymbol(symbols[Math.floor(Math.random() * symbols.length)])
    setBidMax(Math.round(bank))
    setBid(Math.min(bank, 1000))

    const start = new Date(2010, 0, 1).getTime()
    const end = Date.now() - 100 * 24 * 60 * 60 * 1000
    const period2 = new Date(new Date(random(start, end)).setHours(0, 0, 0, 0))
    const period1 = new Date(new Date(period2).setMonth(new Date(period2).getMonth() - 9))

    queryChart(symbol, period1, period2).then((items) => {
      setData(items)

      const before = items.slice(0, items.length - 60)
      setBefore(before)
      const after = items.slice(items.length - 60)
      setAfter(after)

      // forecast.applyOptions({ baseValue: { type: 'price', price: before[before.length - 1].close } })

      setTarget(Math.round(before[0].close))
      setTargetMin(Math.round(Math.min(...before.map((item) => item.close)) / 2))
      setTargetMax(Math.round(Math.max(...before.map((item) => item.close)) * 2))

      // drawforcast()
      // chart.timeScale().fitContent()

      setReveled(false)
    })
  }

  useEffect(() => {
    setup()
  }, [])

  useEffect(() => {
    if (!ref.current || !before.length) {
      return
    }

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 400, // ref.current.clientWidth / 3,
    })
    const series = chart.addSeries(CandlestickSeries)
    series.setData((reveled ? data : before).map((item) => ({ time: item.date.toISOString().split('T').shift()!, open: item.open, high: item.high, low: item.low, close: item.close })))

    const forecast = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: before[before.length - 1]?.close },
      topLineColor: 'rgba( 38, 166, 154, 1)',
      topFillColor1: 'rgba( 38, 166, 154, 0.28)',
      topFillColor2: 'rgba( 38, 166, 154, 0.05)',
      bottomLineColor: 'rgba( 239, 83, 80, 1)',
      bottomFillColor1: 'rgba( 239, 83, 80, 0.05)',
      bottomFillColor2: 'rgba( 239, 83, 80, 0.28)',
    })
    const now = new Date(before[before.length - 1].date)
    const currentvalue = before[before.length - 1].close
    const items = []
    for (var i = 0; i < days; i++) {
      // now + i days
      var nextdate = new Date(after[i].date) // new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      // approximate next value from currentvalue to target
      var nextvalue = currentvalue + (target - currentvalue) * (i / days)
      items.push({
        time: nextdate.toISOString().split('T').shift()!,
        value: nextvalue,
      })
    }
    forecast.setData(items)

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [ref, before, target, days, bid, reveled])

  const onReveal = () => {
    setReveled(true)

    let win = true
    if (forecastPercent > 0 && actualPercent < 0 && Math.abs(forecastPercent - actualPercent) > 3) {
      setResult('lose, forecasted up, actual down')
      win = false
    } else if (forecastPercent < 0 && actualPercent > 0 && Math.abs(forecastPercent - actualPercent) > 3) {
      setResult('lose, forecasted down, actual up')
      win = false
    } else if (Math.abs(forecastPercent - actualPercent) > 10) {
      setResult('lose, forecast mismatch ' + Math.abs(forecastPercent - actualPercent) + '%')
      win = false
    }

    if (win) {
      setBank(bank + bid)
      setResult('win')
    } else {
      setBank(bank - bid)
    }

    setTurn(turn + 1)

    if (bank <= 0) {
      alert('gamve over\nyou lost')
      window.location.reload()
    }
    if (turn >= 10) {
      if (bank >= 10000) {
        alert('game over\nyou won\nbank: ' + currency(bank))
      } else {
        alert('game over\nyou survived\nbank: ' + currency(bank))
      }
      window.location.reload()
    }
  }

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>Flip The Coin 🪙</h1>
        <p>
          <a href="https://t.me/c/1440806120/12708/26254">Фінансові єксперименти і чого ми можемо у них навчитись</a> - єфір підсвітив цікаву ідею з міні ігрою - flip the coin game
        </p>
        <p>
          У цій симуляції у вас є $10K, щоразу вам буде показано графік випадкової акції за випадковий період. Ваша мета зробити прогноз щодо руху вартості акції. В залежності від того чи ви вгадали
          чи ні ваш баланс збільшиться, або зменшиться. Гра завершується через 10 кроків, або якщо закінчилися гроші.
        </p>
        <div className="d-flex justify-content-center align-items-center mb-2">
          <span className="mx-2 text-secondary">turn:</span>
          <b className="mx-2">{turn}</b>
          <span className="mx-2 text-secondary">bank:</span>
          <b className="mx-2">${currency(bank)}</b>
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <div className="rounded border p-2 text-center mx-2">
            <div className="mb-2">
              price <span className={forecastPercent > 0 ? 'text-success' : 'text-danger'}>{forecastPercent}%</span>
            </div>
            <input className="form-control" type="number" min={targetMin} max={targetMax} step="1" value={target} onChange={(e) => setTarget(e.target.valueAsNumber)} />
            <input className="form-range" type="range" min={targetMin} max={targetMax} step="1" value={target} onChange={(e) => setTarget(e.target.valueAsNumber)} />
          </div>
          <div className="rounded border p-2 text-center mx-2">
            <div className="mb-2">days</div>
            <input className="form-control" type="number" min="5" max="90" step="1" value={days} onChange={(e) => setDays(e.target.valueAsNumber)} />
            <input className="form-range" type="range" min="5" max="90" step="1" value={days} onChange={(e) => setDays(e.target.valueAsNumber)} />
          </div>
          <div className="rounded border p-2 text-center mx-2">
            <div className="mb-2">bid</div>
            <input className="form-control" type="number" min="1" max={bidMax} step="1" value={bid} onChange={(e) => setBid(e.target.valueAsNumber)} />
            <input className="form-range" type="range" min="1" max={bidMax} step="1" value={bid} onChange={(e) => setBid(e.target.valueAsNumber)} />
          </div>
          <div className="mx-2">
            {!reveled && (
              <button className="btn btn-primary" style={{ width: '6em' }} onClick={(e) => onReveal()}>
                reveal
              </button>
            )}
            {reveled && (
              <button className="btn btn-primary" style={{ width: '6em' }} onClick={(e) => setup()}>
                next
              </button>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-2">
          <span className="mx-2 text-secondary">symbol:</span>
          <b className="mx-2">{reveled ? symbol : 'hidden'}</b>
          <span className="mx-2 text-secondary">actual:</span>
          <b className="mx-2">{reveled ? currency(after[days - 1].close) : 'hidden'}</b>
          <span className="mx-2 text-secondary">result:</span>
          <b className="mx-2">
            <span className={result === 'unknown' ? '' : result === 'win' ? 'text-success' : 'text-danger'}>{result}</span>
          </b>
        </div>
        <div className="my-5">
          <div ref={ref} style={{ height: '400px' }}></div>
        </div>
        <div className="my-5">
          <p>Натискаючи кнопку reveal вам будуть показані результати, натискаючи кнопку next - ви переходите до наступної симуляції</p>
          <p>В єксперименті приймає участь 200 акцій</p>
          <p>Розрахунок результату є приблизним, адже ми не ставимо за мету порахувати гроші до копійки, а скоріше подивится на цю історію з підкидуванням монетки</p>
        </div>
        <div className="my-5">
          <div className="d-flex d-justify-content-center">
            <a className="rounded border text-center text-decoration-none p-2" href="https://t.me/c/1440806120/12708/26254" target="_blank">
              <img width="300" src="https://img.youtube.com/vi/XZTSn4qCyIo/0.jpg" alt="Фінансові експерименти і чого ми можемо у них навчитись" />
              <br />
              Фінансові експерименти і чого ми
              <br />
              можемо у них навчитись
            </a>
          </div>
        </div>
        <h2 className="my-5">Market Growth Theory 📈</h2>
        <p>
          <b>Контекст</b>
        </p>
        <p>Формула примінима, але повна версія, якщо можна так назвати) Вона ж (формула) і для кубика якою грають в кості береться і для багатьох інших.</p>
        <p>
          Я б сказав, що підкидання монетки з 60% шансом схоже на інвестування (не трейдинг). Ринок на дистанції більше росте ніж падає, тому нам не вигідно шортити або пропускати рік покупки активів,
          навіть якщо перед цим ринок виростав, умовно, 5 років поспіль, та навіть хоч 20 років поспіль)
        </p>
        <p>Психологічно (це вже людська сторона) буде трошки страшно, бо після 20 років ніби «повинно бути падіння», але навіть в такому разі варто ставити на ріст, а не падіння.</p>

        <p>
          <b>Припущення</b>
        </p>
        <p>Що якби ми протягом десяти років, щодня, купували б рандомну акцію і продавали її через рік?</p>
        <p>Враховуючи що ринок загалом зростає, в середньому має вийти позитивний результат.</p>

        <p>
          <b>Як?</b>
        </p>
        <ul>
          <li>
            Забираємо з finviz акції компаній, що існують більше десяти років -{' '}
            <a href="https://finviz.com/screener.ashx?v=111&f=ipodate_more10&ft=4&o=-marketcap&r=1" target="_blank">
              link
            </a>
            , вийшло 4339
          </li>
          <li>
            Для кожної забираємо історію цін із yahoo finance,{' '}
            <a href="https://finance.yahoo.com/quote/AAPL/history?p=AAPL" target="_blank">
              приклад
            </a>
          </li>
          <li>Експеримент протяжністю десять років, стартуємо у 2012, завершуємо у 2022</li>
          <li>
            Кожен робочий день у цьому проміжку:
            <ul>
              <li>Купуємо випадкову акцію</li>
              <li>Фіксуємо дату та вартість покупки</li>
              <li>Фіксуємо через 250 робочих днів (приблизно рік), її вартість</li>
              <li>Розраховуємо результат інвестиції</li>
            </ul>
          </li>
          <li>Повторюємо це протягом десяти років щодня</li>
        </ul>

        <p>
          <b>Примітки</b>
        </p>
        <ul>
          <li>«Купуючи акцію в пісочницю варто відразу позначити пороги та терміни виходу з позиції» © - тут щось схоже, незалежно ні від чого, ми продаємо акцію через рік</li>
          <li>Одна акція може коштувати $10, інша $500, але це немає ніякого значення, т.к. ми будемо дивитися на відсоток зміни в загальному результаті</li>
          <li>Також ми порахуємо загальну інвестовану та результуючі суми</li>
          <li>Ця сторінка скоріше для наочної демонстрації як проходить симуляція - сік у результатах</li>
          <li>З симуляції виключені акції вартістю понад тисячу доларів - там є якісь стрімкі outliers, причому в обидві сторони</li>
          <li>Симуляція проганяється на 2500 угод, умовні 10 років, всього там може бути 2768 угод, але виглядає так що там трапляються якісь дні які завішують усю симуляцію та браузер</li>
        </ul>

        <p>
          <b>Результати</b>
        </p>
        <p>Зрозуміло в браузері подивитися це здорово і весело, але вміючи цю справу симулювати нам не що не заважає зробити щось дуже дике</p>
        <p>У нас насправді симуляція як така цікава, т.к. дуже великий термін та розкид</p>
        <p>А що коли ми проженемо її десять тисяч разів?</p>
        <p>Тобто йдеться про двадцять п'ять мільйонів угод</p>
        <p>Результат замірявся за change (%)</p>

        <table className="table">
          <tbody>
            <tr>
              <th>average</th>
              <td>2.48</td>
            </tr>
            <tr>
              <th>min</th>
              <td>-4.78</td>
            </tr>
            <tr>
              <th>percentile 25</th>
              <td>0.93</td>
            </tr>
            <tr>
              <th>percentile 50</th>
              <td>2.20</td>
            </tr>
            <tr>
              <th>percentile 75</th>
              <td>3.64</td>
            </tr>
            <tr>
              <th>max</th>
              <td>39.98</td>
            </tr>
          </tbody>
        </table>

        <p>Разом виходить:</p>
        <ul>
          <li>Гіпотеза видається правдоподібною, т.к. в середньому ми отримуємо позитивний результат</li>
          <li>Враховуючи що в цілому ринок дає кращий результат, а той же VOO за цей період давав 12% сенсу все це не має, окрім як академ інтерес</li>
        </ul>

        <p>Що ще можна було б зробити:</p>
        <ul>
          <li>Що, якщо продавати не через рік, а через місяць?</li>
          <li>Що якщо купувати тільки акції, які росли за минулі X місяців?</li>
          <li>Що якщо продавати за якоюсь хитрішою умовою?</li>
          <li>і т.д.</li>
        </ul>
      </div>

      <Join />
    </main>
  )
}

export default FlipTheCoin
export const Head: HeadFC = () => <title>Flip The Coin Game</title>
