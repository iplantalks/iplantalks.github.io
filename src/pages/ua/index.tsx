import * as React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import '../../styles/common.css'
import { HeadFC } from 'gatsby'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { LineStyle, createChart } from 'lightweight-charts'
import { inflation, deposit_uah, deposit_usd, ovdp_uah, ovdp_usd, spy, cash_usd, deposit_usd_orig, colors, useData } from './components/_data'
import { BarChart } from './components/_bar-chart'
import { PercentageBarChart } from './components/_percentage-bar-chart'
import { CumulativeLineChart } from './components/_cumulative_line_chart'
import { CumulativeLinesChart } from './components/_cumulative_lines_chart'
import { currency } from '../../utils/formatters'
import { Header } from '../../components/header'
import Join from '../../components/join'

ChartJS.register(ArcElement, Tooltip, Legend)

const PieChart = ({ data, title }: { data: Record<string, number>; title?: string }) => (
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
          display: !!title,
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
    result[0].value = 100
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

function cumulative(items: Array<{ year: number; value: number }>): Array<{ year: number; value: number }> {
  const result: Array<{ year: number; value: number }> = []
  for (let i = 0; i < items.length; i++) {
    const cumulative = i === 0 ? 1 : (1 + items[i].value / 100) * result[i - 1].value
    result.push({ year: items[i].year, value: cumulative })
  }
  return result.map((x) => ({ year: x.year, value: x.value - 1 }))
  //.map((x) => ({ year: x.year, value: 100 * (x.value - 1) }))
}

function toTimeseries(items: Array<{ year: number; value: number }>): Array<{ time: string; value: number }> {
  return items.map((x) => ({ time: `${x.year}-01-01`, value: x.value }))
}

const TableRow = ({
  title,
  money,
  data,
  id,
  allocations,
  toggle,
}: {
  title: string
  money: string
  data: Array<{ year: number; value: number }>
  id: string
  allocations: Allocatable[]
  toggle: (id: string) => void
}) => {
  const found = allocations.find((x) => x.id === id)
  return (
    <tr>
      <td>{title}</td>
      <td>{money}</td>
      <td>{currency(Math.min(...data.map((x) => x.value)))}%</td>
      <td>{currency(data.map((x) => x.value).reduce((acc, x) => acc + x, 0) / data.length)}%</td>
      <td>{currency(Math.max(...data.map((x) => x.value)))}%</td>
      <td>
        {currency(
          data
            .slice(data.length - 10)
            .map((x) => x.value)
            .reduce((acc, x) => acc + x, 0) / 10
        )}
        %
      </td>
      <td>
        {currency(
          data
            .slice(data.length - 5)
            .map((x) => x.value)
            .reduce((acc, x) => acc + x, 0) / 5
        )}
        %
      </td>
      <td>{currency(data[data.length - 1].value)}%</td>
      <td>
        {!found && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => toggle(id)}>
            додати
          </button>
        )}
        {found && (
          <button className="btn btn-outline-danger btn-sm" onClick={() => toggle(id)}>
            прибрати
          </button>
        )}
      </td>
    </tr>
  )
}

const TableRowComminSoon = ({ title, money }: { title: string; money: string }) => {
  return (
    <tr>
      <td className="text-secondary">{title}</td>
      <td className="text-secondary">{money}</td>
      <td>&mdash;</td>
      <td>&mdash;</td>
      <td>&mdash;</td>
      <td>&mdash;</td>
      <td>&mdash;</td>
      <td>&mdash;</td>
      <td className="text-secondary">
        <small>comming soon</small>
      </td>
    </tr>
  )
}

const Market = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  const [showInflation, setShowInflation] = useState(true)
  const [showActives, setShowActives] = useState(true)

  const data = useData()
  const [allocations, setAllocations] = useState<Allocatable[]>([
    // { id: 'deposit_uah', value: 20, locked: false },
    // { id: 'deposit_usd', value: 20, locked: false },
  ])

  const minDate = useMemo(() => {
    let result = new Date().getFullYear() - 100
    if (allocations.length === 0) {
      return result
    }
    for (const id of Array.from(new Set(allocations.map((x) => x.id)))) {
      const min = Math.min(...data[id].map((x) => x.year))
      if (min > result) {
        result = min
      }
    }
    return result
  }, [allocations, data])

  const maxDate = useMemo(() => {
    let result = new Date().getFullYear()
    if (allocations.length === 0) {
      return result
    }
    for (const id of Array.from(new Set(allocations.map((x) => x.id)))) {
      const max = Math.max(...data[id].map((x) => x.year))
      if (max < result) {
        result = max
      }
    }
    return result
  }, [allocations, data])

  const [startDate, setStartDate] = useState(minDate)
  const [endDate, setEndDate] = useState(maxDate)

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

  const handleToggleInstrument = (id: string) => {
    const found = allocations.find((a) => a.id === id)
    let next = []
    if (found) {
      next = [...allocations].filter((a) => a.id !== id)
    } else {
      next = [...allocations, { id, value: 0, locked: false }]
    }

    for (let i = 0; i < next.length; i++) {
      next[i].value = Math.round(100 / next.length)
    }
    if (next.length > 0 && next.length % 2 !== 0) {
      next[0].value += 1
      if (next[0].value > 100) {
        next[0].value = 100
      }
    }
    setAllocations(next)
    setStartDate(minDate)
  }

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 300, //Math.floor(chartRef.current.clientWidth / 3),
      handleScale: false,
      handleScroll: false,
    })

    chart.applyOptions({ localization: { priceFormatter: Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format } })

    const portfolio: Record<number, number> = {}
    allocations.forEach(({ id, value }, idx) => {
      const allocation = value / 100
      const items = data[id].filter((x) => x.year >= startDate && x.year <= endDate)
      for (let i = 0; i < items.length; i++) {
        if (!portfolio[items[i].year]) {
          portfolio[items[i].year] = 0
        }
        portfolio[items[i].year] += items[i].value * allocation
      }
      if (showActives) {
        chart.addLineSeries({ color: `rgba(${colors[idx]}, .5)`, title: id, priceLineVisible: true }).setData(toTimeseries(cumulative(items)))
      }
    })
    chart.addLineSeries({ color: 'black', title: 'Portfolio', priceLineVisible: true }).setData(toTimeseries(cumulative(Object.entries(portfolio).map(([year, value]) => ({ year: +year, value })))))

    // const portfolioCum: Array<{ time: string; value: number }> = []
    // for (let i = 0; i < portfolioCombined.length; i++) {
    //   const cumulative = i === 0 ? 1 : (1 + portfolioCombined[i].value) * portfolioCum[i - 1].value
    //   portfolioCum.push({ time: `${portfolioCombined[i].year}-01-01`, value: cumulative })
    // }
    // chart.addLineSeries({ color: 'black', title: 'Portfolio', priceLineVisible: true }).setData(portfolioCum)
    // chart.addLineSeries({ color: 'black', title: 'Portfolio', priceLineVisible: true }).setData(toTimeseries(cumulative(portfolioCombined)))

    if (showInflation) {
      // const infl = inflation.filter(({ year }) => year >= startDate && year <= endDate)
      // const infitems: Array<{ time: string; value: number }> = []
      // for (let i = 0; i < infl.length; i++) {
      //   const cumulative = i === 0 ? 1 : (1 + infl[i].value / 100) * infitems[i - 1].value
      //   infitems.push({ time: `${infl[i].year}-01-01`, value: cumulative })
      // }
      // chart.addLineSeries({ color: 'red', title: 'Inflation', lineStyle: LineStyle.Dashed }).setData(infitems)
      chart.addLineSeries({ color: 'red', title: 'Inflation', lineStyle: LineStyle.Dashed }).setData(toTimeseries(cumulative(inflation.filter(({ year }) => year >= startDate && year <= endDate))))
    }

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [chartRef, allocations, startDate, endDate, showInflation, showActives])

  return (
    <main>
      <Header />
      <div className="container py-5">
        <h1>Ураїнскій Ринок 🇺🇦</h1>
        <h2>Гривня через 20 років або Прибуткові ігри*</h2>
        <p>З колегами з iPlan.ua та Діловий клуб «Партнер» ми давно виношували ідею порівняти прибутковість інвестиційних інструментів, доступних українцям, на якомога довгому тимчасовому горизонті 15-20 років. Це цілком підходящий нормальний період для довгострокових накопичень чи то пенсія, чи весілля навчання дитини за кордоном.</p>
        <p>Ми вибрали ті інвестиційні інструменти, які вважають доступними будь-кому, хто намагається примножити свої заощадження, не вдаючись до ризикованих кроків:</p>
        <ul>
          <li>Банківський депозит у гривні</li>
          <li>Банківський депозит у доларі</li>
          <li>Довгострокове страхування у гривні</li>
          <li>Купівля та здача в оренду нерухомості в Києві</li>
          <li>Купівля ОВДП в грн.</li>
          <li>Портфельна інвестиція – депозити та нерухомість із частками по 30%, страховка – 10%. Була введена для демонстрації диверсифікації як способу захисту від ринкових та валютних ризиків під час інвестування.</li>
        </ul>
        <p>Дополнительно для сравнения была взята Инфляция, чтобы понимать какой из инструментов реально защитил Ваши сбережения от обесценивания.</p>
        <h3>Стартовые параметры инвестирования: сумма – 10000 грн, январь 1998, 2008, 2013 гг.</h3>
        <p><b>Порядок виміру/усереднення курсів/ставок:</b></p>
        <ul>
          <li>Курс грн/долар, середньорічний</li>
          <li>Ціна на нерухомість на 01.07 кожного року</li>
          <li>Депозитні ставки на 31.03 кожного року.</li>
        </ul>

        <p><b>Припущення:</b></p>
        <ul>
          <li>Прибутковість розрахована за календарний рік і відображена в ньому.</li>
          <li>Усі податки сплачуються. 20% з оренди та доходів від страховки. 19,5% з депозитів та 1.5% з ОВДП (починаючи з 2014р.)</li>
          <li>Прибутковість оренди 3,5% річних до 2001р., далі 5% річних</li>
          <li>Прибутковість страховки = 80% від депозитної ставки у валюті, т.к. 5% податок на прибуток та 15% витрати на ведення справи</li>
          <li>Весь прибуток реінвестується. (Ми розуміємо, що у нерухомості це маломожливо, але так зручніше порівнювати результат інвестування у різні інструменти у поточних цінах)</li>
          <li>ОВДП з'явилися з 2009р., до цього року накопичення в цьому виді інвестування ми прирівняли до депозиту в грн, оскільки це найбільш схожий інвестиційний інструмент.</li>
        </ul>

        <p><b>Джерела інформації:</b></p>
        <ul>
          <li><a href="http://coins-ukraine.at.ua/news/realnaja_stoimost_ukrainskoj_grivny/2013-04-01-132">Курси валют</a></li>
          <li><a href="https://bin.ua/quotations/">Ставки по депозитам</a></li>
          <li><a href="https://blagovist.ua/realtystat/">Вартість кв.м. житла</a></li>
        </ul>

        <p><b>Проблеми проведення аналізу:</b></p>
        <ul>
          <li>Джерела інформації – на жаль однорідна та безперервна статистика</li>
          <li>ринкових курсів валют, депозитних ставок банків, вартості житла за період є лише з 2000-х, тому з 1998 року вона збиралася з різних джерел.</li>
          <li>Чутливість — наприклад, коригування помилки в курсі долара в 1998 р. з 5.5 до 2.43 грн/долар кардинальним чином вплинула на підсумковий результат, і Депозит в грн опустився в рейтингу аналізу з 1-го на 4-е місце.</li>
        </ul>

        <p>Для чистоти експерименту ми вирішили провести аналіз за 3 різні періоди, так щоб кожен із періодів захопив хоча б одну кризу 1998, 2008 та 2014 років. Це дозволить протестувати на стійкість різноманітні сценарії інвестування.</p>

        <h3>За підсумками аналізу, трійка лідерів найприбутковіших інвестиційних інструментів виглядає так:</h3>

        <ol>
          <li>
            <b>За период 1998-2018г</b>
            <ol type="a">
              <li>Недвижимость в Киеве для сдачи в аренду</li>
              <li>Депозит в долларе</li>
              <li>Портфельная инвестиция</li>
            </ol>
            <img src="/ua/one.png" />
          </li>
          <li>
            <b>За період 2008-2018</b>
            <ol type="a">
              <li>Депозит у доларі</li>
              <li>Довгострокове страхування у доларі</li>
              <li>Портфельна інвестиція, «Матрац»</li>
            </ol>
            <img src="/ua/two.png" />
          </li>
          <li>
            <b>За період 2013-2018</b>
            <ol type="a">
              <li>Депозит у доларі</li>
              <li>Довгострокове страхування у доларі</li>
              <li>«Матрац», Нерухомість в оренду, Портфельна інвестиція</li>
            </ol>
            <img src="/ua/three.png" />
          </li>
        </ol>

        <p><b>Короткий опис реалізованих ризиків/можливостей за період аналізу:</b></p>

        <ol type="a">
          <li><b>Нерухомість для оренди.</b> Ринок був неактивний до 1998 року, потім ціна кв. м. знизилася приблизно вдвічі. Після подій у США 11.09.2001р, побоювання емігрантів та апетити банків до видачі валютних кредитів зростали разом із цінами на нерухомість аж до 2008р. Далі – криза 2008 року, запровадили мораторій на валютне кредитування і тенденція зростання змінилася на спад, який ще посилився після 2014р.</li>
          <li><b>Депозит у грн, доларі.</b> Адміністрування цієї інвестиції було утруднено «банкопадами» 2008 та 2014-2018 років та неадекватним рівнем компенсації вкладів ФГВФО.</li>
          <li><b>Довгострокове страхування у грн, доларі.</b> На відміну від банків законодавство не передбачає державних гарантій захисту накопичувальних страхових внесків. Найважливіша функція страхових продуктів – захист життя, повна чи часткова виплата страхової суми у разі смерті чи зниження якості (інвалідність, серйозна травма) життя страхувальника. Слід також враховувати, що інвестиційна функція такої страховки буде менш виражена, ніж в інших продуктів, оскільки інвестуються лише частина страхових внесків 60-70% (точна частка може бути і більшою і меншою, залежно від віку страхованого), а 30-40% внесків використовуються для страхування.</li>
        </ol>

        <h3>Выводы анализа:</h3>

        <ul>
          <li>В умовах частих економічних криз, коли відбувається девальвація національної валюти, інструменти з валютною складовою показують найвищу прибутковість.</li>
          <li>На короткому горизонті 5 і менше років інвестиційні інструменти у гривні навіть не покривають рівень інфляції.</li>
          <li>Портфельне інвестування - консервативний інструмент, але стабільно знаходиться у топ-3 незалежно від терміну інвестування, що підтверджує ефект диверсифікації.</li>
          <li>На довгому періоді інвестування «матрас» та довгострокова страховка в грн – не варіант!</li>
          <li>Нерухомість для оренди на короткому горизонті дуже багато залежить від точки входу в ринок. У довгостроковій перспективі поки що виглядає позитивно.</li>
        </ul>

        <p>Було усе це пораховано і опубліковано аж у 2018 році, і якщо тобі цікава ця тема, читай далі та спробуй змоделювати свою історію.</p>

        <h2 className="my-5">
          <span className="text-secondary">Крок перший -</span> оберімо активи 🔎
        </h2>
        <p>
          Ось перелік інструментів що так чи інакше доступні пересічному громадянину, починаючи від найбільш консервативного варіанту тримати гроші під матрацом і закінчуючи найбіль прибутковим але і
          ризиковим фондовим ринком.
        </p>
        <table className="table align-middle text-center">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Валюта</th>
              <th>min(inception)</th>
              <th>avg(inception)</th>
              <th>max(inception)</th>
              <th>avg(10y)</th>
              <th>avg(5y)</th>
              <th>1y</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <TableRow title="Готівка" money="Долар" data={cash_usd} id="cash_usd" allocations={allocations} toggle={handleToggleInstrument} />
            <TableRow title="Депозит" money="Гривня" data={deposit_uah} id="deposit_uah" allocations={allocations} toggle={handleToggleInstrument} />
            <TableRow title="Депозит" money="Долар" data={deposit_usd} id="deposit_usd" allocations={allocations} toggle={handleToggleInstrument} />
            <TableRow title="ОВДП" money="Гривня" data={ovdp_uah} id="ovdp_uah" allocations={allocations} toggle={handleToggleInstrument} />
            <TableRow title="ОВДП" money="Долар" data={ovdp_usd} id="ovdp_usd" allocations={allocations} toggle={handleToggleInstrument} />
            <TableRowComminSoon title="Страховка" money="Гривня" />
            <TableRowComminSoon title="НПФ" money="Гривня" />
            <TableRow title="Фондовий ринок" money="Долар" data={spy} id="spy" allocations={allocations} toggle={handleToggleInstrument} />
          </tbody>
        </table>
        <details>
          <summary>Примітки</summary>
          <ul>
            <li>Для кожного інструменту ми маємо історичні данні з щорічною дохідністью</li>
            <li>У табличці відображаємо найкращі та найгірши роки, а також середні значення за весь період, останні десять років та останній рік</li>
            <li>
              Для інструментів у валюті - конвертуємо дохідніть з урахуванням зміни курсу, тобто якщо депозит у доларі приніс за рік 10% і курс долару зріс на 10% то річна дохідність буде{' '}
              <code>((1 + deposit_usd) * (1 + cash_usd) - 1)</code>
            </li>
          </ul>
        </details>

        <pre>{minDate}</pre>

        <h2 className="my-5">
          <span className="text-secondary">Крок другий -</span> розпреділимо активи 📊
        </h2>
        <p>Ваша мета - розпреділити активи таким чином щоб мати більш менш очікувану дохідність. Також варто спробувати подивитися результати на різних проміжках часу за для більшої впеноності.</p>
        <p>За для зручності додано графік інфляції - в ідеалі портфель має обганяти її.</p>

        <div className="my-5 d-flex justify-content-around align-items-center">
          <div>
            <div style={{ maxWidth: '200px' }}>
              <PieChart data={allocations.reduce((acc, x) => Object.assign(acc, { [x.id]: x.value }), {})} />
            </div>
          </div>
          <div>
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
          </div>
          <div>
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
          </div>
        </div>

        <div className="my-5">
          <div>
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
          </div>
          <div ref={chartRef} style={{ height: '300px' }} />
        </div>

        {/* <PercentageBarChart title="portfolio" data={portfolio.reduce((acc, x) => Object.assign(acc, { [x.year]: x.value }), {})} /> */}
      </div>

      <Join />
    </main>
  )
}

export default Market

export const Head: HeadFC = () => <title>UA Market</title>
