import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps, navigate } from 'gatsby'
import Join from '../../components/join'
import { useDeposits, useInfo, useOvdp, useSnapshot } from './_googlesheets'
import { ago } from '../../utils/ago'
import { currency } from '../../utils/formatters'
import { Header } from '../../components/header'
import { Checkboxes2 } from '../payment-systems/components/_checkboxes'
import { LineChart } from './_line_chart'
import { useAuth } from '../../context/auth'
import { Feedback } from './_feedback'
import { Bluetooth, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

const CollapsibleFilter = (props: React.PropsWithChildren<{ title: string }>) => {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <>
      <div className="mt-3">
        <div onClick={(e) => setCollapsed(!collapsed)} className="flex cursor-pointer items-center justify-between">
          <div>
            <b>{props.title}</b>
          </div>
          <div>
            {collapsed ? <ChevronRight /> : <ChevronDown />}
          </div>
        </div>
      </div>
      {!collapsed && <div className="mt-2">{props.children}</div>}
    </>
  )
}

const Ovdp: React.FC<PageProps> = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

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
      <div className="bg-neutral-100">
        <div className="m-0 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-20/100">
              <div className="bg-white rounded p-3">
                <div className="text-neutral-500">
                  <small>Налаштування</small>
                </div>
                <CollapsibleFilter title="Постачальник">
                  <div className="flex items-center justify-between">
                    <small className="text-neutral-500">Назва банку або брокеру</small>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                  <div className="flex items-center justify-between">
                    <small className="text-neutral-500">Кількість місяців</small>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                  <div className="flex gap-2 items-center">
                    <input type="checkbox" id="sale-checkbox" checked={saleCheckox} onChange={(e) => setSaleCheckbox(e.target.checked)} />
                    <label htmlFor="sale-checkbox">
                      дострокове погашення ⏰
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="checkbox" id="online-checkbox" checked={onlineCheckbox} onChange={(e) => setOnlineCheckbox(e.target.checked)} />
                    <label htmlFor="online-checkbox">
                      online відкриття <Bluetooth size={16} className='text-blue-500 inline-block' />
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="checkbox" id="dia-checkbox" checked={diaCheckbox} onChange={(e) => setDiaCheckbox(e.target.checked)} />
                    <label htmlFor="dia-checkbox">
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

                <div className="mt-3 flex flex-col gap-2">
                  {!currencyCheckboxes['UAH'] && <LineChart items={filtered} currency="UAH" />}
                  {!currencyCheckboxes['USD'] && <LineChart items={filtered} currency="USD" />}
                  {!currencyCheckboxes['EUR'] && <LineChart items={filtered} currency="EUR" />}
                </div>
              </div>
            </div>
            <div className="w-full md:w-80/100">
              <div>
                <table className="table-auto border-collapse w-full bg-white">
                  <thead className="bg-black text-white sticky top-0">
                    <tr>
                      <th className="p-2 font-normal text-sm text-left">Оновлено</th>
                      <th className="p-2 font-normal text-sm text-left"></th>
                      <th className="p-2 font-normal text-sm text-left"></th>
                      <th className="p-2 font-normal text-sm text-left">Постачальник</th>
                      <th className="p-2 font-normal text-sm text-left">Тип постачальника</th>
                      <th className="p-2 font-normal text-sm text-left">Тип інструменту</th>
                      <th className="p-2 font-normal text-sm text-left">Валюта</th>
                      <th className="p-2 font-normal text-sm text-left">
                        Погашення <span className="text-neutral-500">дата</span>
                      </th>
                      <th className="p-2 font-normal text-sm text-left"></th>
                      <th className="p-2 font-normal text-sm text-left">
                        Погашення <span className="text-neutral-500">місяців</span>
                      </th>
                      <th className="p-2 font-normal text-sm text-left">
                        Дохідність <span className="text-neutral-500">%</span>
                      </th>
                      <th className="p-2 font-normal text-sm text-left"></th>
                      <th className="p-2 font-normal text-sm text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .sort((a, b) => new Date(a.maturity ? a.maturity : new Date()).getTime() - new Date(b.maturity ? b.maturity : new Date()).getTime())
                      .map((item, idx, arr) => (
                        <tr key={idx} className={idx > 1 && item.months !== arr[idx - 1].months ? 'border-t-2 border-neutral-500' : 'border-t border-neutral-300'}>
                          <td className='p-2'>
                            <small className="text-neutral-500">{item.input_date ? ago(new Date(item.input_date)) : ''} тому</small>
                          </td>
                          <td className='p-2' valign="middle">
                            {item.info?.online && (
                              <span title="Можна відкрити рахунок online">
                                <Bluetooth size={16} className='text-blue-500' />
                              </span>
                            )}
                          </td>
                          <td className='p-2' valign="middle">
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
                          <td className='p-2'>
                            {item.provider_name}
                            {item.info?.comment && <span title={item.info?.comment}><MessageSquare size={14} className='ml-1 inline-block' /></span>}
                          </td>
                          <td className='p-2'>{item.provider_type}</td>
                          <td className='p-2' title={item.instrument_type === 'OVDP' ? item.isin : ''}>{item.instrument_type}</td>
                          <td className='p-2'>{item.currency}</td>
                          <td className='p-2'>{item.maturity ? item.maturity : ''}</td>
                          <td className='p-2'>{item.info?.sale && <span title="Дострокове погашення">⏰</span>}</td>
                          <td className='p-2'>{item.months ? item.months : ''}</td>
                          <td className={[item.months && item.yield === best_over_months[item.months] ? 'text-green-500 p-2' : 'p-2', item.yield === best ? 'font-bold' : ''].join(' ')}>
                            {currency(item.yield)}%{item.yield === best ? <span title={`Найкраща пропозиція`}>🥇</span> : ''}
                          </td>
                          <td className='p-2'>
                            <span
                              title={`Середня дохідність ${item.instrument_type} з погашенням через ${item.months} місяців за попередній період складає ${snapshot
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
                                <span className="text-green-500">&#x25B2;</span>
                              ) : (
                                <span className="text-red-500">&#x25BC;</span>
                              )}
                            </span>
                          </td>
                          <td className='p-2'>
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

      <div className="container mx-auto my-5 p-4">
        {!currencyCheckboxes['UAH'] && <LineChart items={filtered} currency="UAH" />}
        <div className="grid grid-cols-2 gap-4">
          <div>{!currencyCheckboxes['USD'] && <LineChart items={filtered} currency="USD" />}</div>
          <div>{!currencyCheckboxes['EUR'] && <LineChart items={filtered} currency="EUR" />}</div>
        </div>
      </div>


      <div className="bg-neutral-100">
        <div className="container mx-auto my-0 p-4">
          <h2 className='text-2xl font-bold mb-3'>Як це працює?</h2>
          <p className='mb-3'>ОВДП це як депозит, але з трохи більшою дохідністью.</p>
          <p className='mb-3'>ОВДП випускає та продає Міністерство Фінансів України.</p>
          <p className='mb-3'>Пересічний громадянин не може купити ОВДП у мінфін, вони продаються на так званих аукціьонах великими партіями.</p>
          <p className='mb-3'>Покупцями за звичай є банки та фонди.</p>
          <p className='mb-3'>Вони в свою чергу потім, перепродають їх нам, зі своєю націнкою, хтось трохи дорожче, хтось трохи дешевше.</p>
        </div>
      </div>

      <Feedback />
      <Join />
    </main>
  )
}

export default Ovdp

export const Head: HeadFC = () => <title>Інвестуємо в Україні</title>
