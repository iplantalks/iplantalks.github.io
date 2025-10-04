import * as React from 'react'
import { parseSheetsNumber, useGoogleSheet } from './_api'

export interface SheetLink {
  name: string
  remote: string
  website: string
  fees: string
  limits: string
  comment: string
}

export function useBankLinks() {
  if (typeof window === 'undefined') { return [] }
  const links = useGoogleSheet('BankLinks!A2:Z')
    .map(
      (row): SheetLink => ({
        name: row[0] || '',
        remote: row[1] || '',
        website: row[2] || '',
        fees: row[3] || '',
        limits: row[4] || '',
        comment: row[5] || '',
      })
    )
    .filter((link) => !!link.name)
  console.log('useBankLinks', links)
  return links
}

export function usePaymentSystemLinks() {
  if (typeof window === 'undefined') { return [] }
  const links = useGoogleSheet('PaymentsLinks!A2:Z')
    .map(
      (row): SheetLink => ({
        name: row[0] || '',
        remote: row[1] || '',
        website: row[2] || '',
        fees: row[3] || '',
        limits: row[4] || '',
        comment: row[5] || '',
      })
    )
    .filter((link) => !!link.name)
  console.log('useBankLinks', links)
  return links
}
