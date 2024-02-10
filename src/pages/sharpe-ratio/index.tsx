import { HeadFC, PageProps } from 'gatsby'
import * as React from 'react'
import { IChartApi, createChart } from 'lightweight-charts'
import { useEffect, useRef, useState, PropsWithChildren, createContext, useMemo } from 'react'
import { YahooChartRow, queryChart } from '../../utils/yahoo'
import { currency } from '../../utils/formatters'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // math: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      annotation: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      'annotation-xml': React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      maction: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      math: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      merror: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mfrac: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mi: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mmultiscripts: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mn: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mo: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mover: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mpadded: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mphantom: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mprescripts: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mroot: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mrow: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      ms: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mspace: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      msqrt: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mstyle: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      msub: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      msubsup: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      msup: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mtable: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mtd: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mtext: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      mtr: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      munder: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      munderover: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
      semantics: React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
    }
  }
}

function useStock(symbol: string, period1: Date, period2: Date) {
  const [data, setData] = React.useState<Array<{ time: string; value: number }>>([])
  const first = useMemo(() => (data.length ? data[0] : null), [data])
  const firstTime = useMemo(() => (first ? first.time : ''), [first])
  const firstYear = useMemo(() => (firstTime ? new Date(firstTime).getFullYear() : 0), [firstTime])
  const firstValue = useMemo(() => (first ? first.value : 0), [first])
  const last = useMemo(() => (data.length ? data[data.length - 1] : null), [data])
  const lastTime = useMemo(() => (last ? last.time : ''), [last])
  const lastYear = useMemo(() => (lastTime ? new Date(lastTime).getFullYear() : 0), [lastTime])
  const lastValue = useMemo(() => (last ? last.value : 0), [last])
  const years = useMemo(() => lastYear - firstYear || 1, [firstYear, lastYear])
  const returnRate = useMemo(() => (firstValue && lastValue ? (lastValue - firstValue) / firstValue : 0), [firstValue, lastValue])
  const cagr = useMemo(() => (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100, [firstValue, lastValue, years])
  const stdev = useMemo(() => {
    const changes = data.map((row, i) => (i ? (row.value - data[i - 1].value) / data[i - 1].value : 0)).slice(1)
    const mean = changes.reduce((sum, value) => sum + value, 0) / changes.length
    const variance = changes.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / changes.length
    return Math.sqrt(variance)
  }, [data])

  useEffect(() => {
    queryChart(symbol, period1, period2).then((rows) => {
      setData(
        rows.map((row) => ({
          time: row.date.toISOString().split('T').shift()!,
          value: row.close,
        }))
      )
    })
  }, [])

  return { data, first, firstTime, firstYear, firstValue, last, lastTime, lastYear, lastValue, years, returnRate, cagr, stdev }
}

const SharpeRatio = () => {
  const chartSample1 = useRef<HTMLDivElement>(null)
  const chartSample2 = useRef<HTMLDivElement>(null)
  const chartSample3 = useRef<HTMLDivElement>(null)
  const chartSample4 = useRef<HTMLDivElement>(null)
  const start = new Date('2019-12-01')
  const end = new Date('2023-10-01')
  const pep = useStock('PEP', start, end)
  const meta = useStock('META', start, end)
  const [symbol, setSymbol] = useState('AAPL')
  const [aapl, setAapl] = useState<YahooChartRow[]>([])
  const [aaplSharpe, setAaplSharpe] = useState(0)
  const [leftSymbol, setLeftSymbol] = useState('VOO')
  const [rightSymbol, setRightSymbol] = useState('NFLX')
  const [leftSymbolAllocation, setLeftSymbolAllocation] = useState(50)
  const [leftSharpe, setLeftSharpe] = useState(0)
  const [rightSharpe, setRightSharpe] = useState(0)
  const [leftCagr, setLeftCagr] = useState(0)
  const [rightCagr, setRightCagr] = useState(0)

  useEffect(() => {
    if (!chartSample1.current || !pep.data.length || !meta.data.length) {
      return
    }

    const chart = createChart(chartSample1.current, {
      width: chartSample1.current.clientWidth,
      height: Math.floor(chartSample1.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    const stockX = chart.addLineSeries({ color: 'red', title: 'Stock X' })
    const stockY = chart.addLineSeries({ color: 'blue', title: 'Stock Y' })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format } })
    stockX.setData(pep.data)
    stockY.setData(meta.data)
    chart.timeScale().fitContent()
    return () => {
      chart.remove()
    }
  }, [pep, meta])

  useEffect(() => {
    if (!chartSample2.current || !pep.data.length || !meta.data.length) {
      return
    }

    const chart = createChart(chartSample2.current, {
      width: chartSample2.current.clientWidth,
      height: Math.floor(chartSample2.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
      rightPriceScale: {
        visible: true,
      },
      leftPriceScale: {
        visible: true,
      },
    })

    const stockX = chart.addLineSeries({ color: 'red', title: 'Stock X', priceScaleId: 'left' })
    const stockY = chart.addLineSeries({ color: 'blue', title: 'Stock Y', priceScaleId: 'right' })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format } })
    stockX.setData(pep.data)
    stockY.setData(meta.data)
    chart.timeScale().fitContent()
    return () => {
      chart.remove()
    }
  }, [pep, meta])

  const calculateApple = async () => {
    const period2 = new Date()
    const period1 = new Date(period2.getFullYear() - 2, period2.getMonth(), period2.getDate())
    const rows = await queryChart(symbol, period1, period2)
    setAapl(rows)
  }

  useEffect(() => {
    calculateApple()
  }, [])

  useEffect(() => {
    if (!chartSample3.current || !aapl.length) {
      return
    }

    const chart = createChart(chartSample3.current, {
      width: chartSample3.current.clientWidth,
      height: Math.floor(chartSample3.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    const series = chart.addCandlestickSeries()
    series.setData(aapl.slice(-252).map((row) => ({ time: row.date.toISOString().split('T').shift()!, open: row.open, high: row.high, low: row.low, close: row.close })))
    chart.timeScale().fitContent()
    return () => {
      chart.remove()
    }
  }, [aapl])

  useEffect(() => {
    if (!chartSample4.current || !aapl.length) {
      return
    }

    const chart = createChart(chartSample4.current, {
      width: chartSample4.current.clientWidth,
      height: Math.floor(chartSample4.current.clientWidth / 4),
      handleScale: false,
      handleScroll: false,
    })

    const items: Array<{ time: string; value: number }> = []
    for (let i = aapl.length - 252; i < aapl.length; i++) {
      const bv = aapl[i - 251].close
      const ev = aapl[i].close
      const cagr = Math.pow(ev / bv, 1 / 1) - 1

      const changes = aapl
        .slice(i - 252, i)
        .map((row, i, arr) => (i ? (row.close - arr[i - 1].close) / arr[i - 1].close : 0))
        .slice(1)
      const stdev = Math.sqrt(changes.reduce((sum, value) => sum + Math.pow(value - changes.reduce((sum, value) => sum + value, 0) / changes.length, 2), 0) / changes.length) * Math.sqrt(252)

      const sharpe = (cagr - 0.04) / stdev

      items.push({ time: aapl[i].date.toISOString().split('T').shift()!, value: sharpe })
    }

    const series = chart.addBaselineSeries()
    series.setData(items)
    chart.timeScale().fitContent()

    setAaplSharpe(items[items.length - 1].value)

    return () => {
      chart.remove()
    }
  }, [aapl])

  const aaplSharpeClassName = useMemo(() => {
    if (aaplSharpe < 0) {
      return 'text-danger'
    }
    if (aaplSharpe > 0.5) {
      return 'text-success'
    }
    return 'text-secondary'
  }, [aaplSharpe])

  useEffect(() => {
    const period2 = new Date()
    const period1 = new Date(period2.getFullYear() - 1, period2.getMonth(), period2.getDate())
    queryChart(leftSymbol, period1, period2).then((rows) => {
      const bv = rows[0].close
      const ev = rows[rows.length - 1].close
      const cagr = Math.pow(ev / bv, 1 / 1) - 1

      const changes = rows.map((row, i, arr) => (i ? (row.close - arr[i - 1].close) / arr[i - 1].close : 0)).slice(1)
      const stdev = Math.sqrt(changes.reduce((sum, value) => sum + Math.pow(value - changes.reduce((sum, value) => sum + value, 0) / changes.length, 2), 0) / changes.length) * Math.sqrt(252)

      const sharpe = (cagr - 0.04) / stdev
      setLeftSharpe(sharpe)
      setLeftCagr(cagr)
    })
  }, [leftSymbol])

  useEffect(() => {
    const period2 = new Date()
    const period1 = new Date(period2.getFullYear() - 1, period2.getMonth(), period2.getDate())
    queryChart(rightSymbol, period1, period2).then((rows) => {
      const bv = rows[0].close
      const ev = rows[rows.length - 1].close
      const cagr = Math.pow(ev / bv, 1 / 1) - 1

      const changes = rows.map((row, i, arr) => (i ? (row.close - arr[i - 1].close) / arr[i - 1].close : 0)).slice(1)
      const stdev = Math.sqrt(changes.reduce((sum, value) => sum + Math.pow(value - changes.reduce((sum, value) => sum + value, 0) / changes.length, 2), 0) / changes.length) * Math.sqrt(252)

      const sharpe = (cagr - 0.04) / stdev
      setRightSharpe(sharpe)
      setRightCagr(cagr)
    })
  }, [rightSymbol])

  const allocatedSharpe = useMemo(() => {
    return (leftSharpe * leftSymbolAllocation + rightSharpe * (100 - leftSymbolAllocation)) / 100
  }, [leftSharpe, rightSharpe, leftSymbolAllocation])

  const allocatedCagr = useMemo(() => {
    return (leftCagr * leftSymbolAllocation + rightCagr * (100 - leftSymbolAllocation)) / 100
  }, [leftCagr, rightCagr, leftSymbolAllocation])

  return (
    <main>
      <div className="container py-5">
        <h1 className="mb-3">Sharpe Ratio</h1>
        <div id="what">
          <h2 className="my-5">Що воно таке?</h2>
          <p>За для того щоб зрозуміти що воно таке та навіщо потрібно спробуймо подивитися на наступний графік двух акцій та відповісти на питання - маючи котру з двох ми мали б менше сідини?</p>
          <div ref={chartSample1} className="my-5" />
          <p>З першу мозок буде чиплятися за синю лінію, але потім, трохи придивившись та подумавши, переключиться на червону.</p>
          <p>Справа в тому, що обидві акції принесли прибуток, одна трохи більше, друга трохи менше.</p>
          <p>За для більшої наглядності є сенс відобразити графіки у режимі коли у кожної лінії своя шкала:</p>
          <div ref={chartSample2} className="my-5" />
          <p>
            Загальні здобутки синьої акції склали{' '}
            <span title={`(${currency(meta.lastValue)} - ${currency(meta.firstValue)}) / ${currency(meta.firstValue)} * 100`}>{currency(meta.returnRate * 100)}%</span>, а червоної{' '}
            <span title={`(${currency(pep.lastValue)} - ${currency(pep.firstValue)}) / ${currency(pep.firstValue)} * 100`}>{currency(pep.returnRate * 100)}%</span>.
          </p>
          <p>Але ось у чому справа, на протязі цих років, синя якція дала б незабутні відчуття атракціону американскіх гірок.</p>
          <details className="my-3">
            <summary>Примітка</summary>
            <p className="mt-3 mb-0">
              Акції що зображені на графіку - <span style={{ color: 'blue' }}>META</span> та <span style={{ color: 'red' }}>PEP</span>
            </p>
          </details>
          <p>
            Хоч тут, у гру, вступає ваш ризик профіль, здається все одно, більшисть погодиться, що краще по троху але більш &laquo;стабільно&raquo; ніж гойдалки туди сюди - ось саме навколо цього і
            існує Sharpe Ratio.
          </p>
        </div>

        <div id="how">
          <h2 className="my-5">Як порахувати?</h2>
          <p>Формула</p>
          <p className="my-3 fs-3">
            <math>
              <mi>S</mi>
              <mo>=</mo>
              <mfrac>
                <mrow>
                  <msub>
                    <mi>R</mi>
                    <mn>p</mn>
                  </msub>
                  <mo>-</mo>
                  <msub>
                    <mi>R</mi>
                    <mn>f</mn>
                  </msub>
                </mrow>
                <msub>
                  <mi>&sigma;</mi>
                  <mn>p</mn>
                </msub>
              </mfrac>
            </math>
          </p>
          <p>Де:</p>
          <ul>
            <li>
              R<sub>p</sub> &mdash; дохідність портфеля. Сюди підставляємо річну дохідність портфелю у процентах.
            </li>
            <li>
              R<sub>f</sub> &mdash; дохідність безризикового активу. Наприклад депозиту чи облігацій. Нам потрібна ця цифра за для того щоб завчасно зупинитися, адже якщо наш актив веде себе гірше ніж
              без ризиковий - нема ніякого сенсу в нього вкладатися.
            </li>
            <li>
              &sigma;<sub>p</sub> &mdash; волатильність портфеля. Волотильність є нічим іншим як стандарте відхилення коливань ціни.
            </li>
          </ul>
          <p>
            <a href="https://www.investopedia.com/terms/s/sharperatio.asp">Джерело</a>
          </p>
          <p>Спробуймо розрахувати ці показники для акцій що роздивлялися раніше.</p>
          <p>
            <b style={{ color: 'blue' }}>META</b>
          </p>
          <p>
            На <span title={meta.firstTime}>початку</span> акція коштувала <span title={meta.firstTime}>${currency(meta.firstValue)}</span>, а на <span title={meta.lastTime}>прикінці</span> -{' '}
            <span title={meta.lastTime}>${currency(meta.lastValue)}</span>.
          </p>
          <p>
            Кількість років - {meta.lastTime} - {meta.firstTime} = {meta.years}.
          </p>
          <p>
            Отже <a href="https://www.investopedia.com/terms/c/cagr.asp">річна дохідність</a> дорівнюватиме:
          </p>
          <p className="my-3">
            <math>
              <mi>CAGR</mi>
              <mo>=</mo>
              <mo>(</mo>
              <msup>
                <mrow>
                  <mo>(</mo>
                  <mfrac>
                    <msub>
                      <mi>E</mi>
                      <mi>v</mi>
                    </msub>
                    <msub>
                      <mi>B</mi>
                      <mi>v</mi>
                    </msub>
                  </mfrac>
                  <mo>)</mo>
                </mrow>
                <mrow>
                  <mfrac>
                    <mn>1</mn>
                    <mi>n</mi>
                  </mfrac>
                </mrow>
              </msup>
              <mo>-</mo>
              <mn>1</mn>
              <mo>)</mo>
              <mo>&times;</mo>
              <mn>100</mn>
              <mo>=</mo>
              <mo>(</mo>
              <msup>
                <mrow>
                  <mo>(</mo>
                  <mfrac>
                    <mn>{currency(meta.lastValue)}</mn>
                    <mn>{currency(meta.firstValue)}</mn>
                  </mfrac>
                  <mo>)</mo>
                </mrow>
                <mrow>
                  <mfrac>
                    <mn>1</mn>
                    <mi>{meta.years}</mi>
                  </mfrac>
                </mrow>
              </msup>
              <mo>-</mo>
              <mn>1</mn>
              <mo>)</mo>
              <mo>&times;</mo>
              <mn>100</mn>
              <mo>=</mo>
              <mn>{currency(meta.cagr)}</mn>
            </math>
          </p>
          <p>За для розрахунку волатильності спочатку рохрахуємо як змінювалась ціна на протязі всього періоду:</p>
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>
                  Ціна <span className="text-secondary">$</span>
                </th>
                <th>
                  Зміна <span className="text-secondary">%</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {meta.data
                .map((row, i) => (
                  <tr key={i}>
                    <td>{row.time}</td>
                    <td>{currency(row.value)}</td>
                    <td title={i ? `(${currency(row.value)} - ${currency(meta.data[i - 1].value)}) / ${currency(meta.data[i - 1].value)}` : ''}>
                      {i ? currency((row.value - meta.data[i - 1].value) / meta.data[i - 1].value) : ''}
                    </td>
                  </tr>
                ))
                .slice(0, 3)}
              <tr>
                <td colSpan={3}>&hellip;</td>
              </tr>
              {meta.data
                .map((row, i) => (
                  <tr key={i}>
                    <td>{row.time}</td>
                    <td>{currency(row.value)}</td>
                    <td title={i ? `(${currency(row.value)} - ${currency(meta.data[i - 1].value)}) / ${currency(meta.data[i - 1].value)}` : ''}>
                      {i ? currency((row.value - meta.data[i - 1].value) / meta.data[i - 1].value) : ''}
                    </td>
                  </tr>
                ))
                .slice(-3)}
            </tbody>
          </table>
          <p>
            Волатильність є стандартним відхиленням помноженим на квадратний корінь від 252 (середня кількість робочих днів у році), отже наша волатильність &mdash;{' '}
            <span title={`stdev(changes) * sqrt(252) = ${currency(meta.stdev)} * ${currency(Math.sqrt(252))}`}>{currency(meta.stdev * Math.sqrt(252))}</span>
          </p>
          <p>Нарешті, маємо все необхідне за для розрахунку Sharpe Ratio, за безризикову дохідність візмемо 4%:</p>
          <p className="my-3">
            <math>
              <mi>S</mi>
              <mo>=</mo>
              <mfrac>
                <mrow>
                  <msub>
                    <mi>R</mi>
                    <mn>p</mn>
                  </msub>
                  <mo>-</mo>
                  <msub>
                    <mi>R</mi>
                    <mn>f</mn>
                  </msub>
                </mrow>
                <msub>
                  <mi>&sigma;</mi>
                  <mn>p</mn>
                </msub>
              </mfrac>
              <mo>=</mo>
              <mfrac>
                <mrow>
                  <mn>{currency(meta.cagr / 100)}</mn>
                  <mo>-</mo>
                  <mn>0.04</mn>
                </mrow>
                <mn>{currency(meta.stdev * Math.sqrt(252))}</mn>
              </mfrac>
              <mo>=</mo>
              <mn>{currency((meta.cagr / 100 - 0.04) / (meta.stdev * Math.sqrt(252)))}</mn>
            </math>
          </p>
          <p>
            <b style={{ color: 'red' }}>PEP</b>
          </p>
          <p>І теперь те ж саме для PEP</p>
          <p className="my-3">
            <math>
              <mi>S</mi>
              <mo>=</mo>
              <mfrac>
                <mrow>
                  <msub>
                    <mi>R</mi>
                    <mn>p</mn>
                  </msub>
                  <mo>-</mo>
                  <msub>
                    <mi>R</mi>
                    <mn>f</mn>
                  </msub>
                </mrow>
                <msub>
                  <mi>&sigma;</mi>
                  <mn>p</mn>
                </msub>
              </mfrac>
              <mo>=</mo>
              <mfrac>
                <mrow>
                  <mn>{currency(pep.cagr / 100)}</mn>
                  <mo>-</mo>
                  <mn>0.04</mn>
                </mrow>
                <mn>{currency(pep.stdev * Math.sqrt(252))}</mn>
              </mfrac>
              <mo>=</mo>
              <mn>{currency((pep.cagr / 100 - 0.04) / (pep.stdev * Math.sqrt(252)))}</mn>
            </math>
          </p>
          <p>У обох акцій за цей період досить низький показник (вважається що значення більші за 0.5 ще куди не шло, а значення більші за одиницю вже досить гарно).</p>
          <p>Але PEP є менш ризиковою ніж META згідно цього показника, адже має хоч і трохи але більше значення.</p>
        </div>

        <div id="single">
          <h2 className="my-5">Як щодо інших акцій?</h2>
          <p>Завдяки цьому тулу можна швиденько подивитися Sharpe Ratio якоїсь акції.</p>
          <div className="row align-items-center my-3">
            <div className="col-auto">
              <input className="form-control" type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" onClick={() => calculateApple()}>
                Порахувати
              </button>
            </div>
            <div className="col-auto">
              Sharpe Ratio <b className={aaplSharpeClassName}>{currency(aaplSharpe)}</b>
            </div>
          </div>
          <p>
            Також, поки ми в контексті однієї акції, ось важливий та цікавий момент - Sharpe Ratio показник, що веде себе так само як і інші, а отже не слід чиплятися за його значення у моменті, за
            для наглядності, ось як він виглядає у динаміці
          </p>
          <div ref={chartSample3} className="my-3" />
          <div ref={chartSample4} className="my-3" />
          <details className="my-3">
            <summary>Примітка</summary>
            <p className="mt-3">В TradingView є декілька індикаторів від комьюніті за для розрахунку та показу Sharpe Ratio</p>
            <p>Також, можно досить легко зробити свій таким сніпетом:</p>
            <p className="mb-0">
              <code>
                <pre>
                  //@version=5
                  <br />
                  indicator("Sharpe Ratio", overlay=false)
                  <br />
                  <br />
                  averageReturn=ta.roc(close, 250)
                  <br />
                  stdev = ta.stdev(averageReturn, 250)
                  <br />
                  sharpeRatio = (averageReturn-4)/stdev
                  <br />
                  <br />
                  plot(sharpeRatio,color = sharpeRatio &lt; 0 ? color.red : sharpeRatio &gt; 0.5 ? color.green : color.gray)
                </pre>
              </code>
            </p>
          </details>
        </div>

        <div id="two">
          <h2 className="my-5">А як щодо портфеля з двох активів?</h2>
          <p>Перед тим як рухатися далі, на прикладі портфеля з двох активів розберемося як порахувати Sharpe Ratio, а також зробимо цікаву забавку з пошуком найкращого значення</p>
          <p>Розрахунок доволі простий, маємо портфель з двох активів, розраховуємо Sharpe Ratio кожного активу окремо, дале множимо отримане значення на вагу активу у портфелі.</p>
          <p>Спробуйте віднайти аллокацію активів що з одного боку буде давати задовільну дохідність, а з іншого, буде менш ризиковою.</p>
          <div className="row my-3">
            <div className="col-12 col-md-6">
              <div className="row align-items-center my-3">
                <div className="col-4">
                  <input className="form-control" type="text" style={{ textAlign: 'center' }} value={leftSymbol} onChange={(e) => setLeftSymbol(e.target.value)} />
                </div>
                <div className="col-4 text-center text-secondary">stocks</div>
                <div className="col-4">
                  <input className="form-control" type="text" style={{ textAlign: 'center' }} value={rightSymbol} onChange={(e) => setRightSymbol(e.target.value)} />
                </div>
              </div>
              <div className="row align-items-center my-3">
                <div className="col-4 text-center">{currency(leftCagr * 100)}</div>
                <div className="col-4 text-center text-secondary">cagr</div>
                <div className="col-4 text-center">{currency(rightCagr * 100)}</div>
              </div>
              <div className="row align-items-center my-3">
                <div className="col-4 text-center">{currency(leftSharpe)}</div>
                <div className="col-4 text-center text-secondary">sharpe ratio</div>
                <div className="col-4 text-center">{currency(rightSharpe)}</div>
              </div>
              <div className="row align-items-center my-3">
                <div className="col-4">
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    style={{ textAlign: 'center' }}
                    value={leftSymbolAllocation}
                    onChange={(e) => setLeftSymbolAllocation(e.target.valueAsNumber)}
                  />
                </div>
                <div className="col-4">
                  <div className="text-center text-secondary">allocation</div>
                  <input className="form-range" type="range" min="0" max="100" step="1" value={leftSymbolAllocation} onChange={(e) => setLeftSymbolAllocation(e.target.valueAsNumber)} />
                </div>
                <div className="col-4">
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    style={{ textAlign: 'center' }}
                    value={100 - leftSymbolAllocation}
                    onChange={(e) => setLeftSymbolAllocation(100 - e.target.valueAsNumber)}
                  />
                </div>
              </div>
              <div className="row my-3">
                <div className="text-center">
                  <div className="text-secondary">cagr</div>
                  <b>{currency(allocatedCagr * 100)}</b>
                </div>
              </div>
              <div className="row my-3">
                <div className="text-center" title={`${currency(leftSharpe)} * ${currency(leftSymbolAllocation / 100)} + ${currency(rightSharpe)} * ${currency((100 - leftSymbolAllocation) / 100)}`}>
                  <div className="text-secondary">sharpe ratio</div>
                  <b>{currency(allocatedSharpe)}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="excel">
          <h2 className="my-5">Я хочу порахувати самостійно в єкселі</h2>
          <p>За для рорахунку в єксельці можна використати наступну фомрулу:</p>
          <p>Лише підставте замість "AAPL" комірку або свою акцію.</p>
          <p>
            <code>
              =LET(
              <br />
              symbol,"AAPL",
              <br />
              riskfree,0.04,
              <br />
              prices,QUERY(INDEX(GOOGLEFINANCE(symbol, "price", EDATE(TODAY(),-12), TODAY(), "DAILY"),,2),"OFFSET 1",0),
              <br />
              cagr,RRI(1,INDEX(prices,1,1),INDEX(prices,COUNT(prices),1)),
              <br />
              stdev,STDEV(MAP(QUERY(prices,"LIMIT "&(COUNT(prices)-1)), QUERY(prices,"OFFSET 1"),LAMBDA(prev,curr,(curr-prev)/prev))) * SQRT(252),
              <br />
              sharpe,(cagr-riskfree)/stdev,
              <br />
              sharpe
              <br />)
            </code>
          </p>
        </div>
      </div>
    </main>
  )
}

export default SharpeRatio

export const Head: HeadFC = () => <title>Sharpe Ratio</title>
