import * as React from 'react'
import { FormEvent, useState } from 'react'

export const Feedback = () => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [comment, setComment] = useState('')
  const [bank, setBank] = useState('')
  const [vendor, setVendor] = useState('')
  const [card, setCard] = useState('')
  const [cardCurrency, setCardCurrency] = useState('')
  const [service, setService] = useState('')
  const [serviceCurrency, setServiceCurrency] = useState('')
  const [method, setMethod] = useState('')

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
          bank,
          vendor,
          card,
          card_currency: cardCurrency,
          service,
          service_currency: serviceCurrency,
          method,
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
    setBank('')
    setVendor('')
    setCard('')
    setCardCurrency('')
    setService('')
    setServiceCurrency('')
    setMethod('')
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
          <div className="col-md-3">
            <label htmlFor="inputBank" className="form-label">
              Банк
            </label>
            <input type="text" className="form-control" id="inputBank" value={bank} onChange={(e) => setBank(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label htmlFor="inputVendor" className="form-label">
              Вендор
            </label>
            <input type="text" className="form-control" id="inputVendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label htmlFor="inputCard" className="form-label">
              Карта
            </label>
            <input type="text" className="form-control" id="inputCard" value={card} onChange={(e) => setCard(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label htmlFor="inputCardCurrency" className="form-label">
              Валюта
            </label>
            <input type="text" className="form-control" id="inputCardCurrency" value={cardCurrency} onChange={(e) => setCardCurrency(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label htmlFor="inputService" className="form-label">
              Платіжка
            </label>
            <input type="text" className="form-control" id="inputService" value={service} onChange={(e) => setService(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label htmlFor="inputServiceCurrency" className="form-label">
              Валюта
            </label>
            <input type="text" className="form-control" id="inputServiceCurrency" value={serviceCurrency} onChange={(e) => setServiceCurrency(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label htmlFor="inputMethod" className="form-label">
              Метод
            </label>
            <input type="text" className="form-control" id="inputMethod" value={method} onChange={(e) => setMethod(e.target.value)} />
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
        <p>Або ще краще, доєднуйтесь до спільноти, де ви зможете поділитися своїми знахідками з однодумцями.</p>
      </div>
    </div>
  )
}
