import { useGoogleSheet } from './_api'

export interface YouTube {
  paymentSystem: string
  register: string
  transfer: string
}

export interface Links {
  name: string
  webiste: string
  fees: string
  limits: string
}

export function useYouTubeLinks() {
  return useGoogleSheet('YouTube!A2:Z').map(
    (row, i): YouTube => ({
      paymentSystem: row[0],
      register: row[1],
      transfer: row[2],
    })
  )
}

function useLinks(range: string) {
  return useGoogleSheet(range).map(
    (row): Links => ({
      name: row[0],
      webiste: row[1],
      fees: row[2],
      limits: row[3],
    })
  )
}

export function useBankLinks() {
  return useLinks('BankLinks!A2:Z')
}

export function usePaymentSystemLinks() {
  return useLinks('PaymentsLinks!A2:Z')
}
