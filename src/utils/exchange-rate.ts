import { getDateShortString } from './formatters'
import { proxy } from './proxy'

export interface YahooChart {
  date: Date
  open: number
  hight: number
  low: number
  close: number
  volume: number
}

/**
 * Retrieve exchange rate at given date
 */
export async function getExchangeRate(date: Date): Promise<number> {
  const url = new URL('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=20200320&json')
  url.searchParams.set('date', getDateShortString(date))

  return await proxy(url, date ? 3600 : null)
    .then((r) => r.json())
    .then((r) => r[0].rate)
}

export async function getExhcangeRateHistory() {
  const items: YahooChart[] = []
  const url = new URL('https://query1.finance.yahoo.com/v8/finance/chart/UAH=X?period1=653691600&interval=1d')
  url.searchParams.set('period2', Math.floor(Date.now() / 1000).toString())
  const res = await proxy(url, 3600).then((res) => res.json())
  for (let i = 0; i < res.chart.result[0].timestamp.length; i++) {
    items.push({
      date: new Date(res.chart.result[0].timestamp[i] * 1000),
      open: res.chart.result[0].indicators.quote[0].open[i],
      hight: res.chart.result[0].indicators.quote[0].high[i],
      low: res.chart.result[0].indicators.quote[0].low[i],
      close: res.chart.result[0].indicators.quote[0].close[i],
      volume: res.chart.result[0].indicators.quote[0].volume[i],
    })
  }
  return items
}
