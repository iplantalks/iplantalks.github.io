import { parseSheetsNumber, useGoogleSheet } from './_api'

export interface PaymentSystem {
  key: string
  name: string
  method: string
  currency: string
  feepct: number
  limitmonth: number
  limitday: number
  limit: number
  date: string
  comment: string
}

export function usePaymentSystems() {
  return useGoogleSheet('Платіжки!A2:Z').map(
    (row, i): PaymentSystem => ({
      key: 'p' + i,
      name: row[0],
      method: row[1],
      currency: row[2],
      feepct: parseSheetsNumber(row[3]) || 0,
      limitmonth: parseSheetsNumber(row[4]) || 0,
      limitday: parseSheetsNumber(row[5]) || 0,
      limit: parseSheetsNumber(row[6]) || 0,
      date: row[7],
      comment: row[8],
    })
  )
}
