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

  const [years, setYears] = useState(-1)

  return (
    <main>
      <Hero title="Інвестуємо в Україні" subtitle="ОВДП та депозити" />
      <div className="container py-5">
        <h2>ОВДП в гривні</h2>

        <table className="table">
          <thead className="table-secondary">
            <tr>
              <th>isin</th>
              <th>
                <select value={years} onChange={(e) => setYears(parseInt(e.target.value))}>
                  <option value={-1}>maturity</option>
                  <option value={0}>до року</option>
                  <option value={1}>один рік</option>
                  <option value={2}>два роки</option>
                  <option value={3}>три+ роки</option>
                </select>
              </th>
              <th>minfin</th>
              <th>icu</th>
              <th>privat</th>
              <th>mono</th>
              <th>univer</th>
              <th>bondua</th>
            </tr>
          </thead>
          <tbody>
            {values
              .filter(
                (row) =>
                  years === -1 ||
                  (years === 1 && maturity(new Date(row.maturity)) === '1 рік') ||
                  (years === 2 && maturity(new Date(row.maturity)) === '2 роки') ||
                  (years === 3 && maturity(new Date(row.maturity)).includes('рок') && !['1 рік', '2 роки'].includes(maturity(new Date(row.maturity)))) ||
                  (years === 0 && !maturity(new Date(row.maturity)).includes('рок') && !maturity(new Date(row.maturity)).includes('рік'))
              )
              .map((row, index) => (
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
      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Як це працює?</h2>
          <p>ОВДП це як депозит, але з трохи більшою дохідністью</p>
          <p>
            Колонка minfin показує з якою дохіднісью ОВДП продавалися на аукціоні. Тобто це максимальна дохідність яку можна було б очікувати, а також за цією колонкою можна оцінити скільки відсодків
            утримують провайдери.
          </p>
        </div>
      </div>
      <Shop />
      <Join />
    </main>
  )
}

export default Uah

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
