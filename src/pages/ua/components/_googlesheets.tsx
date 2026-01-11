import { useState, useEffect } from 'react'

// https://docs.google.com/spreadsheets/d/11wqvnOJHo8J7NVZHr1cur4uuZTUoVb22lFOml6hUb-A
// give access to: serviceaccount@iplantalks.iam.gserviceaccount.com

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  var url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/gsr2')
  url.searchParams.set('sheet', '11wqvnOJHo8J7NVZHr1cur4uuZTUoVb22lFOml6hUb-A')
  url.searchParams.set('range', range)
  try {
    return await fetch(url).then(r => r.json())
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

const rollup = (values: string[][]) => {
  const headers = values[0]
  const items: Array<Record<string, string>> = []
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const item: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j]
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '')
      item[key] = row[j]
    }
    items.push(item)
  }
  return items
}

const extractNumber = (value: string) => parseFloat(value.replaceAll('$', '').replaceAll('%', '').replace(/\s+/g, '').replaceAll(',', '.'))

function useYearValueSheet(range: string) {
  const data = useGoogleSheet(range)
  // Return empty array during SSR or when data hasn't loaded yet
  if (typeof window === 'undefined' || data.length === 0) {
    return []
  }
  return rollup(data)
    .map(({ year, value }) => ({
      year: Number(year),
      value: extractNumber(value)
    }))
    .filter(({ year, value }) => year !== null && year !== undefined && !isNaN(year) && value !== null && value !== undefined && !isNaN(value))
}

export function useInflation() {
  return useYearValueSheet('inflation!A:B')
}

export function useExchangeRate() {
  const data = useYearValueSheet('exchange_rate!A:B')

  return data
    .map(({ year, value }) => {
      const prev = data.find((x) => x.year === year - 1)?.value || 1
      const change = ((value - prev) / prev) * 100
      return { year, value: change }
    })
    .slice(1)
}

export function useDepositUAH() {
  return useYearValueSheet('deposit_uah!A:B')
}

export function useDepositUSD() {
  const deposit_usd_orig = useYearValueSheet('deposit_usd!A:B')
  const cash_usd = useExchangeRate()
  return deposit_usd_orig.map(({ year, value }) => {
    const er = cash_usd.find((x) => x.year === year)?.value || 0
    const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
    return { year, value: val }
  })
}

export function useOvdpUah() {
  return useYearValueSheet('ovdp_uah!A:B')
}

export function useOvdpUsd() {
  const ovdp_usd_orig = useYearValueSheet('ovdp_usd!A:B')
  const cash_usd = useExchangeRate()
  return ovdp_usd_orig.map(({ year, value }) => {
    const er = cash_usd.find((x) => x.year === year)?.value || 0
    const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
    return { year, value: val }
  })
}

export function useSpy() {
  const spy_orig = useYearValueSheet('spy!A:B')
  const cash_usd = useExchangeRate()
  return spy_orig.map(({ year, value }) => {
    const er = cash_usd.find((x) => x.year === year)?.value || 0
    const val = ((1 + value / 100) * (1 + er / 100) - 1) * 100 // тут должна быть формула ((1 + deposit_usd) * (1 + cash_usd) - 1)
    return { year, value: val }
  })
}

export function useInsurance() {
  return useYearValueSheet('insurance!A:B')
}

export function useNPF() {
  return useYearValueSheet('npf!A:B')
}
