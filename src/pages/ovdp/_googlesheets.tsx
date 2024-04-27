import { useState, useEffect } from 'react'

async function fetchGoogleSheetsValues(range: string): Promise<string[][]> {
  var url = new URL('https://gsr.iplan-talks.workers.dev')
  url.searchParams.set('sheet', '1aSt7wyLU9ytpMAQcPFtdKRQaE8gyM4GW9nLsD4l5dEY')
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

const rollup = (values: string[][]) => {
  const headers = values[0]
  const items: Array<Record<string, string>> = []
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const item: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j]
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

export function useMof() {
  return rollup(useGoogleSheet('mof!A:H')).map(({ isin, days, currency, placement, expiration, ror, payment, shares }) => ({
    isin: isin,
    days: days ? parseInt(days) : null,
    currency: currency,
    placement: fixDate(placement),
    expiration: fixDate(expiration),
    ror: extractNumber(ror),
    payment: extractNumber(payment),
    shares: extractNumber(shares),
  }))
}

export function useDnepr() {
  return rollup(useGoogleSheet('creditdnepr!A:F')).map(({ isin, maturity, buypct, sellpct, type, qty }) => ({
    isin: isin,
    maturity: fixDate(maturity),
    buypct: extractNumber(buypct),
    sellpct: extractNumber(sellpct),
    type: type,
    qty: parseInt(qty),
  }))
}

export function useExim() {
  return rollup(useGoogleSheet('eximb!A:E')).map(({ isin, currency, maturity, bid, ask }) => ({
    isin: isin,
    currency: currency,
    maturity: fixDate(maturity),
    bid: extractNumber(bid),
    ask: extractNumber(ask),
  }))
}

export function usePrivat() {
  return rollup(useGoogleSheet('privat!A:H')).map(({ date, isin, dend, askPrice, ccy, pricePerc, yield: yld, type }) => ({
    date: fixDate(date),
    isin: isin,
    dend: fixDate(dend),
    askPrice: parseFloat(askPrice),
    ccy: ccy,
    pricePerc: parseFloat(pricePerc),
    yield: parseFloat(yld),
    type: type,
  }))
}

export function useUniver() {
  return rollup(useGoogleSheet('univer!A:E')).map(({ isin, maturity, yield: yld, price, currency }) => ({
    isin: isin,
    maturity: fixDate(maturity),
    yield: parseFloat(yld),
    price: parseFloat(price),
    currency: currency,
  }))
}

export function useMono() {
  return rollup(useGoogleSheet('univer!A:E')).map(({ isin, maturity, yield: yld, currency, price }) => ({
    isin: isin,
    maturity: fixDate(maturity),
    yield: parseFloat(yld),
    currency: currency,
    price: parseFloat(price),
  }))
}
