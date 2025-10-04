import * as React from 'react'
import visa from '../../../images/visa.svg'
import mastercard from '../../../images/mastercard.svg'
import { parseSheetsNumber, useGoogleSheet } from './_api'

export interface Bank {
  key: string
  /**
   * privat24, monobank
   */
  name: string
  /**
   * visa, mastercard
   */
  vendor: string
  /**
   * debit, credit
   */
  type: string
  /**
   * wise, revolut
   */
  paymentSystem: string
  /**
   * p2p, applepay, googlepay
   */
  method: string
  currency: string
  feepct: number
  limitmonth: number
  limitday: number
  limit: number
  date?: Date
  comment: string
}

export function useBanks() {
  return useGoogleSheet('Банки!A2:Z').map(
    (row, i): Bank => ({
      key: 'b' + i,
      name: row[0],
      vendor: row[1],
      type: row[2],
      paymentSystem: row[3],
      method: row[4],
      currency: row[5],
      feepct: parseSheetsNumber(row[6]) || 0,
      limitmonth: parseSheetsNumber(row[7]) || 0,
      limitday: parseSheetsNumber(row[8]) || 0,
      limit: parseSheetsNumber(row[9]) || 0,
      date: row[10] ? new Date(row[10].split('.').reverse().join('-')) : undefined,
      comment: row[11],
    })
  )
}

export const VendorLogo = ({ vendor }: { vendor: string }) => {
  switch (vendor) {
    case 'Visa':
      return <img className='inline-block' title="Visa" alt="Visa" src={visa} width="30" />
    case 'MasterCard':
      return <img className='inline-block' title="MasterCard" alt="MasterCard" src={mastercard} width="30" />
    default:
      return null
  }
}
