import { proxy } from './proxy'

export interface YahooChartRow {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Retrieve symbol price
 * @param period1
 * @param period2
 */
export async function queryChart(symbol: string, period1: Date, period2: Date): Promise<YahooChartRow[]> {
  try {
    var url = new URL('https://query1.finance.yahoo.com/v8/finance/chart/' + symbol)
    url.searchParams.set('interval', '1d')
    url.searchParams.set('period1', Math.floor(period1.getTime() / 1000).toString())
    url.searchParams.set('period2', Math.ceil(period2.getTime() / 1000).toString())
    var { chart } = await proxy(url, 3600).then((r) => r.json())
    var items = []
    for (var i = 0; i < chart.result[0].timestamp.length; i++) {
      items.push({
        date: new Date(chart.result[0].timestamp[i] * 1000),
        open: chart.result[0].indicators.quote[0].open[i],
        high: chart.result[0].indicators.quote[0].high[i],
        low: chart.result[0].indicators.quote[0].low[i],
        close: chart.result[0].indicators.quote[0].close[i],
        volume: chart.result[0].indicators.quote[0].volume[i],
      })
    }
    return items
  } catch (error) {
    console.warn(`unable retrieve ${symbol} symbol prices because of ${error instanceof Error ? error.message : error}`)
    return []
  }
}

export async function getPrice(symbol: string, date?: Date): Promise<number | null> {
  if (!date) {
    var prices = await queryChart(symbol, new Date(new Date().setDate(new Date().getDate() - 5)), new Date())
    if (!prices) {
      return null
    }
    return prices[prices.length - 1].close
  }

  var iso = date.toISOString().split('T').shift()
  var period1 = new Date(date.getTime() - 5 * 86400000)
  var period2 = new Date(date.getTime() + 5 * 86400000)
  var items = await queryChart(symbol, period1, period2)
  if (!items || !items.length) {
    return null
  }
  var min = Infinity
  var closest = null
  for (var item of items) {
    if (item.date.toISOString().split('T').shift() === iso) {
      return item.close
    }
    var diff = Math.abs(date.getTime() - item.date.getTime())
    if (diff <= min) {
      min = diff
      closest = item
    }
  }
  return closest?.close || null
}
