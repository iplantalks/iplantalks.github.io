import '../styles/common.css'
import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

interface TelegramUser {
  id: number // 315833496
  username: string // "alexandrm85"
  first_name: string // "Alexandr"
  last_name: string // "Marchenko"
  auth_date: number // 1728808910
  hash: string // "2a49738a3f0b7a14149e1846b3c3c25c56e999ee21aff3fc93060452f7fd9bf7"
  status?: string // "creator"
}

declare global {
  interface Window {
    telegramCallback: (user: TelegramUser) => void
  }
}

const initState = (): TelegramUser | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const stored = localStorage.getItem('tg')
  if (!stored) {
    return null
  }
  try {
    const parsed = JSON.parse(stored)
    if (parsed.id) {
      // optionally: check auth_date if it is too old - reauthenticate
      return parsed
    } else {
      localStorage.removeItem('tg')
      return null
    }
  } catch {
    localStorage.removeItem('tg')
    return null
  }
}

const Page: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(initState())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.telegramCallback = (user: TelegramUser) => {
      console.log('telegramCallback', user)
      localStorage.setItem('tg', JSON.stringify(user))
      fetch('https://us-central1-iplantalks.cloudfunctions.net/telegramdemo', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(user) }).then(
        (r) => {
          r.text().then((text) => {
            if (r.status === 200) {
              user.status = text
              localStorage.setItem('tg', JSON.stringify(user))
              console.log('logged in', user)
              if (ref.current) {
                ref.current.innerHTML = ''
              }
            } else {
              console.warn('membership', user, text)
            }
            setUser(initState())
          })
        }
      )
    }
  }, [])

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') {
      return
    }
    if (user) {
      console.log('logged in', user)
      ref.current.innerHTML = ''
      return
    }
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'manymacbot')
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-radius', '5')
    script.setAttribute('data-onauth', 'telegramCallback(user)')
    script.setAttribute('data-request-access', 'write')

    ref.current.appendChild(script)
  }, [user])

  return (
    <main>
      <div className="container py-5">
        <h2>Demo</h2>
        <h3>Anonymous: {user ? 'No' : 'Yes'}</h3>
        <h3>Authenticated: {user ? 'Yes' : 'No'}</h3>
        <h3>Status: {user && user.status ? user.status : 'unknown'}</h3>
        <hr />
        {user && (
          <p>
            <button
              onClick={() => {
                localStorage.removeItem('tg')
                setUser(null)
              }}
            >
              logout
            </button>
          </p>
        )}
        {!user && <div ref={ref} />}
      </div>
    </main>
  )
}

export default Page
export const Head: HeadFC = () => <title>Telegram Demo</title>
