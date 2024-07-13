import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import '../../styles/common.css'
import { Header } from '../../components/header'
import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { proxy } from '../../utils/proxy'
import { PlotRelayoutEvent } from 'plotly.js'
import Join from '../../components/join'
import { useAuth } from '../../context/auth'

const dimensions = [
  'marketCap',
  'dividendYield',
  'payoutRatio',
  'employees',
  'income',
  'sales',
  'epsQoQ',
  'epsYoY',
  'epsYoY1',
  'eps5Years',
  'estLTGrowth',
  'salesQoQ',
  'sales5Years',
  'PE',
  'forwardPE',
  'PEG',
  'PS',
  'PB',
  'PC',
  'PFCF',
  'roi',
  'roe',
  'roa',
  'grossMargin',
  'operMargin',
  'netMargin',
  'curRatio',
  'quickRatio',
  'ltdebtEq',
  'debtEq',
  'lastChange',
  'changeOpen',
  'averageVolume',
  'relativeVolume',
  'perf1w',
  'perf4w',
  'perf13w',
  'perf26w',
  'perf52w',
  'perfYtd',
  'volatility1w',
  'volatility4w',
  'beta',
  'low52w',
  'high52w',
  'sma20',
  'sma50',
  'sma200',
  'rsi',
  'insiderOwn',
  'insiderTrans',
  'instOwn',
  'instTrans',
  'shortInterestShare',
  'shortInterestRatio',
  'consRecom',
  'targetPrice',
]

interface IBubble {
  x: number
  y: number
  ticker: string
  size: number
}

async function fetchBubbles(x: string, y: string, tickers: string[]) {
  var url = new URL('https://finviz.com/api/bubbles.ashx')
  url.searchParams.set('x', x)
  url.searchParams.set('y', y)
  url.searchParams.set('size', 'marketCap')
  url.searchParams.set('color', 'perf52w')
  url.searchParams.set('idx', 'sp500') // sp500
  url.searchParams.set('rangeX', '')
  url.searchParams.set('rangeY', '')
  url.searchParams.set('sec', 'technology') // technology
  url.searchParams.set('ind', '')
  url.searchParams.set('cap', '')
  url.searchParams.set('sh_avgvol', '')
  url.searchParams.set('tickers', tickers.join(','))
  url.searchParams.set('excludeTickers', '')
  return (await proxy(url, 86400).then((r) => r.json())) as IBubble[]
}

const Chart = ({ x, y, tickers, onRelayout }: { x: string; y: string; tickers: string[]; onRelayout: (tickers: string[]) => void }) => {
  const [data, setData] = useState<IBubble[]>([])

  useEffect(() => {
    fetchBubbles(x, y, tickers).then(setData)
  }, [x, y, tickers])

  const onRelayoutInner = (e: Readonly<PlotRelayoutEvent>) => {
    console.log('relayout', e['xaxis.range[0]'])
    var xmin = e['xaxis.range[0]']!
    var xmax = e['xaxis.range[1]']!
    var ymin = e['yaxis.range[0]']!
    var ymax = e['yaxis.range[1]']!
    var tickers = data.filter((item) => item.x >= xmin && item.x <= xmax && item.y >= ymin && item.y <= ymax).map((item) => item.ticker)
    onRelayout(tickers)
  }

  return (
    <Plot
      data={[
        {
          mode: 'markers',
          x: data.map((item) => item.x),
          y: data.map((item) => item.y),
          text: data.map((item) => item.ticker),
          marker: {
            // color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)'],
            // opacity: [1, 0.8, 0.6, 0.4],
            size: data.map((item) => item.size),
            sizeref: (2.0 * Math.max(...data.map((item) => item.size))) / 100 ** 2,
            sizemode: 'area',
          },
        },
      ]}
      layout={{
        title: `${x} x ${y}`,
        showlegend: false,
        // width: document.body.clientWidth,
        // height: 600,
        xaxis: { title: x },
        yaxis: { title: y },
      }}
      onRelayout={onRelayoutInner}
    />
  )
}

const Bubble = () => {
  const { user } = useAuth()
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])

  const [tickers, setTickers] = useState<string[]>([])

  const onRelayout = (tickers: string[]) => {
    // console.log('relayout', tickers)
    setTickers(tickers)
  }

  return (
    <main>
      <Header />
      <div className="container my-5">
        <h1>Бульбашковий аналіз 🫧</h1>
        <p>Далі будут намальовані значення для всіляких показників з їх описом.</p>
        <p>Можна виділити цікаву зону на будь якому графіку за для того щоб звузити вібірку до цікавих компаній.</p>
        <p>Якщо навести мишою на будь яку бульбашку будуть показані значення X та Y, а також тікер компані.</p>
        <p>Розмір бульбашки пропорційний до marketcap.</p>
      </div>
      <div className="container my-5">
        <div className="row my-5">
          <div className="col-8">
            <Chart x="sales" y="income" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>Продажі до прибутку</h2>
            <p>
              <details>
                <summary>income</summary>
                <p>
                  Чистий прибуток можна подивитися у звітності компанії <code>us-gaap:NetIncomeLoss</code>
                </p>
              </details>
            </p>
            <p>X - продажі, чим більше тим краще.</p>
            <p>Y - чистий прибуток після сплати всіх податків, амортизації тощо, чим більше тим краще.</p>
            <p>Чистий прибуток може бути відємним, наприклад Netflix за свої підписки заробив мільон, але витратив два на нові серіали.</p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="forwardPE" y="PE" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>Прогнозований P/E до поточного</h2>
            <p>
              <math>
                <mrow>
                  <mtext>PE</mtext>
                </mrow>
                <mo>=</mo>
                <mfrac>
                  <mrow>
                    <mtext>price</mtext>
                  </mrow>
                  <mrow>
                    <mtext>earnings_per_share</mtext>
                  </mrow>
                </mfrac>
              </math>
            </p>
            <p>price - вартість акції</p>
            <p>earnings per share (EPS) - чистий прибуток компанії поділений на кількість випущених акцій, тобто яка частина від чистого прибутку припадає на одну акцію</p>
            <p>X - Прогнозований P/E - ворожіння аналітиків.</p>
            <p>Y - Поточний P/E.</p>
            <p>Вважається що значення P/E до 16 - це добре</p>
            <p>Також може бути така ситуація що поточний P/E зависокий, але прогнозований вже більш менш адекватний.</p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="PB" y="roe" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>P/B to ROE</h2>
            <p>
              Співвідношення вартості акції до загальної вартості компанії (всіх її частин, що у разі ліквідації були б розпродані). Низькі значення можуть свідчити про те що компанія недооцінена,
              оскільки її ціна менша ніж кількість грошей що можна отримати розпродавши майно компанії.
            </p>
            <p>
              <math>
                <mrow>
                  <mtext>PB</mtext>
                </mrow>
                <mo>=</mo>
                <mfrac>
                  <mrow>
                    <mtext>price</mtext>
                  </mrow>
                  <mrow>
                    <mtext>BVPS</mtext>
                  </mrow>
                </mfrac>
              </math>
            </p>
            <p>ROE - показник спідометр прибутковості компанії та того як ефективно вона генерує цей прибуток.</p>
            <p>
              <math>
                <mrow>
                  <mtext>ROE</mtext>
                </mrow>
                <mo>=</mo>
                <mfrac>
                  <mi>Net Income</mi>
                  <mi>Total Equity</mi>
                </mfrac>
              </math>
            </p>
            <p>
              Переоцінені ростучі компанії зазвичай показують комбінацію низького ROE та високого P/B. Компанії зі справедливою ціною мають ці показники що ростуть більш менш однаково, тому що акції,
              дорожчаючи з часом, залучують більше інвесторів, що збільшує їх вартість.
            </p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="eps5Years" y="estLTGrowth" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>EPS за попередні пʼять років до прогнозованого</h2>
            <p>Теоретично правий верхній кут є найпривабливішм, адже ці компанії мають ганру історії </p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="epsYoY" y="debtEq" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>EPS до боргів</h2>
            <p>Тут має бути щось розумне</p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="curRatio" y="quickRatio" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>Борги - короткострокові до довгострокових</h2>
            <p>Тут має бути щось розумне</p>
          </div>
        </div>

        <div className="row my-5">
          <div className="col-8">
            <Chart x="beta" y="volatility4w" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>Beta до місячної волатильності</h2>
            <p>X - Beta - як веде себе вартість компанії відносно ринка в цілому. Значення близкі нод одиниці - свідчать про поведінку схожу до поведінки ринку</p>
            <p>Y - Місячна волатильність. Малі значення свідчать про те що ціна акції майже не змінюється.</p>
          </div>
        </div>
        <div className="row my-5">
          <div className="col-8">
            <Chart x="perf52w" y="volatility4w" tickers={tickers} onRelayout={onRelayout} />
          </div>
          <div className="col-4">
            <h2>Річна зміна вартості акції до місячної волатильності</h2>
            <p>X - perf 1Y - як змінилась вартість акції компанії за рік, може бути відємною, чим більше тим краще.</p>
            <p>Y - Місячна волатильність. Малі значення свідчать про те що ціна акції майже не змінюється.</p>
            <p>Теоретично, компанії у нижньому правому куті є найкращими</p>
          </div>
        </div>
      </div>
      <div className="container my-5">
        <p>
          Примітка: у цій демо сторінці використовуються данні з{' '}
          <a href="https://finviz.com/" target="_blank">
            finviz.com
          </a>{' '}
          для компаній технологічного сектору що входять до індексу S&P 500
        </p>
      </div>

      <Join />
    </main>
  )
}

export default Bubble
export const Head: HeadFC = () => <title>Bubble</title>
