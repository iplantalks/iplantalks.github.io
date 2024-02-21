import * as React from 'react'

export const Shop = () => {
  const links = ['https://www.youtube.com/watch?v=uUwc3imjRhA', 'https://www.youtube.com/watch?v=5vs-k-DCrOY']
  const link = links[Math.floor(Math.random() * links.length)]
  return (
    <div className="text-bg-warning text-bg-warning-light">
      <div className="container">
        <div className="d-flex align-items-center vh-100">
          <div className="me-5 d-none d-md-block">
            <div className="ratio ratio-16x9" style={{ minWidth: '40vw' }}>
              <iframe src={'https://www.youtube.com/embed/' + new URL(link).searchParams.get('v')} title="YouTube video" allowFullScreen></iframe>
            </div>
            <p className="text-center">Приклад</p>
          </div>
          <div>
            <h1 className="display-4 fw-bold">Вдосконалюй свої івнестиційні навички - підтримуй ЗСУ.</h1>
            <p>Заходь в наш магазин корисних етерів для інвестора.</p>

            <p>
              <a className="btn btn-outline-dark btn-lg" href="https://italks.wayforpay.shop" target="_blank">
                Перейти до магазину
              </a>
            </p>
            <p>Увесь збір від продажів спрямовується на підтримку конкретних підрозділів ЗСУ.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
