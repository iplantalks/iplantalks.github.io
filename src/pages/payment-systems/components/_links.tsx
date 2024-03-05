import * as React from 'react'
import { parseSheetsNumber, useGoogleSheet } from './_api'

export interface SheetLink {
  name: string
  website: string
  fees: string
  limits: string
  comment: string
}

export function useBankLinks() {
  const links = useGoogleSheet('BankLinks!A2:Z')
    .map(
      (row): SheetLink => ({
        name: row[0] || '',
        website: row[1] || '',
        fees: row[2] || '',
        limits: row[3] || '',
        comment: row[4] || '',
      })
    )
    .filter((link) => !!link.name)
  console.log('useBankLinks', links)
  return links
}

export function usePaymentSystemLinks() {
  const links = useGoogleSheet('PaymentsLinks!A2:Z')
    .map(
      (row): SheetLink => ({
        name: row[0] || '',
        website: row[1] || '',
        fees: row[2] || '',
        limits: row[3] || '',
        comment: row[4] || '',
      })
    )
    .filter((link) => !!link.name)
  console.log('useBankLinks', links)
  return links
}
