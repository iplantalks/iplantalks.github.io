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
    <div className="bg-sky-700 text-white">
      <div className="container mx-auto my-0 p-4 py-8">
        <h2 className='text-2xl font-bold mb-3'>Маєте що додати?</h2>
        <p className='mb-3'>Звісно, неможливо повністю передбачити або перевірити всі можливі варіанти.</p>
        <p className='mb-3'>Тому якщо у вас є додаткові пропозиції або коментарі, будь ласка, використайте наступну форму для зворотного зв'язку:</p>
        <form className="my-3" onSubmit={submit}>
          <div>
            <label htmlFor="inputComment" className="block mb-2">
              Коментар <b className="text-red-500">*</b>
            </label>
            <textarea className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" id="inputComment" rows={4} required={true} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <div>
            {message && !error && <div className="bg-green-100 p-4 mt-5 text-black">{message}</div>}
            {error && <div className="bg-red-100 p-4 mt-5 text-black">{error}</div>}
            {!message && !error && (
              <button type="submit" className="mt-5 px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                Відправити
              </button>
            )}
          </div>
        </form>
        <p className='mb-3'>Про всяк випадок залиште якийсь контакт за яким можна буде звʼязатися за для уточнення деталей.</p>
        <p className='mb-3'>Або ще краще, <a className='text-blue-500' href="https://cutt.ly/2e460oFu" target="_blank">доєднуйтесь до спільноти</a>, де ви зможете поділитися своїми знахідками з однодумцями не дочикуючись поки ми виправимо помилку або додамо новий маршрут.</p>
        <iframe
          className='mt-5 aspect-video'
          width="560"
          height="315"
          src="https://www.youtube.com/embed/k4wp01K0q-A?si=oiAmUK70LdqvMpIa"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}
