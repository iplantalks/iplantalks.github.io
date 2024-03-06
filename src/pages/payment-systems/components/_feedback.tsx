import * as React from 'react'
import { FormEvent, useState } from 'react'

export const Feedback = () => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [comment, setComment] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    console.log('submit')
    const url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/payment_systems_feedback')
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          comment,
        }),
      })
      setMessage(`Ваш комментар було відправлено`)
      setError('')
    } catch (error) {
      setMessage(`Сталася помилка, спробуйте піздніше`)
      if (error instanceof Error) {
        setError(error.message)
      }
    }

    setComment('')
  }

  return (
    <div className="text-bg-primary">
      <div className="container py-5">
        <h2>Маєте що додати?</h2>
        <p>Звісно, неможливо повністю передбачити або перевірити всі можливі варіанти.</p>
        <p>Тому якщо у вас є додаткові пропозиції або коментарі, будь ласка, використайте наступну форму для зворотного зв'язку:</p>
        <form className="row g-3 my-3" onSubmit={submit}>
          <div className="col-12">
            <label htmlFor="inputComment" className="form-label">
              Коментар <b className="text-danger">*</b>
            </label>
            <textarea className="form-control" id="inputComment" rows={4} required={true} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <div className="col-12">
            {message && !error && <div className="alert alert-success mb-0">{message}</div>}
            {error && <div className="alert alert-warning mb-0">{error}</div>}
            {!message && !error && (
              <button type="submit" className="btn btn-primary">
                Відправити
              </button>
            )}
          </div>
        </form>
        <p>Про всяк випадок залиште якийсь контакт за яким можна буде звʼязатися за для уточнення деталей.</p>
        <p>Або ще краще, доєднуйтесь до спільноти, де ви зможете поділитися своїми знахідками з однодумцями.</p>
      </div>
    </div>
  )
}
