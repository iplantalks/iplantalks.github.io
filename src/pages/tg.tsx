import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useRef } from 'react'

const Page: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || ref.current.children.length) {
      return
    }
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'manymacbot')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-radius', '5')
    script.setAttribute('data-onauth', 'console.log(user)')
    script.setAttribute('data-request-access', 'write')

    ref.current.appendChild(script)
  }, [])

  return (
    <main>
      <div className="container py-5">
        <h2>Telegram Demo</h2>
        <div ref={ref} />
      </div>
    </main>
  )
}

export default Page
export const Head: HeadFC = () => <title>Telegram Demo</title>
