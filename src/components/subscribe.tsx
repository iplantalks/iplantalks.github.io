import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useState, useMemo } from 'react'

const Subscribe = ({ youtube }: { youtube?: string }) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isDisabled = useMemo(() => {
    if (!email || !email.match(/.+@.+/)) {
      return true
    }
    return false
  }, [email])

  const onSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/subscriber')
    url.searchParams.append('email', email)
    try {
      await fetch(url)
      setMessage(`Ви підписалися на оновлення`)
      setError('')
    } catch (error) {
      setMessage(`Сталася помилка, спробуйте піздніше`)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
    setEmail('')
  }

  return (
    <div className="bg-body-secondary">
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-12 col-sm-6">
            <div className="ratio ratio-16x9">
              <iframe
                width="560"
                height="315"
                src={'https://www.youtube.com/embed/' + new URL(youtube || 'https://www.youtube.com/watch?v=4zb1xB3qsX8').searchParams.get('v')}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <h3 className="text-end mt-5 mt-sm-0">📈 Тримай руку на пульсі</h3>
            <p className="text-end">Підписуйся за для отримання апдейтів цього та інших калькуляторів</p>
            <form className="form-subscribe row g-3 align-items-center justify-content-end mb-3">
              <div className="col-auto">
                <input className="form-control" type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="col-auto">
                <button className="btn btn-outline-dark" onClick={onSubmit} disabled={isDisabled}>
                  Підписатись
                </button>
              </div>
            </form>
            {!message && !error && (
              <div className="text-end text-secondary">Підписники отримуватимуть сповіщення щодо покращень, нових калькуляторів та інших новин що можуть бути цікавими інвестору.</div>
            )}
            {message && !error && <div className="alert alert-success text-center">{message}</div>}
            {message && error && <div className="alert alert-warning text-center">{message}</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* SENDPULSE */}
            <script src="https://web.webformscr.com/apps/fc3/build/loader.js" async sp-form-id="3101c6b6bba9c635d8402a35872446f197204626113308f24bfdeb238f517b4a"></script>
            {/* SENDPULSE */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscribe
