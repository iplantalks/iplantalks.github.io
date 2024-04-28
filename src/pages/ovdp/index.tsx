import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import Hero from '../../components/hero'
import Subscribe from '../../components/subscribe'
import { Shop } from '../../components/shop'
import Join from '../../components/join'
import { maturity } from '../../utils/maturity'
import { useMof, useDnepr, useExim, usePrivat, useUniver, useMono } from './_googlesheets'

interface PartialMof {
  isin: string
  days: number | null
  currency: string
  placement: string | null
  ror: number
}

function historical(data: Array<PartialMof>, current: PartialMof) {
  const rors: number[] = []
  for (const item of data) {
    if (item.currency !== current.currency) {
      continue
    }
    if (!item.days || !current.days || Math.abs(item.days - current.days) >= 100) {
      continue
    }
    if (!item.placement || !current.placement || new Date(item.placement).getTime() >= new Date(current.placement).getTime()) {
      continue
    }
    rors.push(item.ror)
  }
  const avg = Math.round((rors.reduce((a, b) => a + b, 0) / rors.length) * 100) / 100
  return avg
}

const percentMaybe = (value: number | null | undefined) => (value ? value + '%' : '')

const Ovdp: React.FC<PageProps> = () => {
  const mof = useMof()
  const dnepr = useDnepr()
  const exim = useExim()
  const privat = usePrivat()
  const univer = useUniver()
  const mono = useMono()

  const data = useMemo(() => {
    const isins = Array.from(new Set([...dnepr, ...exim, ...privat, ...univer, ...mono].map(({ isin }) => isin)))
    const items = []
    for (const isin of isins) {
      const m = mof.find((x) => x.isin === isin)
      const expiration =
        m?.expiration ||
        dnepr.find((x) => x.isin === isin)?.maturity ||
        exim.find((x) => x.isin === isin)?.maturity ||
        privat.find((x) => x.isin === isin)?.dend ||
        univer.find((x) => x.isin === isin)?.maturity ||
        mono.find((x) => x.isin === isin)?.maturity

      items.push({
        history: m ? historical(mof, m) : null,
        year: expiration ? new Date(expiration).getFullYear() : null,
        maturity: expiration,
        isin: isin,
        mof: m?.ror,
        dnepr: dnepr.find((x) => x.isin === isin)?.buypct,
        exim: exim.find((x) => x.isin === isin)?.bid,
        privat: privat.find((x) => x.isin === isin)?.yield,
        univer: univer.find((x) => x.isin === isin)?.yield,
        mono: mono.find((x) => x.isin === isin)?.yield,
      })
    }
    return items.map((item) => ({
      ...item,
      max: Math.max(item.dnepr || 0, item.exim || 0, item.privat || 0, item.univer || 0, item.mono || 0),
      min: Math.min(item.dnepr || 999, item.exim || 999, item.privat || 999, item.univer || 999, item.mono || 999),
    }))
  }, [mof, dnepr, exim, privat, univer, mono])

  const best_over_year = useMemo(() => {
    const best: Record<number, number> = {}
    for (const item of data) {
      if (!item.year) {
        continue
      }
      const max = Math.max(item.dnepr || 0, item.exim || 0, item.privat || 0, item.univer || 0, item.mono || 0)
      if (!best[item.year] || max > best[item.year]) {
        best[item.year] = max
      }
    }
    return best
  }, [data])

  const [years, setYears] = useState(-1)

  return (
    <main>
      <Hero title="Інвестуємо в Україні" subtitle="ОВДП" />
      <div className="container py-5">
        <h2>ОВДП</h2>
        <table className="table table-hover text-center">
          <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>Погашення</th>
              <th>ISIN</th>
              <th>Мінфін</th>
              <th>Дніпро</th>
              <th>Ексім</th>
              <th>Приват</th>
              <th>Універ</th>
              <th>
                Моно
                <small title="Данні введені вручну" className="ms-2 fa-solid fa-thumbtack" />
              </th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {data
              .sort((a, b) => new Date(a.maturity ? a.maturity : new Date()).getTime() - new Date(b.maturity ? b.maturity : new Date()).getTime())
              .map((item, idx, arr) => (
                <tr key={item.isin} className={idx > 1 && item.year !== arr[idx - 1].year ? 'table-group-divider' : ''}>
                  <td>{item.maturity ? item.maturity : ''}</td>
                  <td>{item.isin}</td>
                  <td className={'' /*item.mof && item.history ? (item.mof < item.history ? 'text-danger' : 'text-success') : ''*/} style={{ borderRightWidth: '1px' }}>
                    <span style={{ width: '5em', display: 'inline-block', position: 'relative' }}>
                      {percentMaybe(item.mof)}
                      {item.mof && item.history && item.mof < item.history ? (
                        <i
                          title={'Середня історична дохідність ОВДП зі схожим сроком складала ' + (item.history || '') + '%'}
                          className="fa-solid fa-arrow-down text-danger"
                          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                        />
                      ) : null}
                      {item.mof && item.history && item.mof > item.history ? (
                        <i
                          title={'Середня історична дохідність ОВДП зі схожим сроком складала ' + (item.history || '') + '%'}
                          className="fa-solid fa-arrow-up text-success"
                          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                        />
                      ) : null}
                    </span>
                  </td>
                  <td
                    title={item.dnepr === item.max ? 'Найкраща пропозиція' : item.dnepr === item.min ? 'Найгірша пропозиція' : ''}
                    className={item.year && item.dnepr === best_over_year[item.year] ? 'fw-bold' : ''}
                  >
                    <span className={item.dnepr === item.max ? 'text-success' : ''}>{percentMaybe(item.dnepr)}</span>
                  </td>
                  <td
                    title={item.exim === item.max ? 'Найкраща пропозиція' : item.exim === item.min ? 'Найгірша пропозиція' : ''}
                    className={item.year && item.exim === best_over_year[item.year] ? 'fw-bold' : ''}
                  >
                    <span className={item.exim === item.max ? 'text-success' : ''}>{percentMaybe(item.exim)}</span>
                  </td>
                  <td
                    title={item.privat === item.max ? 'Найкраща пропозиція' : item.privat === item.min ? 'Найгірша пропозиція' : ''}
                    className={item.year && item.privat === best_over_year[item.year] ? 'fw-bold' : ''}
                  >
                    <span className={item.privat === item.max ? 'text-success' : ''}>{percentMaybe(item.privat)}</span>
                  </td>
                  <td
                    title={item.univer === item.max ? 'Найкраща пропозиція' : item.univer === item.min ? 'Найгірша пропозиція' : ''}
                    className={item.year && item.univer === best_over_year[item.year] ? 'fw-bold' : ''}
                  >
                    <span className={item.univer === item.max ? 'text-success' : ''}>{percentMaybe(item.univer)}</span>
                  </td>
                  <td
                    title={item.mono === item.max ? 'Найкраща пропозиція' : item.mono === item.min ? 'Найгірша пропозиція' : ''}
                    className={item.year && item.mono === best_over_year[item.year] ? 'fw-bold' : ''}
                  >
                    <span className={item.mono === item.max ? 'text-success' : ''}>{percentMaybe(item.mono)}</span>
                  </td>
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

export default Ovdp

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
