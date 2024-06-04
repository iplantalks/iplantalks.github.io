import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useState, useRef, useMemo, Dispatch, SetStateAction } from 'react'
import '../../styles/common.css'
import { OFX, parseMsMoneyOfxReport } from '../../utils/ibkr/ofx'
import { proxy } from '../../utils/proxy'
import { getPrice } from '../../utils/yahoo'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { currency } from '../../utils/formatters'

ChartJS.register(ArcElement, Tooltip, Legend)

function shuffle<T>(array: T[]): T[] {
  const shuffled = array.slice().sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.floor(Math.random() * shuffled.length))
}

const colors = shuffle([
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
])

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

interface Allocatable {
  id: string
  value: number
  locked: boolean
}

function allocate(state: Allocatable[], next: Allocatable) {
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
    const res = await proxy('https://marketplace.financialmodelingprep.com/public/profile/' + ticker, 60 * 60 * 24 * 30).then((r) => r.json())
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

const useProfiles = (positions: Position[]) => {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  useEffect(() => {
    for (const position of positions) {
      fetchProfile(position.ticker).then((profile) => {
        setProfiles((profiles) => ({ ...profiles, [position.ticker]: profile }))
      })
    }
  }, [positions])
  return profiles
}

const usePrices = (positions: Position[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({})
  useEffect(() => {
    for (const position of positions) {
      getPrice(position.ticker).then((price) => {
        price = price || positions.find((p) => p.ticker === position.ticker)?.price || 0
        setPrices((prices) => ({ ...prices, [position.ticker]: price }))
      })
    }
  }, [positions])
  return prices
}

const useSectors = (positions: Position[], profiles: Record<string, Profile>, prices: Record<string, number>) => {
  return useMemo(() => {
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
}

const useIndustries = (positions: Position[], profiles: Record<string, Profile>, prices: Record<string, number>) => {
  return useMemo(() => {
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
}

const useCountries = (positions: Position[], profiles: Record<string, Profile>, prices: Record<string, number>) => {
  return useMemo(() => {
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
}

const useCategories = (positions: Position[], categories: Record<string, string>, prices: Record<string, number>) => {
  return useMemo(() => {
    const cats: Record<string, number> = {}
    for (const position of positions) {
      cats[categories[position.ticker] || 'other'] = (cats[categories[position.ticker] || 'other'] || 0) + position.units * (prices[position.ticker] || position.price)
    }
    return cats
  }, [positions, prices, categories])
}

const useCategory = (): [Record<string, string>, Dispatch<SetStateAction<Record<string, string>>>] => {
  const [category, setCategory] = useState<Record<string, string>>({})
  useEffect(() => {
    setCategory(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rebalance_category') || '{}') : {})
  }, [])
  const setNextCategory: Dispatch<SetStateAction<Record<string, string>>> = (value: SetStateAction<Record<string, string>>) => {
    const next = typeof value === 'function' ? value(category) : value
    setCategory(next)
    localStorage.setItem('rebalance_category', JSON.stringify(next))
  }
  return [category, setNextCategory]
}

const Rebalance = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [category, setCategory] = useCategory()
  const profiles = useProfiles(positions)
  const prices = usePrices(positions)
  const sectors = useSectors(positions, profiles, prices)
  const industries = useIndustries(positions, profiles, prices)
  const countries = useCountries(positions, profiles, prices)
  const categories = useCategories(positions, category, prices)
  const [balance, setBalance] = useState(1000)
  const actualCategoryAllocations = useMemo(() => {
    const total = Object.values(categories).reduce((acc, val) => acc + val, 0)
    const allocations: Record<string, number> = {}
    for (const category of Object.keys(categories)) {
      allocations[category] = Math.round((categories[category] / total) * 100)
    }
    return allocations
  }, [categories])
  const [allocations, setAllocations] = useState<Allocatable[]>([])

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
    if (Object.keys(actualCategoryAllocations).length === 0) {
      return
    }
    const allocations: Allocatable[] = []
    for (const category of Object.keys(categories)) {
      allocations.push({ id: category, value: actualCategoryAllocations[category], locked: false })
    }
    while (allocations.reduce((acc, x) => acc + x.value, 0) > 100) {
      for (let i = 0; i < allocations.length; i++) {
        if (allocations[i].value <= 0) {
          continue
        }
        allocations[i].value--
        break
      }
    }
    setAllocations(allocate(allocations, allocations[0]))
  }, [actualCategoryAllocations])

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
                  <PieChart data={categories} title="Categories" />
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
                    <input type="text" className="form-control form-control-sm" value={category[p.ticker] || 'other'} onChange={(e) => setCategory({ ...category, [p.ticker]: e.target.value })} />
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

          <div className="my-3">
            <input className="form-control" type="number" value={balance} onChange={(e) => setBalance(e.target.valueAsNumber)} />
          </div>

          <div className="row">
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  <div className="card-title text-center">Actual %</div>
                  <div className="card-text">
                    <PieChart data={actualCategoryAllocations} title="Actual" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  <div className="card-title text-center">Desired %</div>
                  <div className="card-text">
                    <PieChart data={allocations.reduce((acc, x) => Object.assign(acc, { [x.id]: x.value }), {})} title="Desired" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  <div className="card-title text-center">Allocate</div>
                  <div className="card-text">
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
                            <td>{id}</td>
                            <td>
                              <div style={{ backgroundColor: colors[idx], width: '20px' }}>&nbsp;</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td></td>
                          <td>
                            <button className="btn btn-outline-primary btn-sm" onClick={handleEqualize}>
                              Equalize
                            </button>
                          </td>
                          <td>
                            <div className="text-center text-secondary">
                              <small>{allocations.reduce((acc, x) => acc + x.value, 0)}</small>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-5">
            {allocations
              .filter(({ id, value }) => value !== actualCategoryAllocations[id])
              .filter(({ id, value }) => Math.abs(value - actualCategoryAllocations[id]) > 1)
              .map((a) => ({ ...a, diff: a.value - actualCategoryAllocations[a.id] }))
              .map((a) => ({ ...a, currentMarketValue: positions.reduce((acc, pos) => ((category[pos.ticker] || 'other') === a.id ? acc + pos.units * (prices[pos.ticker] || pos.price) : acc), 0) }))
              .map((a) => ({ ...a, nextMarketValue: a.currentMarketValue + (a.currentMarketValue * a.diff) / 100 }))
              .map((a) => ({
                ...a,
                positions: positions.filter((p) => (category[p.ticker] || 'other') === a.id).filter((p) => (prices[p.ticker] || p.price) <= Math.abs(a.nextMarketValue - a.currentMarketValue)),
              }))
              .map(({ id, value, diff, currentMarketValue, nextMarketValue, positions }, idx) => (
                <div>
                  <h3>
                    <span className="me-2" style={{ backgroundColor: colors[idx], width: '30px', height: '30px', display: 'inline-block', borderRadius: '50%' }}>
                      &nbsp;
                    </span>
                    {id}
                    {value > actualCategoryAllocations[id] && <span className="ms-2 text-success">+{diff}% &#x25B2;</span>}
                    {value < actualCategoryAllocations[id] && <span className="ms-2 text-danger">{diff}% &#x25BC;</span>}
                  </h3>
                  <p>
                    Allocation: {actualCategoryAllocations[id]}% &rarr; {value}%
                  </p>
                  <p>
                    Value: {currency(currentMarketValue)} &rarr; {currency(nextMarketValue)}
                    <span className="ms-2">
                      ({currentMarketValue > nextMarketValue && <span className="text-danger">Sell {currency(-1 * (nextMarketValue - currentMarketValue))}</span>}
                      {currentMarketValue < nextMarketValue && <span className="text-success">Buy {currency(nextMarketValue - currentMarketValue)}</span>})
                    </span>
                  </p>
                  {positions.length === 0 ? (
                    <p>Ничего не делаем, т.к. {currency(Math.abs(nextMarketValue - currentMarketValue))} меньше стоимости акций в этой категории, а мы не хотим покупать кусочки</p>
                  ) : (
                    <ul>
                      {positions
                        .map((p) => ({ ...p, price: prices[p.ticker] || p.price }))
                        .map((p) => (
                          <li>
                            {p.ticker} - {currency(p.price)} - {Math.floor(Math.abs(nextMarketValue - currentMarketValue) / positions.length / p.price)} шт.
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>

          <div>
            TODO: нужно понять что и как мы хотим посчитать, т.к. одно дело если у нас всего одна акция в категории и совсем другое если много. Так же, могут быть варианты как с QQQ и VT, особо не
            разгонишься. Плюс туда же - докупать равномерно, или то что дешевле, или по очереди.
          </div>
        </div>
      </div>
    </main>
  )
}

export default Rebalance

export const Head: HeadFC = () => <title>Rebalance</title>
