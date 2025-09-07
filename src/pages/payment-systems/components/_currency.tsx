import * as React from 'react'

export const Currency = ({ currency }: { currency: string }) => {
  switch (currency) {
    case 'USD':
      return <span title="Долар США">$</span>
    case 'EUR':
      return <span title="Євро">&euro;</span>
    case 'GBP':
      return <span title="Фунт стерлінгів">&pound;</span>
    default:
      return <span title={currency}>{currency}</span>
  }
}
