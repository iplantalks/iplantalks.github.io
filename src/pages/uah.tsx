import * as React from 'react'
import { useState, useEffect } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../styles/common.css'
import Hero from '../components/hero'
import Subscribe from '../components/subscribe'
import { Shop } from '../components/shop'
import Join from '../components/join'
import { maturity } from '../utils/maturity'

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  var url = new URL('https://gsr.iplan-talks.workers.dev')
  url.searchParams.set('sheet', '1h2hXH-lt7EuB4Ic1z8LBz2P5U2I6R9GdizlpyXQ7fKY')
  url.searchParams.set('range', range)
  url.searchParams.set('cache', '120')
  try {
    const res = await fetch(url)
    const text = await res.text()
    const values = JSON.parse(text)
    // console.groupCollapsed('values ' + range)
    // console.table(values)
    // console.groupEnd()
    return values
  } catch (error) {
    console.group(`Error fetching '${range}' from Google Sheets because of ${error instanceof Error ? error.message : error}`)
    console.error(error)
    console.groupEnd()
    return []
  }
}

function useGoogleSheet(range: string) {
  const [values, setValues] = useState<string[][]>([])
  useEffect(() => {
    fetchGoogleSheetsValues(range).then(setValues)
  }, [range])
  return values
}

const extractNumber = (value: string) => parseFloat(value.replaceAll('$', '').replaceAll('%', '').replace(/\s+/g, '').replaceAll(',', '.'))

const Uah: React.FC<PageProps> = () => {
  const values = useGoogleSheet("'ОВДП в гривні'!B4:I")
    .filter((row) => row.length > 1 && row[0].match(/^\d{2}\.\d{2}\.\d{4}$/g) && row[1].match(/^UA\d+$/g))
    .map((row) => ({
      maturity: row[0].split('.').reverse().join('-'),
      isin: row[1],
      minfin: extractNumber(row[2] || '0'),
      icu: extractNumber(row[3] || '0'),
      privat: extractNumber(row[4] || '0'),
      mono: extractNumber(row[5] || '0'),
      univer: extractNumber(row[6] || '0'),
      bondua: extractNumber(row[7] || '0'),
    }))
    .filter((row) => new Date(row.maturity).getTime() > Date.now())
  return (
    <main>
      <Hero title="Інвестуємо в Україні" subtitle="ОВДП та депозити" />
      <div className="container py-5">
        <h2>ОВДП в гривні</h2>
        <table className="table">
          <thead>
            <tr>
              <th>isin</th>
              <th>maturity</th>
              <th>minfin</th>
              <th>icu</th>
              <th>privat</th>
              <th>mono</th>
              <th>univer</th>
              <th>bondua</th>
            </tr>
          </thead>
          <tbody>
            {values.map((row, index) => (
              <tr key={index}>
                <td>{row.isin}</td>
                <td title={row.maturity}>{maturity(new Date(row.maturity))}</td>
                <td className="text-secondary">{row.minfin ? <span>{row.minfin}</span> : <span className="text-secondary">&mdash;</span>}</td>
                <td>{row.icu ? <span>{row.icu}</span> : <span className="text-secondary">&mdash;</span>}</td>
                <td>{row.privat ? <span>{row.privat}</span> : <span className="text-secondary">&mdash;</span>}</td>
                <td>{row.mono ? <span>{row.mono}</span> : <span className="text-secondary">&mdash;</span>}</td>
                <td>{row.univer ? <span>{row.univer}</span> : <span className="text-secondary">&mdash;</span>}</td>
                <td>{row.bondua ? <span>{row.bondua}</span> : <span className="text-secondary">&mdash;</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Subscribe />
      <Shop />
      <Join />
    </main>
  )
}

export default Uah

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
