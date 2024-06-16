import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useState } from 'react'
import { proxy } from '../utils/proxy'

interface SearchResultItem {
  symbol: string
  name: string
  type: string
}

const Categories = () => {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [profile, setProfile] = useState<Record<string, any> | null>(null)
  const doSearch = async (e: Event) => {
    e.preventDefault()
    setProfile(null)
    const res = await proxy('https://marketplace.financialmodelingprep.com/public/search?query=' + search).then((r) => r.json())
    const items = []
    for (const [_, values] of Object.entries(res)) {
      for (const item of values as SearchResultItem[]) {
        items.push(item)
      }
    }
    console.table(items)
    setSearchResults(items)
  }
  const doLoad = async (symbol: string) => {
    setProfile(null)
    const res = await fetch('https://marketplace.financialmodelingprep.com/public/profile/' + symbol).then((r) => r.json())
    const profile = Array.isArray(res) ? res[0] : res
    setProfile(profile)
    console.log(profile)
  }

  const skip = ['changes', 'companyName', 'description', 'exchange', 'website', 'ceo', 'fullTimeEmployees', 'phone', 'address', 'city', 'state', 'zip', 'image', 'defaultImage']

  return (
    <main>
      <div className="container py-5">
        <h1>Categories</h1>
        <form className="border p-2 my-3" onSubmit={(e) => doSearch(e as unknown as Event)}>
          <input type="search" placeholder="AAPL" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="button" value="Search" onClick={(e) => doSearch(e as unknown as Event)} disabled={!search.length} />
        </form>
        <table>
          <tr>
            <td style={{ verticalAlign: 'top', width: '50%' }}>
              {searchResults.length > 0 && (
                <table className="table border">
                  <thead>
                    <tr>
                      <th>symbol</th>
                      <th>name</th>
                      <th>type</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item) => (
                      <tr key={item.symbol}>
                        <td>{item.symbol}</td>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>
                          <button onClick={() => doLoad(item.symbol)}>load</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </td>
            <td className="ps-5" style={{ verticalAlign: 'top', width: '50%' }}>
              {profile && (
                <table className="table border">
                  <tbody>
                    {Object.entries(profile)
                      .filter(([k, v]) => !skip.includes(k))
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{typeof value === 'boolean' ? (value ? 'true' : 'false') : value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </td>
          </tr>
        </table>
      </div>
    </main>
  )
}

export default Categories

export const Head: HeadFC = () => <title>Categories</title>
