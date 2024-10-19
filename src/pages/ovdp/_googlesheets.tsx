import { useState, useEffect } from 'react'

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  // var url = new URL('https://gsr.iplan-talks.workers.dev')
  // url.searchParams.set('sheet', '1aSt7wyLU9ytpMAQcPFtdKRQaE8gyM4GW9nLsD4l5dEY')
  // url.searchParams.set('range', range)
  // url.searchParams.set('cache', '120')
  var url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/gsr2')
  url.searchParams.set('sheet', '1aSt7wyLU9ytpMAQcPFtdKRQaE8gyM4GW9nLsD4l5dEY')
  url.searchParams.set('range', range)
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

const fixDate = (value: string): string | null => {
  if (!value) {
    return null
  }
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return value
  }
  if (value.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    return value.split('.').reverse().join('-')
  }
  return value
}

export function useDeposits() {
  if (typeof window === 'undefined') {
    return []
  }
  return rollup(useGoogleSheet('minfin!A:Z'))
    .map(({ updated, bank, currency, maturity, yield: yld }) => ({
      input_date: fixDate(updated),
      provider_name: bank,
      provider_type: 'Bank',
      instrument_type: 'DEPOSIT',
      isin: '',
      currency: currency,
      maturity: new Date(new Date().setMonth(new Date().getMonth() + parseInt(maturity))).toISOString().split('T').shift(),
      yield: parseFloat(yld),
      // months: parseInt(maturity_months),
      comments: '',
      year: new Date(maturity).getFullYear(),
      months: parseInt(maturity) || null,
    }))
    .filter(({ months }) => !!months && months > 0)
}

export function useOvdp() {
  if (typeof window === 'undefined') {
    return []
  }
  return rollup(useGoogleSheet('site!A:Z'))
    .map(({ input_date, provider_name, provider_type, instrument_type, isin, currency, maturity, yield: yld }) => ({
      input_date: fixDate(input_date),
      provider_name: provider_name,
      provider_type: provider_type,
      instrument_type: instrument_type,
      isin: isin,
      currency: currency,
      maturity: fixDate(maturity),
      yield: parseFloat(yld),
      // months: parseInt(maturity_months),
      comments: '',
      year: new Date(maturity).getFullYear(),
      months: maturity ? Math.round((new Date(maturity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) : null,
    }))
    .filter(({ months }) => months && months > 0)
}
