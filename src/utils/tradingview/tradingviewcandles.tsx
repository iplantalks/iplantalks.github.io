import { useState, useEffect } from 'react'

/**
 * TradingView API
 * @param ticker AAPL
 * @param interval 1D
 * @param limit 300
 * @param cache false
 * @returns [[timestamp, open, high, low, close, volume], ...]
 */
export function tradingviewcandles(ticker: string, interval = '1D', limit = 300, cache = false): Promise<Array<Array<number>>> {
  const key = 'tradingviewcandles-' + ticker + '-' + interval + '-' + limit
  if (cache) {
    const value = sessionStorage.getItem(key)
    if (value) {
      return Promise.resolve(JSON.parse(value))
    }
  }
  return new Promise((resolve) => {
    const socket = new WebSocket('wss://widgetdata.tradingview.com/socket.io/websocket')
    const send = (str: string) => socket.send('~m~' + str.length + '~m~' + str)
    let connected = false
    socket.onmessage = (event) => {
      if (!connected) {
        const cs = 'cs_' + crypto.randomUUID().replaceAll('-', '').substring(0, 12)
        // console.log(event.data)
        send('{"m":"set_auth_token","p":["widget_user_token"]}')
        send('{"m":"chart_create_session","p":["' + cs + '","disable_statistics"]}')
        send('{"m":"resolve_symbol","p":["' + cs + '","sds_sym_1","' + ticker + '"]}')
        send('{"m":"create_series","p":["' + cs + '","sds_1","s1","sds_sym_1","' + interval + '",' + limit + ',"LASTSESSION"]}')
        connected = true
      }

      event.data.split(/~m~\d+~m~/gi).forEach((m: string) => {
        if (m && m.includes('timescale_update')) {
          const json = JSON.parse(m) as { p: Array<{ sds_1: { s: Array<{ v: Array<number> }> } }> }
          const data = json.p[1].sds_1.s.map(({ v }) => v)
          // O: 207.37 H: 220.20 L: 206.90 C: 213.07 V: 198.134M
          // const data = arr.map(([date, open, high, low, close, volume]) => ({ date: new Date(date * 1000).toISOString().split('T').shift(), open, high, low, close, volume }))
          // console.table(data)
          socket.close()
          sessionStorage.setItem(key, JSON.stringify(data))
          resolve(data)
        } else {
          // console.log(m)
        }
      })
    }
  })
}

export function useTradingView(ticker: string, interval = '1D', limit = 300, cache = false) {
  const [data, setData] = useState<Array<Array<number>>>([])
  useEffect(() => {
    tradingviewcandles(ticker, interval, limit, cache).then(setData)
  }, [])
  return data
}
