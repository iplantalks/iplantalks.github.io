import * as React from 'react'
import { useState, useMemo } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import '../../styles/common.css'
import { Shop } from '../../components/shop'
import Join from '../../components/join'
import { useDeposits, useOvdp } from './_googlesheets'
import { ago } from '../../utils/ago'
import { currency } from '../../utils/formatters'
import { Header } from '../../components/header'
import { Checkboxes2 } from '../payment-systems/components/_checkboxes'
import { LineChart } from './_line_chart'

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

const CollapsibleFilter = (props: React.PropsWithChildren<{ title: string }>) => {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <>
      <div className="mt-3">
        <div onClick={(e) => setCollapsed(!collapsed)} className="d-flex" style={{ cursor: 'pointer' }}>
          <div className="flex-grow-1">
            <b>{props.title}</b>
          </div>
          <div className="flex-shrink-0">
            <i className={collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'} />
          </div>
        </div>
      </div>
      {!collapsed && <div className="mt-2">{props.children}</div>}
    </>
  )
}

const Ovdp: React.FC<PageProps> = () => {
  const ovdp = useOvdp()
  const deposits = useDeposits()

  const rows = useMemo(() => {
    const rows = []
    for (const item of ovdp) {
      rows.push({
        input_date: item.input_date,
        provider_name: item.provider_name,
        provider_type: item.provider_type,
        instrument_type: item.instrument_type,
        isin: item.isin,
        currency: item.currency,
        maturity: item.maturity,
        months: item.months,
        yield: item.yield,
        comments: item.comments,
        year: item.year,
      })
    }
    for (const item of deposits) {
      rows.push({
        input_date: item.input_date,
        provider_name: item.provider_name,
        provider_type: item.provider_type,
        instrument_type: item.instrument_type,
        isin: '',
        currency: item.currency,
        maturity: item.maturity,
        months: item.months, // isNaN(parseInt(item.months)) ? null : parseInt(item.months),
        yield: item.yield,
        comments: item.comments,
        year: item.year,
      })
    }
    return rows.filter((r) => !!r.months)
  }, [ovdp, deposits])

  const [providerCheckboxes, setProviderCheckboxes] = useState<Record<string, boolean>>({})
  const [providerTypeCheckboxes, setProviderTypeCheckboxes] = useState<Record<string, boolean>>({})
  const [instrumentTypeCheckboxes, setInstrumentTypeCheckboxes] = useState<Record<string, boolean>>({})
  const [currencyCheckboxes, setCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [monthsCheckboxes, setMonthsCheckboxes] = useState<Record<number, boolean>>({})

  const filtered = useMemo(() => {
    return rows
      .filter((r) => !providerCheckboxes[r.provider_name])
      .filter((r) => !providerTypeCheckboxes[r.provider_type])
      .filter((r) => !instrumentTypeCheckboxes[r.instrument_type])
      .filter((r) => !currencyCheckboxes[r.currency])
      .filter((r) => r.months && !monthsCheckboxes[r.months])
  }, [rows, providerCheckboxes, providerTypeCheckboxes, instrumentTypeCheckboxes, currencyCheckboxes, monthsCheckboxes])

  const best_over_months = useMemo(() => {
    const best: Record<number, number> = {}
    for (const months of new Set(filtered.map((item) => item.months))) {
      if (!months) {
        continue
      }
      const max = Math.max(...filtered.filter((item) => item.months === months).map((item) => item.yield || 0))
      best[months] = max
    }
    return best
  }, [filtered])

  const best = useMemo(() => {
    return Math.max(...filtered.map((item) => item.yield || 0))
  }, [filtered])

  return (
    <main>
      {/* <Hero title="Інвестуємо в Україні" subtitle="ОВДП" /> */}
      <Header />
      <div className="bg-body-secondary">
        <div className="container-fluid py-5">
          <div className="row">
            <div className="col-12 col-md-3">
              <div className="text-bg-light rounded-3 my-2 py-2 px-3">
                <div className="text-secondary">
                  <small>Налаштування</small>
                </div>
                <CollapsibleFilter title="Постачальник">
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary d-flex-growth-1">Назва банку або брокеру</small>
                    <button
                      className="btn btn-primary btn-sm d-flex-shrink-0"
                      onClick={() =>
                        setProviderCheckboxes(getUniqueValues(rows, 'provider_name').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(providerCheckboxes).shift() }), {}))
                      }
                    >
                      усі
                    </button>
                  </div>
                  <Checkboxes2
                    names={getUniqueValues(rows, 'provider_name')}
                    checkboxes={providerCheckboxes}
                    onChange={(name: string) => setProviderCheckboxes({ ...providerCheckboxes, [name]: !providerCheckboxes[name] })}
                  />
                </CollapsibleFilter>
                <CollapsibleFilter title="Тип постачальника">
                  <Checkboxes2
                    names={getUniqueValues(rows, 'provider_type')}
                    checkboxes={providerTypeCheckboxes}
                    onChange={(name: string) => setProviderTypeCheckboxes({ ...providerTypeCheckboxes, [name]: !providerTypeCheckboxes[name] })}
                  />
                </CollapsibleFilter>
                <CollapsibleFilter title="Тип інструменту">
                  <Checkboxes2
                    names={getUniqueValues(rows, 'instrument_type')}
                    checkboxes={instrumentTypeCheckboxes}
                    onChange={(name: string) => setInstrumentTypeCheckboxes({ ...instrumentTypeCheckboxes, [name]: !instrumentTypeCheckboxes[name] })}
                  />
                </CollapsibleFilter>
                <CollapsibleFilter title="Валюта">
                  <Checkboxes2
                    names={getUniqueValues(rows, 'currency')}
                    checkboxes={currencyCheckboxes}
                    onChange={(name: string) => setCurrencyCheckboxes({ ...currencyCheckboxes, [name]: !currencyCheckboxes[name] })}
                  />
                </CollapsibleFilter>
                <CollapsibleFilter title="Період">
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary d-flex-growth-1">Кількість місяців</small>
                    <button
                      className="btn btn-primary btn-sm d-flex-shrink-0"
                      onClick={() =>
                        setMonthsCheckboxes(
                          getUniqueValues(rows, 'months')
                            .filter((v) => !!v)
                            .reduce((acc, name) => Object.assign(acc, { [name!.toString()]: !Object.values(monthsCheckboxes).shift() }), {})
                        )
                      }
                    >
                      усі
                    </button>
                  </div>
                  <Checkboxes2
                    names={
                      getUniqueValues(rows, 'months')
                        .filter((v) => !!v)
                        .sort((a, b) => (a || 0) - (b || 0))
                        .map((v) => v?.toString()) as string[]
                    }
                    checkboxes={monthsCheckboxes}
                    onChange={(name: string) => setMonthsCheckboxes({ ...monthsCheckboxes, [name]: !monthsCheckboxes[parseInt(name)] })}
                  />
                </CollapsibleFilter>

                <div className="mt-3">
                  {!currencyCheckboxes['UAH'] && <LineChart items={filtered} currency="UAH" />}
                  {!currencyCheckboxes['USD'] && <LineChart items={filtered} currency="USD" />}
                  {!currencyCheckboxes['EUR'] && <LineChart items={filtered} currency="EUR" />}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="text-bg-light mt-2">
                <table className="table table-hover text-center mb-0">
                  <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
                    <tr>
                      <th className="fw-normal small">Оновлено</th>
                      <th className="fw-normal small">Постачальник</th>
                      <th className="fw-normal small">Тип постачальника</th>
                      <th className="fw-normal small">Тип інструменту</th>
                      <th className="fw-normal small">Валюта</th>
                      <th className="fw-normal small">
                        Погашення <span className="text-secondary">дата</span>
                      </th>
                      <th className="fw-normal small">
                        Погашення <span className="text-secondary">місяців</span>
                      </th>
                      <th className="fw-normal small">
                        Дохідність <span className="text-secondary">%</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {filtered
                      .sort((a, b) => new Date(a.maturity ? a.maturity : new Date()).getTime() - new Date(b.maturity ? b.maturity : new Date()).getTime())
                      .map((item, idx, arr) => (
                        <tr key={idx} className={idx > 1 && item.months !== arr[idx - 1].months ? 'table-group-divider' : ''}>
                          <td>
                            <small className="text-secondary">{item.input_date ? ago(new Date(item.input_date)) : ''} тому</small>
                          </td>
                          <td>
                            {item.provider_name}
                            {item.comments ? <i className="fa-regular fa-comment ms-2" title={item.comments} /> : ''}
                          </td>
                          <td>{item.provider_type}</td>
                          <td title={item.instrument_type === 'OVDP' ? item.isin : ''}>{item.instrument_type}</td>
                          <td>{item.currency}</td>
                          <td>{item.maturity ? item.maturity : ''}</td>
                          <td>{item.months ? item.months : ''}</td>
                          <td className={[item.months && item.yield === best_over_months[item.months] ? 'text-success' : '', item.yield === best ? 'fw-bold' : ''].join(' ')}>
                            {currency(item.yield)}%{item.yield === best ? <span title={`Найкраща пропозиція`}>🥇</span> : ''}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container py-5">
        {!currencyCheckboxes['UAH'] && <LineChart items={filtered} currency="UAH" />}
        <div className="row">
          <div className="col-6">{!currencyCheckboxes['USD'] && <LineChart items={filtered} currency="USD" />}</div>
          <div className="col-6">{!currencyCheckboxes['EUR'] && <LineChart items={filtered} currency="EUR" />}</div>
        </div>
      </div>
      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Як це працює?</h2>
          <p>ОВДП це як депозит, але з трохи більшою дохідністью.</p>
          <p>ОВДП випускає та продає Міністерство Фінансів України.</p>
          <p>Пересічний громадянин не може купити ОВДП у мінфін, вони продаються на так званих аукціьонах великими партіями.</p>
          <p>Покупцями за звичай є банки та фонди.</p>
          <p>Вони в свою чергу потім, перепродають їх нам, зі своєю націнкою, хтось трохи дорожче, хтось трохи дешевше.</p>
        </div>
      </div>
      <Shop />
      <Join />
    </main>
  )
}

export default Ovdp

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
