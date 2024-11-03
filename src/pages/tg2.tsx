import '../styles/common.css'
import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useRef } from 'react'

interface TelegramUser {
  id: number // 315833496
  username: string // "alexandrm85"
  first_name: string // "Alexandr"
  last_name: string // "Marchenko"
  auth_date: number // 1728808910
  hash: string // "2a49738a3f0b7a14149e1846b3c3c25c56e999ee21aff3fc93060452f7fd9bf7"
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
    telegram?: TelegramUser
  }
}

const Page: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || ref.current.children.length || typeof window === 'undefined') {
      return
    }
    window.onTelegramAuth = (user: TelegramUser) => {
      console.log('onTelegramAuth', user)
      window.telegram = user
      // fetch('https://europe-west3-iplantalks.cloudfunctions.net/tga', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(user) })
      //   .then((r) => r.json())
      //   .then(({ token }) => {
      //     // telegram(token)
      //     console.log('TGA', token)
      //   })
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'manymacbot')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-radius', '5')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')

    ref.current.appendChild(script)
  }, [])

  return (
    <main>
      <div className="container py-5">
        <h2>Demo</h2>
        <div ref={ref} />
      </div>
    </main>
  )
}

export default Page
export const Head: HeadFC = () => <title>Telegram Demo</title>
