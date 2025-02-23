import * as React from 'react'
import { useEffect } from 'react'
import { useGoogleSheet } from './_api'

export const PaymentsFaq = () => {
  const items = useGoogleSheet('FAQ!A:B')
    .filter((item) => !!item[0] && !!item[1])
    .map((item) => ({
      question: item[0],
      answer: item[1],
    }))

  useEffect(() => {
    if (!items || !items.length || !window.location.hash || window.location.hash !== '#faq') {
      return
    }
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
  }, [items])

  return (
    <div>
      {/* <h2 className="mt-0 mb-3">Питання та відповіді</h2> */}
      {items.map((item, index) => (
        <details key={index}>
          <summary>{item.question}</summary>
          <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: item.answer }} />
        </details>
      ))}
    </div>
  )
}
