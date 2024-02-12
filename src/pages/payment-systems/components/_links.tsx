import * as React from 'react'
import { parseSheetsNumber, useGoogleSheet } from './_api'

export interface SheetLink {
  name: string
  website: string
  fees: string
  limits: string
}

export function useBankLinks() {
  return useGoogleSheet('BankLinks!A2:Z').map(
    (row): SheetLink => ({
      name: row[0],
      website: row[1],
      fees: row[2],
      limits: row[3],
    })
  )
}

export function usePaymentSystemLinks() {
  return useGoogleSheet('PaymentsLinks!A2:Z').map(
    (row): SheetLink => ({
      name: row[0],
      website: row[1],
      fees: row[2],
      limits: row[3],
    })
  )
}
