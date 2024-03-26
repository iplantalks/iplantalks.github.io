import * as React from 'react'
import apay from '../../../images/apay.svg'
import gpay from '../../../images/gpay.svg'

export const Method = ({ method }: { method: string }) => {
  switch (method) {
    case 'Google Pay':
      return <img title="Google Pay" alt="Google Pay" src={gpay} width="40" />
    case 'Apple Pay':
      return <img title="Apple Pay" alt="Apple Pay" src={apay} width="40" />
    default:
      return <span>{method}</span>
  }
}
