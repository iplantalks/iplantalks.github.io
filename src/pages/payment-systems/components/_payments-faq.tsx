import * as React from 'react'
import { useGoogleSheet } from './_api'

export const PaymentsFaq = () => {
  const items = useGoogleSheet('FAQ!A:B')
    .filter((item) => !!item[0] && !!item[1])
    .map((item) => ({
      question: item[0],
      answer: item[1],
    }))

  return (
    <div>
      <h2 className="mt-0 mb-3">Питання та відповіді</h2>
      {items.map((item, index) => (
        <details key={index}>
          <summary>{item.question}</summary>
          <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: item.answer }} />
        </details>
      ))}
    </div>
  )
}
