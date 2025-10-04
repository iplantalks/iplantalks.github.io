import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Header } from '../../../components/header'
import { queryChart, YahooChartRow } from '../../../utils/yahoo'
import { round } from '../../../utils/formatters'
import { CandlestickSeries, createChart, createSeriesMarkers, HistogramSeries, SeriesMarker, SeriesMarkerPosition, SeriesMarkerShape, Time } from 'lightweight-charts'

function getWeekNumberWithinMonth(date: Date): number {
  // Get the date at the start of the month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)

  // Calculate the number of days between the start of the month and the given date
  const daysBetween = (date.getTime() - startOfMonth.getTime()) / 86400000 // 1 day = 86,400,000 milliseconds

  // Calculate the week number within the month
  const weekNumber = Math.floor(daysBetween / 7) + 1

  return weekNumber
}

function getWeekDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

function getMonthName(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[date.getMonth()]
}

function isLastMondayOfMonth(date: Date): boolean {
  var lastMondayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  while (lastMondayOfMonth.getDay() != 1) {
    lastMondayOfMonth.setDate(lastMondayOfMonth.getDate() - 1)
  }
  return date.getDate() == lastMondayOfMonth.getDate()
}

function isLastFirdayOfMonth(date: Date): boolean {
  var lastFridayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  while (lastFridayOfMonth.getDay() != 5) {
    lastFridayOfMonth.setDate(lastFridayOfMonth.getDate() - 1)
  }
  return date.getDate() == lastFridayOfMonth.getDate()
}

function price(data: { open: number } | Array<{ open: number }>) {
  var key = 'open' // open, close
  return Array.isArray(data) ? data[data.length - 1].open : data.open
}

interface IWithOpenPrice {
  open: number
}

const strategies: Record<string, Function> = {
  do_nothing: () => {
    return 0
  },
  asap: (data: { open: number }, cash: number): number => {
    return Math.floor(cash / price(data))
  },
  first_monday: (data: { open: number; mon1: boolean }[], cash: number): number => {
    return data[data.length - 1].mon1 ? Math.floor(cash / price(data)) : 0
  },
  last_friday: (data: { open: number; last_friday: boolean }[], cash: number): number => {
    return data[data.length - 1].last_friday ? Math.floor(cash / price(data)) : 0
  },
  // buy_once_and_hold: (data, cash: number) => {
  //     return data[data.length-1]['buy_once_and_hold_positions'] == 0
  //         ? Math.floor(cash / price(data))
  //         : 0
  // },
  everyday_buy_one: (data: { open: number }, cash: number): number => {
    return cash > price(data) ? 1 : 0
  },
  everyday_buy_p10: (data: { open: number }, cash: number): number => {
    return Math.floor(cash / 10 / price(data)) ? 1 : 0
  },
  every_monday_buy_one: (data: { open: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].weekday == 1 && cash > price(data) ? 1 : 0
  },
  every_monday_buy_p30: (data: { open: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].weekday == 1 && cash > price(data) ? Math.floor(cash / 3 / price(data)) : 0
  },
  every_friday_buy_p30: (data: { open: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].weekday == 5 && cash > price(data) ? Math.floor(cash / 3 / price(data)) : 0
  },
  middle_of_september: (data: { open: number; month: number; weeknum: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].month + 1 == 9 && data[data.length - 1].weeknum == 3 && data[data.length - 1].weekday == 1 ? Math.floor(cash / price(data)) : 0
  },
  rsi_20: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi < 20 ? Math.floor(cash / price(data)) : 0
  },
  rsi_30: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi < 30 ? Math.floor(cash / price(data)) : 0
  },
  rsi_50: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 50 ? Math.floor(cash / price(data)) : 0
  },
  rsi_60: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 60 ? Math.floor(cash / price(data)) : 0
  },
  rsi_70: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 70 ? Math.floor(cash / price(data)) : 0
  },
  rsi_80: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 80 ? Math.floor(cash / price(data)) : 0
  },
  rsi_90: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 90 ? Math.floor(cash / price(data)) : 0
  },
  rsi_70_monday: (data: { open: number; rsi: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].weekday == 1 && data[data.length - 1].rsi > 70 ? Math.floor(cash / price(data)) : 0
  },
  rsi_70_friday: (data: { open: number; rsi: number; weekday: number }[], cash: number): number => {
    return data[data.length - 1].weekday == 5 && data[data.length - 1].rsi > 70 ? Math.floor(cash / price(data)) : 0
  },
  rsi_70_first_week: (data: { open: number; rsi: number; weeknum: number }[], cash: number): number => {
    return data[data.length - 1].weeknum == 1 && data[data.length - 1].rsi > 70 ? Math.floor(cash / price(data)) : 0
  },
  rsi_70_p30: (data: { open: number; rsi: number }[], cash: number): number => {
    return data[data.length - 1].rsi > 70 ? Math.floor(cash / 3 / price(data)) : 0
  },
  down4: (data: { open: number; change: number }[], cash: number): number => {
    return data.length > 5 && data[data.length - 2].change < 0 && data[data.length - 3].change < 0 && data[data.length - 4].change < 0 && data[data.length - 5].change < 0
      ? Math.floor(cash / price(data))
      : 0
  },
  down3_2nd_up: (data: { open: number; change: number }[], cash: number): number => {
    return data.length > 6 &&
      data[data.length - 2].change > 0 &&
      data[data.length - 3].change > 0 &&
      data[data.length - 4].change < 0 &&
      data[data.length - 5].change < 0 &&
      data[data.length - 6].change < 0
      ? Math.floor(cash / price(data))
      : 0
  },
  down2_1st_up: (data: { open: number; change: number }[], cash: number): number => {
    return data.length > 4 && data[data.length - 2].change > 0 && data[data.length - 3].change < 0 && data[data.length - 4].change < 0 ? Math.floor(cash / price(data)) : 0
  },
  month_middle: (data: { open: number; weeknum: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].weeknum == 3 && data[data.length - 1].weeknum != data[data.length - 2].weeknum ? Math.floor(cash / price(data)) : 0
  },
  rsi_70_week_2_3: (data: { open: number; weeknum: number; rsi: number }[], cash: number): number => {
    return (data[data.length - 1].weeknum == 2 || data[data.length - 1].weeknum == 3) && data[data.length - 1].rsi > 70 ? Math.floor(cash / price(data)) : 0
  },
  sma20_crosses_sma50: (data: { open: number; sma20: number; sma50: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma20 > data[data.length - 1].sma50 && data[data.length - 2].sma20 < data[data.length - 2].sma50 ? Math.floor(cash / price(data)) : 0
  },
  sma20_crosses_sma200: (data: { open: number; sma20: number; sma200: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma20 > data[data.length - 1].sma200 && data[data.length - 2].sma20 < data[data.length - 2].sma200 ? Math.floor(cash / price(data)) : 0
  },
  sma20_crosses_price: (data: { open: number; sma20: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma20 > price(data) && data[data.length - 2].sma20 < price(data) ? Math.floor(cash / price(data)) : 0
  },
  sma50_crosses_sma20: (data: { open: number; sma20: number; sma50: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma50 > data[data.length - 1].sma20 && data[data.length - 2].sma50 < data[data.length - 2].sma20 ? Math.floor(cash / price(data)) : 0
  },
  sma50_crosses_sma200: (data: { open: number; sma50: number; sma200: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma50 > data[data.length - 1].sma200 && data[data.length - 2].sma50 < data[data.length - 2].sma200 ? Math.floor(cash / price(data)) : 0
  },
  sma50_crosses_price: (data: { open: number; sma50: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma50 > price(data) && data[data.length - 2].sma50 < price(data) ? Math.floor(cash / price(data)) : 0
  },
  sma200_crosses_sma20: (data: { open: number; sma20: number; sma200: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma200 > data[data.length - 1].sma20 && data[data.length - 2].sma200 < data[data.length - 2].sma20 ? Math.floor(cash / price(data)) : 0
  },
  sma200_crosses_sma50: (data: { open: number; sma50: number; sma200: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma200 > data[data.length - 1].sma50 && data[data.length - 2].sma200 < data[data.length - 2].sma50 ? Math.floor(cash / price(data)) : 0
  },
  sma200_crosses_price: (data: { open: number; sma200: number }[], cash: number): number => {
    return data.length > 1 && data[data.length - 1].sma200 > price(data) && data[data.length - 2].sma200 < price(data) ? Math.floor(cash / price(data)) : 0
  },
  sma20_pivot_down3_1st_up: (data: { open: number; sma20: number }[], cash: number): number => {
    return data.length > 1 &&
      data[data.length - 1].sma20 > data[data.length - 2].sma20 &&
      data[data.length - 2].sma20 < data[data.length - 3].sma20 &&
      data[data.length - 3].sma20 < data[data.length - 4].sma20
      ? Math.floor(cash / price(data))
      : 0
  },
  price_above_ema50: (data: { open: number; ema50: number }[], cash: number): number => {
    return price(data) > data[data.length - 1].ema50 ? Math.floor(cash / price(data)) : 0
  },
  price_above_sma50_sma200: (data: { open: number; sma50: number; sma200: number }[], cash: number): number => {
    return price(data) > data[data.length - 1].sma50 && price(data) > data[data.length - 1].sma200 ? Math.floor(cash / price(data)) : 0
  },
  price_below_sma50: (data: { open: number; sma50: number }[], cash: number): number => {
    return price(data) < data[data.length - 1].sma50 ? Math.floor(cash / price(data)) : 0
  },
  price_below_sma200: (data: { open: number; sma200: number }[], cash: number): number => {
    return price(data) < data[data.length - 1].sma200 ? Math.floor(cash / price(data)) : 0
  },
  price_below_sma50_down2_up2: (data: { open: number; change: number; sma50: number }[], cash: number): number => {
    return price(data) < data[data.length - 1].sma50 && data[data.length - 1].change < 0 && data[data.length - 2].change < 0 && data[data.length - 3].change > 0 && data[data.length - 4].change > 0
      ? Math.floor(cash / price(data))
      : 0
  },
  below_low20: (data: { open: number; low20: number }[], cash: number): number => {
    return data.length > 1 && price(data) < data[data.length - 2].low20 ? Math.floor(cash / price(data)) : 0
  },
  rsi_below_rsima14_1st_up: (data: { open: number; rsi: number; rsi_ma14: number }[], cash: number): number => {
    return data.length > 1 &&
      data[data.length - 1].rsi < data[data.length - 1].rsi_ma14 &&
      data[data.length - 2].rsi < data[data.length - 2].rsi_ma14 &&
      data[data.length - 1].rsi > data[data.length - 2].rsi
      ? Math.floor(cash / price(data))
      : 0
  },
  rsi_below_rsim14_pivot: (data: { open: number; rsi: number; rsi_ma14: number }[], cash: number): number => {
    // bgcolor(math.abs(rsi14[1]-rsi14ma[1]) > 10 and rsi14<rsi14ma and rsi14[1]<rsi14ma[1] and rsi14 > rsi14[1] ? color.new(color.green, 80) : na)
    return data.length > 1 &&
      Math.abs(data[data.length - 2].rsi - data[data.length - 2].rsi_ma14) > 10 &&
      data[data.length - 1].rsi < data[data.length - 1].rsi_ma14 &&
      data[data.length - 2].rsi < data[data.length - 2].rsi_ma14 &&
      data[data.length - 1].rsi > data[data.length - 2].rsi
      ? Math.floor(cash / price(data))
      : 0
  },
  first_monday_half: (data: { open: number; mon1: boolean; sma50: number }[], cash: number): number => {
    if (data[data.length - 1].mon1) {
      return Math.floor(cash / 2 / price(data))
    }
    if (price(data[data.length - 1]) < data[data.length - 1].sma50 && price(data[data.length - 2]) < data[data.length - 1].sma50) {
      return Math.floor(cash / price(data))
    }
    return 0
  },
  below_sma20_3rd_low20_half: (data: { open: number; sma50: number; low20: number }[], cash: number): number => {
    if (
      price(data[data.length - 1]) < data[data.length - 1].sma50 &&
      price(data[data.length - 2]) < data[data.length - 1].sma50 &&
      price(data[data.length - 1]) < data[data.length - 3].sma50 &&
      price(data[data.length - 1]) < data[data.length - 1].low20
    ) {
      return Math.floor(cash / 2 / price(data))
    }

    return 0
  },
  random: (data: { open: number }[], cash: number): number => {
    var money = Math.random() < 0.5 ? cash / 2 : cash
    return Math.random() > 0.5 ? Math.floor(money / price(data)) : 0
  },
  drawdown_10: (data: { open: number; drawdown: number }[], cash: number): number => {
    return data[data.length - 1].drawdown >= 0.1 ? Math.floor(cash / price(data)) : 0
  },
  drawdown_20: (data: { open: number; drawdown: number }[], cash: number): number => {
    return data[data.length - 1].drawdown >= 0.2 ? Math.floor(cash / price(data)) : 0
  },
}

const descriptions: Record<string, string> = {
  do_nothing: 'Нічого не робимо, просто накопичуємо готівку, лишили тут лише за для порівняння',
  asap: 'Купляти відразу як зʼявилися гроші або вистачає хоча б на одну акцію',
  first_monday: 'Те саме що й asap але купляємо першого понеділка місяця',
  last_friday: 'Те саме що й first_monday але купляємо останьої пʼятниці',
  everyday_buy_one: 'Купляємо що дня по одній акції поки є кошти',
  everyday_buy_p10: 'Купляємо що дня на 10% від коштів у наявності',
  every_monday_buy_one: 'Купляємо що понеділка по одній акції',
  every_monday_buy_p30: 'Купляємо що понеділка на 30%',
  middle_of_september: 'Чекаємо цілий рік до березня, коли, за звичай коливання, і вже тоді купляємо',
  rsi_20: 'Купоємо коли RSI < 20',
  rsi_30: 'Купоємо коли RSI < 30',
  rsi_50: 'Купоємо коли RSI > 50',
  rsi_60: 'Купоємо коли RSI > 60',
  rsi_70: 'Купоємо коли RSI > 70',
  rsi_80: 'Купоємо коли RSI > 80',
  rsi_90: 'Купоємо коли RSI > 90',
  rsi_70_monday: 'Купоємо по понеділках, якщо RSI > 70',
  rsi_70_friday: 'Купоємо по пʼятницях, якщо RSI > 70',
  rsi_70_first_week: 'Якщо перший тиждень місяця і RSI > 70 - купуємо',
  rsi_70_p30: 'Коли RSI > 70 купуємо на 30% від наявних коштів',
  down4: 'Коли четвертий день поспіль ціна падає - купуємо',
  down3_2nd_up: 'Коли три дня ціна падала, але останній день була позитивною',
  down2_1st_up: 'Вчора був перший позитивний день після двох негативних',
  month_middle: 'Купуємо в середині місяця',
  rsi_70_week_2_3: 'Купуємо в середині місяця але тільки якщо RSI > 70',
  sma20_crosses_sma50: 'Купуємо коли SMA20 перетинає SMA50',
  sma20_crosses_sma200: 'Купуємо коли SMA20 перетинає SMA200',
  sma20_crosses_price: 'Купуємо коли SMA20 перетинає ціну',
  sma50_crosses_sma20: 'Купуємо коли SMA50 перетинає SMA20',
  sma50_crosses_sma200: 'Купуємо коли SMA50 перетинає SMA200',
  sma50_crosses_price: 'Купуємо коли SMA50 перетинає ціну',
  sma200_crosses_sma20: 'Купуємо коли SMA200 перетинає SMA20',
  sma200_crosses_sma50: 'Купуємо коли SMA200 перетинає SMA50',
  sma200_crosses_price: 'Купуємо коли SMA200 перетинає ціну',
  sma20_pivot_down3_1st_up: 'Купуємо коли SMA20 перетинає ціну після трьох днів падіння',
  price_above_ema50: 'Купуємо коли ціна вище EMA50',
  price_above_sma50_sma200: 'Купуємо коли ціна вище SMA50 і SMA200',
  price_below_sma50: 'Купуємо коли ціна нижче SMA50',
  price_below_sma200: 'Купуємо коли ціна нижче SMA200',
  price_below_sma50_down2_up2: 'Купуємо коли ціна нижче SMA50 і останній день був червоний, але передостанній був зелений',
  below_low20: 'Купуємо коли ціна нижче найнижчої за останні 20 днів',
  rsi_below_rsima14_1st_up: 'Купуємо коли RSI нижче RSI MA14 і останній день був червоний, а передостанній був зелений',
  rsi_below_rsim14_pivot: 'Купуємо коли RSI нижче RSI MA14 і останній день був червоний, а передостанній був зелений і різниця більше 10',
  first_monday_half: 'Купуємо на 50% коли перший понеділок або коли ціна нижче SMA50',
  below_sma20_3rd_low20_half: 'Купуємо на 50% коли ціна нижче SMA20 вже третій день і нижче найнижчої за останні 20 днів',
  random: 'Купуємо випадкову кількість акцій',
  drawdown_10: 'Купуємо на просадці в 10%',
  drawdown_20: 'Купуємо на просадці в 20%',
}

function simulator(data: Record<string, string | number | boolean | Date | Array<unknown>>[], name: string, strategy: Function) {
  var cash = name + '_cash'
  var positions = name + '_positions'
  var spent = name + '_spent'
  var orders = name + '_orders'

  for (var i = 0; i < data.length; i++) {
    data[i][cash] = data[i - 1]?.[cash] || 0
    data[i][positions] = data[i - 1]?.[positions] || 0
    data[i][spent] = data[i - 1]?.[spent] || 0
    data[i][orders] = data[i - 1]?.[orders] || 0

    var isNextMonth = i == 0 || new Date(data[i].date as Date).getMonth() != new Date(data[i - 1]?.date as Date)?.getMonth()
    if (isNextMonth) {
      data[i][cash] = round((data[i - 1]?.[cash] as number) + 1000, 2)
      data[i]['deposit'] = true
    }

    var quantity = strategy(data.slice(0, i + 1), data[i][cash])
    if (quantity < 0) {
      throw new Error('quantity < 0')
    }
    var amount = quantity * price(data[i] as { open: number })
    if (amount > (data[i][cash] as number)) {
      throw new Error('not enough cash')
    }
    if (quantity > 0) {
      // console.log(data[i].date, 'buy', quantity)
      data[i][spent] = round(((data[i - 1]?.[spent] as number) || 0) + amount, 2)
      data[i][cash] = round((data[i][cash] as number) - amount, 2)
      data[i][positions] += quantity
      data[i][orders] = (data[i][orders] as number) + 1
      data[i][name + '_buy'] = true
    }

    data[i][name + '_value'] = (data[i][positions] as number) * (data[i].close as number)
    data[i][name + '_pl'] = (data[i][name + '_value'] as number) + (data[i][cash] as number) - (data[i][spent] as number)
    data[i][name + '_change'] = (data[i][name + '_pl'] as number) / (data[i][spent] as number)
  }

  var cash2 = data[data.length - 1][cash] as number
  var spent2 = data[data.length - 1][spent] as number
  var value2 = (data[data.length - 1][positions] as number) * price(data as { open: number }[])
  var pl = value2 + cash2 - (spent2 + cash2)
  var change = ((value2 + cash2 - (spent2 + cash2)) / (spent2 + cash2)) * 100
  return {
    name: name,
    positions: data[data.length - 1][positions] as number,
    orders: data[data.length - 1][orders] as number,
    cash: Math.round(cash2),
    spent: Math.round(spent2),
    value: Math.round(value2),
    pl: Math.round(pl),
    change: round(change, 2),
    // change: round((net - (spent+cash))/(spent+cash), 2),
  }
}

const Page = () => {
  // const { user } = useAuth()
  // useEffect(() => {
  //   if (user === null) {
  //     navigate('/login?redirect=' + window.location.pathname)
  //   }
  // }, [user])

  const pricesChart = useRef<HTMLDivElement>(null)
  const simulationChart = useRef<HTMLDivElement>(null)
  const [ticker, setTicker] = useState('AAPL')
  const [period1, setPeriod1] = useState('2020-01-01')
  const [prices, setPrices] = useState<YahooChartRow[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')

  // data = populate(items)
  // acme(items)

  useEffect(() => {
    if (!pricesChart.current || !prices || prices.length === 0) {
      return
    }

    const chart = createChart(pricesChart.current, {
      width: pricesChart.current.clientWidth,
      height: Math.floor(pricesChart.current.clientWidth / 3),
      // handleScale: false,
      // handleScroll: false,
      // rightPriceScale: {
      //   visible: true,
      // },
      // leftPriceScale: {
      //   visible: true,
      // },
    })

    const candles = chart.addSeries(CandlestickSeries)
    candles.setData(
      prices.map((item) => {
        return {
          time: item.date.toISOString().split('T').shift()!,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }
      })
    )
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })
    volume.setData(
      prices.map((item) => ({
        time: item.date.toISOString().split('T').shift()!,
        value: item.volume,
        color: item.open > item.close ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 150, 136, 0.3)',
      }))
    )
    volume.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    })

    // chart.timeScale().fitContent()
    return () => {
      chart.remove()
    }
  }, [prices])

  const metrics = useMemo(() => {
    if (!prices || prices.length === 0) {
      return []
    }
    const data = prices.map((item) => ({
      ...item,
      num: 0,
      change: 0,
      sma14: 0,
      sma20: 0,
      sma50: 0,
      sma200: 0,
      ema50: 0,
      low20: 0,
      year: 0,
      month: 0,
      monthname: '',
      weekday: 0,
      weekdayname: '',
      weeknum: 0,
      mon1: false,
      tue1: false,
      wed1: false,
      thu1: false,
      fri1: false,
      mon2: false,
      tue2: false,
      wed2: false,
      thu2: false,
      fri2: false,
      mon3: false,
      tue3: false,
      wed3: false,
      thu3: false,
      fri3: false,
      mon4: false,
      tue4: false,
      wed4: false,
      thu4: false,
      fri4: false,
      mon5: false,
      tue5: false,
      wed5: false,
      thu5: false,
      fri5: false,
      last_monday: false,
      last_friday: false,
      monthfirstday: false,
      gain: 0,
      loss: 0,
      rs: 0,
      rsi: 0,
      rsi_ma14: 0,
      tr: 0,
      atr: 0,
      peak: 0,
      drawdown: 0,
    }))

    for (var i = 0; i < data.length; i++) {
      data[i].num = i + 1
    }

    for (var i = 1; i < data.length; i++) {
      data[i].change = round((data[i].close - data[i - 1].close) / data[i - 1].close, 2)
    }

    for (var i = 14; i < data.length; i++) {
      data[i].sma14 = round(data.slice(i - 14, i).reduce((acc, item) => acc + item.close, 0) / 14, 2)
    }

    for (var i = 20; i < data.length; i++) {
      data[i].sma20 = round(data.slice(i - 20, i).reduce((acc, item) => acc + item.close, 0) / 20, 2)
    }

    for (var i = 50; i < data.length; i++) {
      data[i].sma50 = round(data.slice(i - 50, i).reduce((acc, item) => acc + item.close, 0) / 50, 2)
    }

    for (var i = 200; i < data.length; i++) {
      data[i].sma200 = round(data.slice(i - 200, i).reduce((acc, item) => acc + item.close, 0) / 200, 2)
    }

    var k = 2 / (50 + 1)
    data[50].ema50 = round(data.slice(0, 50).reduce((acc, item) => acc + item.close, 0) / 50, 2)
    for (var i = 51; i < data.length; i++) {
      data[i].ema50 = round((data[i].close - data[i - 1].ema50) * k + data[i - 1].ema50, 2)
    }

    for (var i = 20; i < data.length; i++) {
      data[i].low20 = round(
        data.slice(i - 20, i).reduce((acc, item) => Math.min(acc, item.low), Infinity),
        2
      )
    }

    for (var item of data) {
      item.year = new Date(item.date).getFullYear()
      item.month = new Date(item.date).getMonth()
      item.monthname = getMonthName(new Date(item.date))
      item.weekday = new Date(item.date).getDay()
      item.weekdayname = getWeekDayName(new Date(item.date))
      item.weeknum = getWeekNumberWithinMonth(new Date(item.date))

      // for (var i = 1; i <= 5; i++) {
      //   item['mon' + i] = item.weekday == 1 && item.weeknum == i
      //   item['tue' + i] = item.weekday == 2 && item.weeknum == i
      //   item['wed' + i] = item.weekday == 3 && item.weeknum == i
      //   item['thu' + i] = item.weekday == 4 && item.weeknum == i
      //   item['fri' + i] = item.weekday == 5 && item.weeknum == i
      // }
      item.mon1 = item.weekday == 1 && item.weeknum <= 2
      item.mon2 = item.weekday == 1 && item.weeknum <= 3
      item.mon3 = item.weekday == 1 && item.weeknum <= 4
      item.mon4 = item.weekday == 1 && item.weeknum <= 5
      item.mon5 = item.weekday == 1 && item.weeknum <= 6
      item.tue1 = item.weekday == 2 && item.weeknum <= 2
      item.tue2 = item.weekday == 2 && item.weeknum <= 3
      item.tue3 = item.weekday == 2 && item.weeknum <= 4
      item.tue4 = item.weekday == 2 && item.weeknum <= 5
      item.tue5 = item.weekday == 2 && item.weeknum <= 6

      item.wed1 = item.weekday == 3 && item.weeknum <= 2
      item.wed2 = item.weekday == 3 && item.weeknum <= 3
      item.wed3 = item.weekday == 3 && item.weeknum <= 4
      item.wed4 = item.weekday == 3 && item.weeknum <= 5
      item.wed5 = item.weekday == 3 && item.weeknum <= 6

      item.thu1 = item.weekday == 4 && item.weeknum <= 2
      item.thu2 = item.weekday == 4 && item.weeknum <= 3
      item.thu3 = item.weekday == 4 && item.weeknum <= 4
      item.thu4 = item.weekday == 4 && item.weeknum <= 5
      item.thu5 = item.weekday == 4 && item.weeknum <= 6

      item.fri1 = item.weekday == 5 && item.weeknum <= 2
      item.fri2 = item.weekday == 5 && item.weeknum <= 3
      item.fri3 = item.weekday == 5 && item.weeknum <= 4
      item.fri4 = item.weekday == 5 && item.weeknum <= 5
      item.fri5 = item.weekday == 5 && item.weeknum <= 6

      item.last_monday = isLastMondayOfMonth(new Date(item.date))
      item.last_friday = isLastFirdayOfMonth(new Date(item.date))
    }

    for (var i = 1; i < data.length; i++) {
      data[i].monthfirstday = !!(data[i].month != data[i - 1]?.month)
    }

    for (var i = 1; i < data.length; i++) {
      data[i].gain = data[i].change > 0 ? data[i].change : 0
      data[i].loss = data[i].change < 0 ? -1 * data[i].change : 0
    }
    for (var i = 14; i < data.length; i++) {
      var avggain = data.slice(i - 14, i).reduce((acc, item) => acc + item.gain, 0) / 14
      var avgloss = data.slice(i - 14, i).reduce((acc, item) => acc + item.loss, 0) / 14
      // data[i].rs = round(avggain / avgloss, 2) || undefined
      // data[i].rsi = avgloss == 0 ? 100 : round(100 - 100 / (1 + data[i].rs), 2) || undefined
      data[i].rs = round(avggain / avgloss, 2) || 0
      data[i].rsi = avgloss == 0 ? 100 : round(100 - 100 / (1 + data[i].rs), 2) || 0
    }
    for (var i = 28; i < data.length; i++) {
      data[i].rsi_ma14 = round(data.slice(i - 14, i).reduce((acc, item) => acc + item.rsi, 0) / 14, 2)
    }

    // ATR
    for (var i = 1; i < data.length; i++) {
      data[i].tr = round(Math.max(data[i].high - data[i].low, Math.abs(data[i].high - data[i - 1].close), Math.abs(data[i].low - data[i - 1].close)), 2)
    }
    for (var i = 14; i < data.length; i++) {
      data[i].atr = round(data.slice(i - 14, i).reduce((acc, item) => acc + item.tr, 0) / 14, 2)
    }

    // Drawdown
    for (var i = 1; i < data.length; i++) {
      data[i].peak = Math.max(data[i].close, data[i - 1].peak)
    }
    for (var i = 1; i < data.length; i++) {
      data[i].drawdown = (data[i].peak - data[i].close) / data[i].peak
    }

    return data
  }, [prices])

  const [results, setResults] = useState<{ name: string; positions: number; orders: number; cash: number; spent: number; value: number; pl: number; change: number }[]>([])
  const [data, setData] = useState<Array<Record<string, string | number | boolean | Date>>>([])
  useEffect(() => {
    if (!metrics || metrics.length === 0) {
      return
    }
    let data = [...metrics]
    const results: { name: string; positions: number; orders: number; cash: number; spent: number; value: number; pl: number; change: number }[] = []
    for (var strategy in strategies) {
      const result = simulator(data, strategy, strategies[strategy])
      results.push(result)
    }
    setResults(results)
    setData(data)
  }, [metrics])

  const simulationChanges = useMemo(() => {
    if (!results || results.length === 0) {
      return []
    }
    return results.map((result) => result.change).sort((a, b) => b - a)
  }, [results])

  const simulationChangeClassName = (change: number): string => {
    const classes = []
    if (change === simulationChanges[0]) {
      classes.push('fw-bold')
    }
    if (change === simulationChanges[simulationChanges.length - 1]) {
      classes.push('fw-bold')
    }
    if (change >= simulationChanges[4]) {
      classes.push('text-success')
    }
    if (change <= simulationChanges[simulationChanges.length - 5]) {
      classes.push('text-danger')
    }
    return classes.join(' ')
  }

  const topResults = useMemo(() => {
    if (!results || results.length === 0) {
      return []
    }
    return results.sort((a, b) => b.change - a.change).slice(0, 5)
  }, [results])

  useEffect(() => {
    if (!simulationChart.current || !data || !data.length || !selectedStrategy || !results || !results.length) {
      return
    }
    const chart = createChart(simulationChart.current, {
      width: simulationChart.current.clientWidth,
      height: Math.floor(simulationChart.current.clientWidth / 3),
    })
    const candles = chart.addSeries(CandlestickSeries)
    candles.setData(
      prices.map((item) => {
        return {
          time: item.date.toISOString().split('T').shift()!,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }
      })
    )
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })
    volume.setData(
      prices.map((item) => ({
        time: item.date.toISOString().split('T').shift()!,
        value: item.volume,
        color: item.open > item.close ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 150, 136, 0.3)',
      }))
    )
    volume.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    })
    var markers = []
    for (var i = 1; i < data.length; i++) {
      if (data[i]['deposit']) {
        markers.push({
          time: (data[i].date as Date).toISOString().split('T').shift()!,
          position: 'belowBar' as SeriesMarkerPosition,
          shape: 'arrowUp' as SeriesMarkerShape,
          color: 'blue',
          text: 'deposit',
          size: 2,
          price: data[i].low as number,
        })
      }
      if (data[i][selectedStrategy + '_buy']) {
        markers.push({
          time: (data[i].date as Date).toISOString().split('T').shift()! as Time,
          position: 'aboveBar' as SeriesMarkerPosition,
          shape: 'arrowDown' as SeriesMarkerShape,
          color: 'red',
          text: 'buy',
          size: 2,
          price: data[i].high as number,
        })
      }
    }
    createSeriesMarkers(candles, markers)
    // chart.timeScale().fitContent()
    return () => {
      chart.remove()
    }
  }, [data, results, selectedStrategy])

  const submit = () => {
    queryChart(ticker, new Date(period1), new Date(new Date().toISOString().split('T').shift()!)).then(setPrices)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    submit()
  }, [])

  return (
    <main>
      <Header />


      <div className="container mx-auto my-0 p-4">
        <h1 className='text-2xl font-bold mb-3'>Market Timing 💩 Backtest</h1>
        <p className="mb-3">Мабуть ви вже чули вислів що не є можливим пігадати таймінг для покупки акцій.</p>
        <p className="mb-3">Але чи так це на справді? Чому тоді все тримають якісь кошти на випадок просадки, щоб дозакупитися, або взагалі нічого не купляють і чекають її.</p>
        <p className="mb-3">Інші можуть розглядати усілякі показники накшатл SMA, RSI та інші.</p>
        <p className="mb-3">Дехто взагалі не париться і докуповує акції як зʼявляються кошти, а дехто, робить це раз в квартал чи рік.</p>
        <p className="mb-3">Власне, у мене була така думка - ось що року, у вересні відбуваються значні коливання, можливо варто взагалі цілий рік відкладати і тільки тоді закупатися 🤔</p>
        <p className="mb-3">
          Справа в тому що тут немає правильної чи не правильної відповіді і все залежить від: акції та періоду часу, тобто якщо мова йде про PEP vs TSLA то будуть мати сенс зовсім різні підходи, тому
          не варто намагатися знайти золоту середину на всі випадки
        </p>
        <p className="mb-3">
          Тож метою цього тула не є пошут найбіль вигідного способу докуповуватися, а лише намагання підсвітити наскільки такіх підходів може бути багато і як зміна акції чи періоду змінює результати.
        </p>

        <p className="mb-3">Перш за все нам потрібно обрати акцію та період за для симуляції</p>


        <div className="flex gap-4 items-center my-5">
          <div>
            <input type="text" className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" id="ticker" placeholder="ticker like AAPL" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
          </div>
          <div>
            <input type="date" className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" id="period1" placeholder="2020-01-01" value={period1} onChange={(e) => setPeriod1(e.target.valueAsDate!.toISOString().split('T').shift()!)} />
          </div>
          <div>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" onClick={submit}>
              submit
            </button>
          </div>
        </div>


      </div>


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок 1: Отримати історичні ціни</h2>
        <p className="mb-3">
          За для подальших розрахунків нам потрібні історичні ціни {ticker} з {period1} по сьогодні
        </p>
        <p className="mb-3">
          Дістати їх можно з Yahoo Finance ось{' '}
          <a className='text-blue-500' href={`https://finance.yahoo.com/quote/${ticker}/`} target="_blank">
            тут
          </a>
          , або в використовуючи ф-ію{' '}
          <code>
            =GOOGLEFINANCE("{ticker}", "all", "{period1}", "{new Date().toISOString().split('T').shift()}")
          </code>{' '}
          в Google Sheets
        </p>

        <div ref={pricesChart} className="my-5" />

        <details>
          <summary>Табличка історичних цін</summary>
          <table className="table-auto text-sm my-5">
            <thead>
              <tr>
                <th className="p-2 bg-neutral-300">year</th>
                <th className="p-2 bg-neutral-300">month</th>
                <th className="p-2 bg-neutral-300">week</th>
                <th className='p-2'>date</th>
                <th className='p-2'>open</th>
                <th className='p-2'>high</th>
                <th className='p-2'>low</th>
                <th className='p-2'>close</th>
                <th className='p-2'>volume</th>
              </tr>
            </thead>
            <tbody>
              {prices
                .map((price, idx) => ({
                  ...price,
                  year: price.date.getFullYear(),
                  month: price.date.toISOString().substring(0, 7),
                  week: getWeekNumberWithinMonth(price.date),
                }))
                .map((price, idx, arr) => ({
                  ...price,
                  nextWeek: idx > 0 && price.week !== arr[idx - 1].week,
                  nextMonth: idx > 0 && price.month !== arr[idx - 1].month,
                }))
                .map((price) => (
                  <tr
                    key={price.date.toISOString()}
                    style={{ borderTopWidth: price.nextMonth ? '4px' : price.nextWeek ? '2px' : '1px', borderTopColor: price.nextMonth || price.nextWeek ? 'black' : undefined }}
                  >
                    <td className="p-2 bg-neutral-200">{price.year}</td>
                    <td className="p-2 bg-neutral-200">{price.month}</td>
                    <td className="p-2 bg-neutral-200">{price.week}</td>
                    <td className='p-2'>{price.date.toISOString().split('T').shift()}</td>
                    <td className='p-2'>{round(price.open, 2)}</td>
                    <td className='p-2'>{round(price.high, 2)}</td>
                    <td className='p-2'>{round(price.low, 2)}</td>
                    <td className='p-2'>{round(price.close, 2)}</td>
                    <td className='p-2'>{price.volume}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      </div>


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок 2: Метрики</h2>
        <p className="mb-3">За для перевірки гіпотез, маємо розрахувати деякі метрики</p>
        <p className="mb-3">
          Metrics are calculated for each day using historic data and used in backtests. There are date related metrics to calulate is it first day of the month, is it monday etc and price related
          metrics like SMA, EMA, RSI, MACD, etc
        </p>
        <details className="mb-3">
          <summary>Табличка з розрахованими метриками</summary>
          <div className="overflow-x-auto my-5">
            <table className="table-auto text-sm">
              <thead>
                <tr>
                  <th className="p-2 bg-neutral-300">date</th>
                  <th className="p-2 bg-neutral-300">open</th>
                  <th className="p-2 bg-neutral-300">high</th>
                  <th className="p-2 bg-neutral-300">low</th>
                  <th className="p-2 bg-neutral-300">close</th>
                  <th className="p-2 bg-neutral-300">volume</th>
                  <th className="p-2">num</th>
                  <th className="p-2">change</th>
                  <th className="p-2">sma14</th>
                  <th className="p-2">sma20</th>
                  <th className="p-2">sma50</th>
                  <th className="p-2">sma200</th>
                  <th className="p-2">ema50</th>
                  <th className="p-2">low20</th>
                  <th className="p-2">year</th>
                  <th className="p-2">month</th>
                  <th className="p-2">monthname</th>
                  <th className="p-2">weekday</th>
                  <th className="p-2">weekdayname</th>
                  <th className="p-2">weeknum</th>
                  <th className="p-2">last_monday</th>
                  <th className="p-2">last_friday</th>
                  <th className="p-2">monthfirsthay</th>
                  <th className="p-2">rsi</th>
                  <th className="p-2">rsi_ma14</th>
                  <th className="p-2">atr</th>
                  <th className="p-2">peak</th>
                  <th className="p-2">drawdown</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((row, idx, arr) => (
                  <tr
                    key={row.num}
                    style={{
                      borderTopWidth: row.month !== (arr[idx - 1] || row).month ? '4px' : row.weeknum !== (arr[idx - 1] || row).weeknum ? '2px' : '1px',
                      borderTopColor: row.month !== (arr[idx - 1] || row).month || row.weeknum !== (arr[idx - 1] || row).weeknum ? 'black' : undefined,
                    }}
                  >
                    <td className="p-2 bg-neutral-200 text-nowrap">{row.date.toISOString().split('T').shift()}</td>
                    <td className="p-2 bg-neutral-200 text-nowrap">{round(row.open, 2)}</td>
                    <td className="p-2 bg-neutral-200 text-nowrap">{round(row.high, 2)}</td>
                    <td className="p-2 bg-neutral-200 text-nowrap">{round(row.low, 2)}</td>
                    <td className="p-2 bg-neutral-200 text-nowrap">{round(row.close, 2)}</td>
                    <td className="p-2 bg-neutral-200 text-nowrap">{row.volume}</td>
                    <td className="p-2 text-nowrap">{row.num}</td>
                    <td className="p-2 text-nowrap">{round(row.change, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.sma14, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.sma20, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.sma50, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.sma200, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.ema50, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.low20, 2)}</td>
                    <td className="p-2 text-nowrap">{row.year}</td>
                    <td className="p-2 text-nowrap">{row.month}</td>
                    <td className="p-2 text-nowrap">{row.monthname}</td>
                    <td className="p-2 text-nowrap">{row.weekday}</td>
                    <td className="p-2 text-nowrap">{row.weekdayname}</td>
                    <td className="p-2 text-nowrap">{row.weeknum}</td>
                    <td className="p-2 text-nowrap">{row.last_monday ? 'Y' : ''}</td>
                    <td className="p-2 text-nowrap">{row.last_friday ? 'Y' : ''}</td>
                    <td className="p-2 text-nowrap">{row.monthfirstday ? 'Y' : ''}</td>
                    <td className="p-2 text-nowrap">{round(row.rsi, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.rsi_ma14, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.atr, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.peak, 2)}</td>
                    <td className="p-2 text-nowrap">{round(row.drawdown, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="text-neutral-500">
          Примітка: метрик забагато, тож мабуть не має сенсу описувати кожну, адже це не є метою розрахунку, і завтра тут може зʼявитися ще 100500 метрик за для розрахунку якихось ідей, також тут є
          деякі розрахунки що не є метриками, накшталт факту чи є конретний день першим понеділком місяця - чому ні, це також може бути стратегією дозакупки
        </p>
      </div>


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок 3: Симуляція</h2>
        <p className="mb-3">Ми запускаеємо симуляцію від першого дня і по сьогодні, щомісяца, поповнюємо баланс на $1000, кожна стратегія, щодня, вирішує чи треба купувати чи ні.</p>
        <p className="text-neutral-500 mb-3">
          Примітка: $1000 тут не важливо, можно хоч $100 хоч $100500 це не змінить суті розрахунку, нам потрібная якась сумма якої вистачатиме на покупку хоча б одної акції, щоб було з чого рахувати
          симуляціі
        </p>
        <p className="mb-3">Ми купуємо по ціні open, це важливо, адже мало хто з нас купує акції о 22:59 коли ринок ось ось закриється, зазвичай покупаємо посеред дня</p>
        <p className="mb-3">Нижче наведена табличка результатів для кажної стратегії, якщо підвести курсор до її назви - буде показано опис, нас цікапить остання колонка з результатом - чим він більший тим краще.</p>
        <p className="mb-3">Також, можно подивитися графік та деталі кожної стратегії клікнувши на відповідне посилання</p>

        <details className="mb-3">
          <summary>Результати симуляцій усіх стратегій</summary>
          <table className="table-auto text-sm">
            <thead>
              <tr>
                <th className="p-2">name</th>
                <th className="p-2">positions</th>
                <th className="p-2">orders</th>
                <th className="p-2">cash</th>
                <th className="p-2">spent</th>
                <th className="p-2">value</th>
                <th className="p-2">pl</th>
                <th className="p-2">change</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr className='border-t border-neutral-200' key={result.name}>
                  <td className="p-2" title={descriptions[result.name]}>{result.name}</td>
                  <td className="p-2" title="Кількість акцій на прикінці симуляції">{result.positions}</td>
                  <td className="p-2" title="Кількість покупок">{result.orders}</td>
                  <td className="p-2" title="Залишок готівки на рахунку">{result.cash}</td>
                  <td className="p-2" title="Усього витрачено на шоппінг">{result.spent}</td>
                  <td className="p-2" title="Поточна вартість активів">{result.value}</td>
                  <td className="p-2" title="Прибуток (чи збиток) на прикінці єксперименту">{result.pl}</td>
                  <td className="p-2" title="Результат стратегії у відсотках, зеленим та червоним підсвічені пʼять найкращих та найгірших варіантів">
                    <span className={simulationChangeClassName(result.change || 0)}>{result.change}%</span>
                  </td>
                  <td className="p-2">
                    <a className='text-blue-500' href="javascript:void(0)" onClick={() => setSelectedStrategy(result.name)}>
                      показати
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок 4: Результати</h2>
        <p className="mb-3">
          Отже найкращими "стратегіями" для {ticker} на проміжку від {period1} і по сьогодні є:
        </p>
        <table className="table-auto text-sm my-5">
          <thead>
            <tr>
              <th className="p-2">name</th>
              <th className="p-2">positions</th>
              <th className="p-2">orders</th>
              <th className="p-2">cash</th>
              <th className="p-2">spent</th>
              <th className="p-2">value</th>
              <th className="p-2">pl</th>
              <th className="p-2">change</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {topResults.map((result) => (
              <tr className='border-t border-neutral-200' key={result.name}>
                <td className="p-2" title={descriptions[result.name]}>{result.name}</td>
                <td className="p-2" title="Кількість акцій на прикінці симуляції">{result.positions}</td>
                <td className="p-2" title="Кількість покупок">{result.orders}</td>
                <td className="p-2" title="Залишок готівки на рахунку">{result.cash}</td>
                <td className="p-2" title="Усього витрачено на шоппінг">{result.spent}</td>
                <td className="p-2" title="Поточна вартість активів">{result.value}</td>
                <td className="p-2" title="Прибуток (чи збиток) на прикінці єксперименту">{result.pl}</td>
                <td className="p-2" title="Результат стратегії у відсотках, зеленим та червоним підсвічені пʼять найкращих та найгірших варіантів">
                  <span className={simulationChangeClassName(result.change || 0)}>{result.change}%</span>
                </td>
                <td className="p-2">
                  <a className='text-blue-500' href="javascript:void(0)" onClick={() => setSelectedStrategy(result.name)}>
                    показати
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {topResults.find((result) => result.name === 'asap') && <p className="mb-3">Зауважте, що варіант "купляти відразу" є в топі</p>}
        {topResults.find((result) => result.name === 'random') && <p className="mb-3">Цікавий факт, варіант "random" є у топі</p>}
        <p className="mb-3">Клініть на посилання "показати" поряд з будь якою стратегію щоб переглянути графік та детальний звіт.</p>
      </div>


      {selectedStrategy && (
        <div className="container mx-auto my-0 p-4">
          <h2 className="text-2xl font-bold mb-3">{selectedStrategy}</h2>
          {descriptions[selectedStrategy] && <p className="mb-3">{descriptions[selectedStrategy]}</p>}
          <div ref={simulationChart} className="my-5" />
          <details>
            <summary>Табличка з подробицями</summary>
            <Demo name={selectedStrategy} data={data} columns={columns(selectedStrategy)} />
          </details>
        </div>
      )}


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок 5: Висновки</h2>
        <ol className="list-decimal list-inside ml-5 my-3">
          <li>Не варто розраховувати що одна й та сама стратегія буде однаково гарно працювати для PEP та TSLA</li>
          <li>Не варто розраховувати що ідеальна учора стратегія буде ідеальною завтра</li>
          <li>Ідеї накшатл - чекати просадки, або цілий рік - варто перевіряти розрахунками - це значно швидше ніж втрачати час</li>
          <li>Досить цікаво, що в більшості акцій які цікавлять мене - простий asap майже завжди входить в топ 5 стратегій</li>
          <li>
            В залежності від того які акції та періоди ви будете розглядати - може проскочити стратегія random - чим з одного боку вас звеселить, а з іншого - підкреслить що у усі ці розрахунки це
            добре, але вони нічого не гарантують
          </li>
          <li>З цікавого - усі оці складні стратегії можут працювати гірше ніж щось просто як first_monday</li>
          <li>Не забувайте - "найкращий час почати інвестувати - вчора" - тут щось схоже</li>
        </ol>
      </div>


      <div className="container mx-auto my-0 p-4">
        <h2 className="text-2xl font-bold mb-3">Крок N: А як щодо варіанту ...</h2>
        <p className="mb-3">Якщо в тебе є ідеї стратегій які вважаєш за потрібне дослідити - доєднуйся до iTalks і там хлопці допоможуть її свормулювати, перевірити, протестити і можливо добавити сюди</p>
      </div>


    </main>
  )
}

const columns = (name: string): string[] => {
  const cols = []

  if (name === 'first_monday') {
    cols.push('mon1')
  }

  if (name === 'last_friday') {
    cols.push('last_friday')
  }

  if (name === 'every_monday_buy_one') {
    cols.push('weekday')
    cols.push('weekdayname')
  }

  if (name === 'every_monday_buy_p30') {
    cols.push('weekday')
    cols.push('weekdayname')
  }

  if (name === 'every_friday_buy_p30') {
    cols.push('weekday')
    cols.push('weekdayname')
  }

  if (name === 'middle_of_september') {
    cols.push('month')
    cols.push('weeknum')
    cols.push('weekday')
  }

  if (['rsi_20', 'rsi_30', 'rsi_50', 'rsi_60', 'rsi_70', 'rsi_80', 'rsi_90'].includes(name)) {
    cols.push('rsi')
  }

  if (name === 'rsi_70_monday' || name === 'rsi_70_friday') {
    cols.push('weekday')
    cols.push('weekdayname')
    cols.push('rsi')
  }

  if (name === 'rsi_70_first_week') {
    cols.push('weeknum')
    cols.push('rsi')
  }

  if (name === 'rsi_70_p30') {
    cols.push('rsi')
  }

  if (name === 'down4' || name === 'down3_2nd_up' || name === 'down2_1st_up') {
    cols.push('change')
  }

  if (name === 'month_middle') {
    cols.push('weeknum')
  }

  if (name === 'rsi_70_week_2_3') {
    cols.push('weeknum')
    cols.push('rsi')
  }

  if (name === 'sma20_crosses_sma50') {
    cols.push('sma20')
    cols.push('sma50')
  }
  if (name === 'sma20_crosses_sma200') {
    cols.push('sma20')
    cols.push('sma200')
  }
  if (name === 'sma20_crosses_price') {
    cols.push('sma20')
  }
  if (name === 'sma50_crosses_sma20') {
    cols.push('sma20')
    cols.push('sma50')
  }
  if (name === 'sma50_crosses_sma200') {
    cols.push('sma50')
    cols.push('sma200')
  }
  if (name === 'sma50_crosses_price') {
    cols.push('sma50')
  }
  if (name === 'sma200_crosses_sma20') {
    cols.push('sma20')
    cols.push('sma200')
  }
  if (name === 'sma200_crosses_sma50') {
    cols.push('sma50')
    cols.push('sma200')
  }
  if (name === 'sma200_crosses_price') {
    cols.push('sma200')
  }
  if (name === 'sma20_pivot_down3_1st_up') {
    cols.push('sma20')
  }
  if (name === 'price_above_ema50') {
    cols.push('ema50')
  }
  if (name === 'price_above_sma50_sma200') {
    cols.push('sma50')
    cols.push('sma200')
  }
  if (name === 'price_below_sma50') {
    cols.push('sma50')
  }
  if (name === 'price_below_sma200') {
    cols.push('sma200')
  }
  if (name === 'price_below_sma50_down2_up2') {
    cols.push('change')
    cols.push('sma50')
  }
  if (name === 'below_low20') {
    cols.push('low20')
  }
  if (name === 'rsi_below_rsima14_1st_up') {
    cols.push('rsi')
    cols.push('rsi_ma14')
  }
  if (name === 'rsi_below_rsim14_pivot') {
    cols.push('rsi')
    cols.push('rsi_ma14')
  }
  if (name === 'first_monday_half') {
    cols.push('mon1')
    cols.push('sma50')
  }
  if (name === 'below_sma20_3rd_low20_half') {
    cols.push('sma20')
    cols.push('low20')
  }

  return cols
}

const Demo = ({ name, data, columns }: { name: string; data: Record<string, unknown>[]; columns: string[] }) => {
  const stringify = (value: unknown): string => {
    if (!value) {
      return ''
    }
    if (value instanceof Date) {
      return value.toISOString().split('T').shift()!
    }
    if (typeof value === 'number') {
      return round(value, 2).toString()
    }
    return value.toString()
  }
  return (
    <table className="table-auto text-sm my-5">
      <thead>
        <tr>
          <th className='p-2'>date</th>
          <th className='p-2'>open</th>
          <th className='p-2'>close</th>
          {columns.map((column) => (
            <th className='p-2' className="bg-neutral-200" key={column}>
              {column}
            </th>
          ))}
          <th className='p-2'>positions</th>
          <th className='p-2'>orders</th>
          <th className='p-2'>cash</th>
          <th className='p-2'>spent</th>
          <th className='p-2'>value</th>
          <th className='p-2'>pl</th>
          <th className='p-2'>change</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr className='border-t border-neutral-200' key={idx}>
            <td className="p-2">{(item.date as Date).toISOString().split('T').shift()}</td>
            <td className="p-2">{round(item.open as number, 2)}</td>
            <td className="p-2">{round(item.close as number, 2)}</td>
            {columns.map((column) => (
              <td className="p-2 bg-neutral-200" key={column}>
                {stringify(item[column])}
              </td>
            ))}
            <td className="p-2">{item[name + '_positions'] as number}</td>
            <td className="p-2">{item[name + '_orders'] as number}</td>
            <td className="p-2">{round(item[name + '_cash'] as number, 2)}</td>
            <td className="p-2">{round(item[name + '_spent'] as number, 2)}</td>
            <td className="p-2">{round(item[name + '_value'] as number, 2)}</td>
            <td className="p-2">{round(item[name + '_pl'] as number, 2)}</td>
            <td className="p-2">{round((item[name + '_change'] as number) * 100, 2)}</td>

            {/* positions	orders	cash	spent	value	pl	change */}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Page
export const Head: HeadFC = () => <title>Market Timing Backtest</title>
