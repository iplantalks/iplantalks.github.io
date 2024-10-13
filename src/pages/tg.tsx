import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useEffect, useRef } from 'react'

const Page: React.FC = () => {
  // const divRef = useRef<HTMLDivElement>(null)
  // const scriptRef = useRef<HTMLScriptElement>(null)
  useEffect(() => {
    // scriptRef.current?.remove()
    // window['onTelegramAuth'] = (user) => {
    //   console.log('onTelegramAuth', user)
    // }
    // scriptRef.current = document.createElement('script')
    // divRef.current?.after(scriptRef.current)
    // const siblings = divRef.current?.parentElement?.children
    // return () => {
    //   // destroy the script element on unmount
    //   scriptRef.current?.remove()
    //   // We also need to remove the rendered iframe
    //   if (siblings) {
    //     for (let i = 0; i < siblings.length; i++) {
    //       const element = siblings.item(i)
    //       if (element instanceof HTMLIFrameElement && element.src.includes('oauth.telegram.org')) {
    //         element.remove()
    //         break
    //       }
    //     }
    //   }
    // }
  }, [])
  return (
    <main>
      <div className="container py-5">
        <h2>Telegram Demo</h2>

        <script
          async
          src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login="manymacbot"
          data-size="medium"
          data-radius="5"
          data-onauth="console.log(user)"
          data-request-access="write"
        ></script>
      </div>
    </main>
  )
}

export default Page
export const Head: HeadFC = () => (
  <>
    <title>Telegram Demo</title>
  </>
)
