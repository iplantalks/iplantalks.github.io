import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useState, useRef, useMemo } from 'react'
import '../../styles/common.css'
import { OFX, parseMsMoneyOfxReport } from '../../utils/ibkr/ofx'
import { proxy } from '../../utils/proxy'
import { getPrice } from '../../utils/yahoo'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { currency } from '../../utils/formatters'

ChartJS.register(ArcElement, Tooltip, Legend)

const colors = [
  '#e2431e',
  '#f1ca3a',
  '#6f9654',
  '#1c91c0',
  '#4374e0',
  '#5c3292',
  '#572a1a',
  '#999999',
  '#1a1a1a',
  '#ea5545',
  '#f46a9b',
  '#ef9b20',
  '#edbf33',
  '#ede15b',
  '#bdcf32',
  '#87bc45',
  '#27aeef',
  '#b33dc6',
  '#e60049',
  '#0bb4ff',
  '#50e991',
  '#e6d800',
  '#9b19f5',
  '#ffa300',
  '#dc0ab4',
  '#b3d4ff',
  '#00bfa0',
]

interface Position {
  ticker: string
  units: number
  price: number
}

interface Profile {
  beta: number
  range: string
  industry: string
  sector: string
  country: string
  isEtf: boolean
}

function extractPositionsFrom(ofx: OFX) {
  const positions: Position[] = []
  for (const pos of ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSSTOCK ?? []) {
    const id = pos.INVPOS.SECID.UNIQUEID
    const units = pos.INVPOS.UNITS
    const price = pos.INVPOS.UNITPRICE
    const ticker = ofx.SECLISTMSGSRSV1.SECLIST.STOCKINFO?.find((s) => s.SECINFO.SECID.UNIQUEID === id)?.SECINFO.TICKER
    if (!ticker) {
      continue
    }
    const found = positions.find((p) => p.ticker === ticker)
    if (found) {
      found.units += units
    } else {
      positions.push({ ticker, units, price })
    }
  }
  // for (const debt of ofx.INVSTMTMSGSRSV1.INVSTMTTRNRS.INVSTMTRS.INVPOSLIST?.POSDEBT ?? []) {
  //   const id = debt.INVPOS.SECID.UNIQUEID
  //   const units = debt.INVPOS.UNITS
  //   const price = debt.INVPOS.UNITPRICE
  //   const ticker = ofx.SECLISTMSGSRSV1.SECLIST.DEBTINFO?.find((s) => s.SECINFO.SECID.UNIQUEID === id)?.SECINFO.TICKER
  //   if (!ticker) {
  //     continue
  //   }
  //   const found = positions.find((p) => p.ticker === ticker)
  //   if (found) {
  //     found.units += units
  //   } else {
  //     positions.push({ ticker, units, price })
  //   }
  // }
  return positions
}

async function fetchProfile(ticker: string): Promise<Profile> {
  try {
    const res = await proxy('https://marketplace.financialmodelingprep.com/public/profile/' + ticker).then((r) => r.json())
    const profile = Array.isArray(res) ? res[0] : res
    const { beta, range, industry, sector, country, isEtf } = profile as { beta: number; range: string; industry: string; sector: string; country: string; isEtf: boolean }
    return { beta, range, industry, sector, country, isEtf }
  } catch (e) {
    console.log(`fetch profile for ${ticker} error: ${e instanceof Error ? e.message : e}`)
    return { beta: 0, range: '', industry: '', sector: '', country: '', isEtf: false }
  }
}

const PieChart = ({ data, title }: { data: Record<string, number>; title: string }) => (
  <Doughnut
    data={{
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: colors,
        },
      ],
    }}
    options={{
      responsive: true,
      animation: false,
      animations: {},
      plugins: {
        title: {
          display: true,
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

const Rebalance = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [categories, setCategories] = useState<Record<string, string>>(JSON.parse(localStorage.getItem('categories') || '{}'))

  const handle = (texts: string[]) => {
    const positions = []
    for (const text of texts) {
      const ofx = parseMsMoneyOfxReport(text)
      for (const position of extractPositionsFrom(ofx)) {
        positions.push(position)
      }
    }
    setPositions(positions)
  }
  const handleFileChoosen = async (files: FileList | null) => {
    if (!files) {
      return
    }
    const texts = []
    for (const file of Array.from(files)) {
      texts.push(await file.text())
    }
    handle(texts)
  }
  useEffect(() => {
    fetch('/rebalance/sample.ofx')
      .then((res) => res.text())
      .then((text) => handle([text]))
  }, [])
  useEffect(() => {
    for (const position of positions) {
      fetchProfile(position.ticker).then((profile) => {
        setProfiles((profiles) => ({ ...profiles, [position.ticker]: profile }))
      })
      getPrice(position.ticker).then((price) => {
        price = price || positions.find((p) => p.ticker === position.ticker)?.price || 0
        setPrices((prices) => ({ ...prices, [position.ticker]: price }))
      })
    }
  }, [positions])

  const sectors = useMemo(() => {
    const sectors: Record<string, number> = {}
    for (const position of positions) {
      const profile = profiles[position.ticker]
      if (!profile) {
        continue
      }
      sectors[profile.sector] = (sectors[profile.sector] || 0) + position.units * (prices[position.ticker] || position.price)
    }
    return sectors
  }, [positions, prices, profiles])

  const industries = useMemo(() => {
    const industries: Record<string, number> = {}
    for (const position of positions) {
      const profile = profiles[position.ticker]
      if (!profile) {
        continue
      }
      industries[profile.industry] = (industries[profile.industry] || 0) + position.units * (prices[position.ticker] || position.price)
    }
    return industries
  }, [positions, prices, profiles])

  const countries = useMemo(() => {
    const countries: Record<string, number> = {}
    for (const position of positions) {
      const profile = profiles[position.ticker]
      if (!profile) {
        continue
      }
      countries[profile.country] = (countries[profile.country] || 0) + position.units * (prices[position.ticker] || position.price)
    }
    return countries
  }, [positions, prices, profiles])

  const etfs = useMemo(() => {
    const etfs: Record<string, number> = {
      ETF: 0,
      Stock: 0,
    }
    for (const position of positions) {
      const profile = profiles[position.ticker]
      if (!profile) {
        continue
      }
      if (profile.isEtf) {
        etfs['ETF'] = position.units * (prices[position.ticker] || position.price)
      } else {
        etfs['Stock'] = position.units * (prices[position.ticker] || position.price)
      }
    }
    return etfs
  }, [positions, prices, profiles])

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  const cats = useMemo(() => {
    const cats: Record<string, number> = {}
    for (const position of positions) {
      cats[categories[position.ticker] || 'other'] = (cats[categories[position.ticker] || 'other'] || 0) + position.units * (prices[position.ticker] || position.price)
    }
    return cats
  }, [positions, prices, categories])

  return (
    <main>
      <div className="container py-5">
        <h1 className="mb-5">Rebalance</h1>
        <input id="ofx" className="form-control" type="file" accept=".ofx" onChange={(e) => handleFileChoosen(e.target.files)} multiple={true} />
        <div className="row my-5">
          <div className="col-3">
            <div className="card">
              <div className="card-body">
                <div className="card-title text-center">Categories</div>
                <div className="card-text">
                  <PieChart data={cats} title="Categories" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="card">
              <div className="card-body">
                <div className="card-title text-center">Sectors</div>
                <div className="card-text">
                  <PieChart data={sectors} title="Sectors" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="card">
              <div className="card-body">
                <div className="card-title text-center">Industries</div>
                <div className="card-text">
                  <PieChart data={industries} title="Industries" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="card">
              <div className="card-body">
                <div className="card-title text-center">Countries</div>
                <div className="card-text">
                  <PieChart data={countries} title="Countries" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Ticker</th>
                <th>Units</th>
                <th>Price</th>
                <th>Value</th>
                <th>Sector</th>
                <th>Industry</th>
                <th>Country</th>
                <th>Type</th>
                <th>Alloc</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.ticker}>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={categories[p.ticker] || 'other'}
                      onChange={(e) => setCategories({ ...categories, [p.ticker]: e.target.value })}
                    />
                  </td>
                  <td>{p.ticker}</td>
                  <td>{p.units}</td>
                  <td>{currency(prices[p.ticker])}</td>
                  <td>{currency(p.units * (prices[p.ticker] || p.price))}</td>
                  <td>{profiles[p.ticker]?.sector}</td>
                  <td>{profiles[p.ticker]?.industry}</td>
                  <td>{profiles[p.ticker]?.country}</td>
                  <td>{profiles[p.ticker]?.isEtf ? 'ETF' : 'Stock'}</td>
                  <td>{Math.round((100 * (p.units * (prices[p.ticker] || p.price))) / positions.reduce((acc, pos) => acc + pos.units * (prices[pos.ticker] || pos.price), 0))}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p>У нас есть:</p>
          <ul>
            <li>X денег</li>
            <li>целевой alloc в разрезе категорий</li>
          </ul>
          <p>Нужно посчитать ордера</p>
        </div>
      </div>
    </main>
  )
}

export default Rebalance

export const Head: HeadFC = () => <title>Rebalance</title>
