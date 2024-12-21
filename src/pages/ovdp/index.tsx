import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps, navigate } from 'gatsby'
import '../../styles/common.css'
import { Shop } from '../../components/shop'
import Join from '../../components/join'
import { useDeposits, useInfo, useOvdp, useSnapshot } from './_googlesheets'
import { ago } from '../../utils/ago'
import { currency } from '../../utils/formatters'
import { Header } from '../../components/header'
import { Checkboxes2 } from '../payment-systems/components/_checkboxes'
import { LineChart } from './_line_chart'
import { useAuth } from '../../context/auth'
import { Feedback } from './_feedback'

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
  const { user } = useAuth()
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])

  const ovdp = useOvdp()
  const deposits = useDeposits()
  const snapshot = useSnapshot()
  const info = useInfo()

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
        year: item.year,
        info: info.find((i) => i.provider === item.provider_name),
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
        year: item.year,
        info: info.find((i) => i.provider === item.provider_name),
      })
    }
    return rows.filter((r) => !!r.months)
  }, [ovdp, deposits])

  const [providerCheckboxes, setProviderCheckboxes] = useState<Record<string, boolean>>({})
  const [providerTypeCheckboxes, setProviderTypeCheckboxes] = useState<Record<string, boolean>>({})
  const [instrumentTypeCheckboxes, setInstrumentTypeCheckboxes] = useState<Record<string, boolean>>({})
  const [currencyCheckboxes, setCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [monthsCheckboxes, setMonthsCheckboxes] = useState<Record<number, boolean>>({})
  const [saleCheckox, setSaleCheckbox] = useState(false)
  const [diaCheckbox, setDiaCheckbox] = useState(false)
  const [onlineCheckbox, setOnlineCheckbox] = useState(false)

  const filtered = useMemo(() => {
    return rows
      .filter((r) => !providerCheckboxes[r.provider_name])
      .filter((r) => !providerTypeCheckboxes[r.provider_type])
      .filter((r) => !instrumentTypeCheckboxes[r.instrument_type])
      .filter((r) => !currencyCheckboxes[r.currency])
      .filter((r) => r.months && !monthsCheckboxes[r.months])
      .filter((r) => !saleCheckox || r.info?.sale)
      .filter((r) => !diaCheckbox || r.info?.dia)
      .filter((r) => !onlineCheckbox || r.info?.online)
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
                    names={getUniqueValues(rows, 'provider_name').sort((a, b) => a.localeCompare(b))}
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

                <div className="mt-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="sale-checkbox" checked={saleCheckox} onChange={(e) => setSaleCheckbox(e.target.checked)} />
                    <label className="form-check-label" htmlFor="sale-checkbox">
                      дострокове погашення ⏰
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="online-checkbox" checked={onlineCheckbox} onChange={(e) => setOnlineCheckbox(e.target.checked)} />
                    <label className="form-check-label" htmlFor="online-checkbox">
                      online відкриття <i className="text-primary fa-brands fa-bluetooth"></i>
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="dia-checkbox" checked={diaCheckbox} onChange={(e) => setDiaCheckbox(e.target.checked)} />
                    <label className="form-check-label" htmlFor="dia-checkbox">
                      Дія
                      <img
                        width="16"
                        height="16"
                        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik00OCA5NkMyMS4xMiA5NiAxMy44ODMxIDk0LjY0MTIgNy42MjA5MiA4OC4zNzkxQzEuMzI5MjMgODIuMDcyNiAwIDc0Ljg4IDAgNDhDMCAyMS4xMiAxLjM1ODc3IDEzLjkyNzQgNy42MjA5MiA3LjYyMDkyQzEzLjg4MzEgMS4zNTg3NyAyMS4xMiAwIDQ4IDBDNzQuODggMCA4Mi4xMTY5IDEuMzU4NzcgODguMzc5MSA3LjYyMDkyQzk0LjY3MDggMTMuOTI3NCA5NiAyMS4xMiA5NiA0OEM5NiA3NC44OCA5NC42NzA4IDgyLjA3MjYgODguMzc5MSA4OC4zNzkxQzgyLjExNjkgOTQuNjQxMiA3NC44OCA5NiA0OCA5NloiIGZpbGw9ImJsYWNrIiAvPgogICAgPHBhdGggZD0iTTY2LjgzMDggNDcuOTU1NkM2NC45OTk0IDQ3Ljk1NTYgNjMuODAzMSA0Ni43NDQ1IDYzLjgwMzEgNDQuOTU3NEM2My44MDMxIDQzLjE5OTkgNjUuMDE0MiA0Mi4wMDM2IDY2LjgzMDggNDIuMDAzNkg3MS42MTZWNDcuOTU1Nkg2Ni44MzA4Wk03NS42MTg1IDM4LjU0NzZINjYuMzU4MkM2Mi40Mjk2IDM4LjU0NzYgNTkuNzQxNiA0MS4xMTc0IDU5Ljc0MTYgNDQuODA5N0M1OS43NDE2IDQ3LjczNCA2MS40MTA1IDQ5Ljk0OTQgNjQuMDU0MiA1MC43MTc0TDU5LjAwMzEgNTguNDEyMkg2My40NzgyTDY4LjAyNzEgNTEuNDExNkg3MS42MDEzVjU4LjQxMjJINzUuNjE4NVYzOC41NDc2Wk0yNS41MjEzIDQzLjc2MTFWMzcuNzY0OEgzMy4zMDQ3VjU0Ljc2NDJIMjMuNTQyMkMyNC41OTA4IDUyLjkzMjggMjUuNTIxMyA0OC42OTQgMjUuNTIxMyA0My43NjExWk0zNy40MjUzIDMzLjkyNDhIMjEuNTQ4NFY0My45MjM2QzIxLjU0ODQgNDkuMDE5IDIwLjY0NzQgNTIuOTkxOSAxOS40NTExIDU0Ljc3OUgxNy41NDU5VjYzLjg0NzNIMjEuNDc0NVY1OC40ODZIMzYuMzMyNFY2My44NDczSDQwLjI2MVY1NC43NzlIMzcuNDI1M1YzMy45MjQ4Wk00OS40MDMxIDU1LjA0NDhMNDkuMDQ4NyA1NC44MDg1TDUzLjY4NjIgMzguNTQ3Nkg0NC4zMDc3TDQzLjMwMzQgNDIuMTY2TDQ4Ljc1MzMgNDIuMTIxN0w0NS4yMDg3IDU0LjUyNzlDNDQuNTg4NCA1Ni43ODc2IDQ2LjEwOTYgNTguODg0OCA0OC41OTA4IDU4Ljg4NDhDNDkuMzczNiA1OC44ODQ4IDUwLjE0MTYgNTguNjkyOCA1MC45OTgyIDU4LjE0NjRMNTcuMzc4NSA1My44MzM3TDU1LjQyOSA1MC45NTM3TDQ5LjQwMzEgNTUuMDQ0OFpNNTIuMTIwNyAzNC44MTFDNTQuMDk5NyAzNC44MTEgNTQuOTI2OCAzNC4wNzI1IDU0LjkyNjggMzIuMzE1QzU0LjkyNjggMzAuNDgzNiA1NC4wNzAyIDI5Ljc0NTEgNTIuMTIwNyAyOS43NDUxQzUwLjE3MTEgMjkuNzQ1MSA0OS4zMTQ1IDMwLjQ4MzYgNDkuMzE0NSAzMi4zMTVDNDkuMzI5MyAzNC4wNzI1IDUwLjE0MTYgMzQuODExIDUyLjEyMDcgMzQuODExWiIgZmlsbD0id2hpdGUiIC8+Cjwvc3ZnPg=="
                        alt="Дія"
                        title="Наявність інтеграції з Дія"
                        style={{ display: 'inline-block' }}
                        className="ms-1"
                      />
                    </label>
                  </div>
                </div>

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
                      <th className="fw-normal small"></th>
                      <th className="fw-normal small"></th>
                      <th className="fw-normal small">Постачальник</th>
                      <th className="fw-normal small">Тип постачальника</th>
                      <th className="fw-normal small">Тип інструменту</th>
                      <th className="fw-normal small">Валюта</th>
                      <th className="fw-normal small">
                        Погашення <span className="text-secondary">дата</span>
                      </th>
                      <th className="fw-normal small"></th>
                      <th className="fw-normal small">
                        Погашення <span className="text-secondary">місяців</span>
                      </th>
                      <th className="fw-normal small">
                        Дохідність <span className="text-secondary">%</span>
                      </th>
                      <th className="fw-normal small"></th>
                      <th className="fw-normal small"></th>
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
                          <td valign="middle">
                            {item.info?.online && (
                              <span title="Можна відкрити рахунок online">
                                <i className="text-primary fa-brands fa-bluetooth"></i>
                              </span>
                            )}
                          </td>
                          <td valign="middle">
                            {item.info?.dia && (
                              <img
                                width="16"
                                height="16"
                                src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik00OCA5NkMyMS4xMiA5NiAxMy44ODMxIDk0LjY0MTIgNy42MjA5MiA4OC4zNzkxQzEuMzI5MjMgODIuMDcyNiAwIDc0Ljg4IDAgNDhDMCAyMS4xMiAxLjM1ODc3IDEzLjkyNzQgNy42MjA5MiA3LjYyMDkyQzEzLjg4MzEgMS4zNTg3NyAyMS4xMiAwIDQ4IDBDNzQuODggMCA4Mi4xMTY5IDEuMzU4NzcgODguMzc5MSA3LjYyMDkyQzk0LjY3MDggMTMuOTI3NCA5NiAyMS4xMiA5NiA0OEM5NiA3NC44OCA5NC42NzA4IDgyLjA3MjYgODguMzc5MSA4OC4zNzkxQzgyLjExNjkgOTQuNjQxMiA3NC44OCA5NiA0OCA5NloiIGZpbGw9ImJsYWNrIiAvPgogICAgPHBhdGggZD0iTTY2LjgzMDggNDcuOTU1NkM2NC45OTk0IDQ3Ljk1NTYgNjMuODAzMSA0Ni43NDQ1IDYzLjgwMzEgNDQuOTU3NEM2My44MDMxIDQzLjE5OTkgNjUuMDE0MiA0Mi4wMDM2IDY2LjgzMDggNDIuMDAzNkg3MS42MTZWNDcuOTU1Nkg2Ni44MzA4Wk03NS42MTg1IDM4LjU0NzZINjYuMzU4MkM2Mi40Mjk2IDM4LjU0NzYgNTkuNzQxNiA0MS4xMTc0IDU5Ljc0MTYgNDQuODA5N0M1OS43NDE2IDQ3LjczNCA2MS40MTA1IDQ5Ljk0OTQgNjQuMDU0MiA1MC43MTc0TDU5LjAwMzEgNTguNDEyMkg2My40NzgyTDY4LjAyNzEgNTEuNDExNkg3MS42MDEzVjU4LjQxMjJINzUuNjE4NVYzOC41NDc2Wk0yNS41MjEzIDQzLjc2MTFWMzcuNzY0OEgzMy4zMDQ3VjU0Ljc2NDJIMjMuNTQyMkMyNC41OTA4IDUyLjkzMjggMjUuNTIxMyA0OC42OTQgMjUuNTIxMyA0My43NjExWk0zNy40MjUzIDMzLjkyNDhIMjEuNTQ4NFY0My45MjM2QzIxLjU0ODQgNDkuMDE5IDIwLjY0NzQgNTIuOTkxOSAxOS40NTExIDU0Ljc3OUgxNy41NDU5VjYzLjg0NzNIMjEuNDc0NVY1OC40ODZIMzYuMzMyNFY2My44NDczSDQwLjI2MVY1NC43NzlIMzcuNDI1M1YzMy45MjQ4Wk00OS40MDMxIDU1LjA0NDhMNDkuMDQ4NyA1NC44MDg1TDUzLjY4NjIgMzguNTQ3Nkg0NC4zMDc3TDQzLjMwMzQgNDIuMTY2TDQ4Ljc1MzMgNDIuMTIxN0w0NS4yMDg3IDU0LjUyNzlDNDQuNTg4NCA1Ni43ODc2IDQ2LjEwOTYgNTguODg0OCA0OC41OTA4IDU4Ljg4NDhDNDkuMzczNiA1OC44ODQ4IDUwLjE0MTYgNTguNjkyOCA1MC45OTgyIDU4LjE0NjRMNTcuMzc4NSA1My44MzM3TDU1LjQyOSA1MC45NTM3TDQ5LjQwMzEgNTUuMDQ0OFpNNTIuMTIwNyAzNC44MTFDNTQuMDk5NyAzNC44MTEgNTQuOTI2OCAzNC4wNzI1IDU0LjkyNjggMzIuMzE1QzU0LjkyNjggMzAuNDgzNiA1NC4wNzAyIDI5Ljc0NTEgNTIuMTIwNyAyOS43NDUxQzUwLjE3MTEgMjkuNzQ1MSA0OS4zMTQ1IDMwLjQ4MzYgNDkuMzE0NSAzMi4zMTVDNDkuMzI5MyAzNC4wNzI1IDUwLjE0MTYgMzQuODExIDUyLjEyMDcgMzQuODExWiIgZmlsbD0id2hpdGUiIC8+Cjwvc3ZnPg=="
                                alt="Дія"
                                title="Наявність інтеграції з Дія"
                                style={{ display: 'block' }}
                              />
                            )}
                          </td>
                          <td>
                            {item.provider_name}
                            {item.info?.comment ? <i className="fa-regular fa-comment ms-2" title={item.info?.comment} /> : ''}
                          </td>
                          <td>{item.provider_type}</td>
                          <td title={item.instrument_type === 'OVDP' ? item.isin : ''}>{item.instrument_type}</td>
                          <td>{item.currency}</td>
                          <td>{item.maturity ? item.maturity : ''}</td>
                          <td>{item.info?.sale && <span title="Дострокове погашення">⏰</span>}</td>
                          <td>{item.months ? item.months : ''}</td>
                          <td className={[item.months && item.yield === best_over_months[item.months] ? 'text-success' : '', item.yield === best ? 'fw-bold' : ''].join(' ')}>
                            {currency(item.yield)}%{item.yield === best ? <span title={`Найкраща пропозиція`}>🥇</span> : ''}
                          </td>
                          <td>
                            <span
                              title={`Середня дохідність ${item.instrument_type} з погашенням через ${item.months} місяців за попередній період складає ${
                                snapshot
                                  .filter((s) => s.kind === item.instrument_type && s.currency === item.currency && s.months === item.months)
                                  .sort((a, b) => b.month.localeCompare(a.month))
                                  .shift()?.ror || 0
                              }%`}
                            >
                              {item.yield >
                              (snapshot
                                .filter((s) => s.kind === item.instrument_type && s.currency === item.currency && s.months === item.months)
                                .sort((a, b) => b.month.localeCompare(a.month))
                                .shift()?.ror || 0) ? (
                                <span className="text-success">&#x25B2;</span>
                              ) : (
                                <span className="text-danger">&#x25BC;</span>
                              )}
                            </span>
                          </td>
                          <td>
                            {item.info?.fee && (
                              <small title={item.info?.fee}>
                                <i className="text-primary fa-solid fa-circle-info" />
                              </small>
                            )}
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
      <Feedback />
      <Shop />
      <Join />
    </main>
  )
}

export default Ovdp

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
