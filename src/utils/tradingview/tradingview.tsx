import { useState, useEffect } from 'react'

export interface TradingViewDataItem {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function tradingviewcandles(ticker: string, interval = '1D', limit = 300, ttl = 0): Promise<TradingViewDataItem[]> {
  const url = new URL('https://tradingview.italks.com.ua/data')
  url.searchParams.set('ticker', ticker)
  url.searchParams.set('interval', interval)
  url.searchParams.set('limit', limit.toString())
  url.searchParams.set('ttl', ttl.toString())

  return fetch(url).then((r) => r.json())
}

export function useTradingView(ticker: string, interval = '1D', limit = 300, ttl = 0) {
  const [data, setData] = useState<TradingViewDataItem[]>([])
  useEffect(() => {
    tradingviewcandles(ticker, interval, limit, ttl).then(setData)
  }, [])
  return data
}
