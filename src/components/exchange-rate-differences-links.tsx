import * as React from 'react'
import { Link } from 'gatsby'

const ExchangeRateDifferencesLinks = () => (
  <div className="bg-body-secondary">
    <div className="container py-5">
      <h2 className="text-uppercase text-center">Курсові різниці</h2>
      <hr className="mx-auto border-3" style={{ width: '5em' }} />
      <p className="text-center mb-5">Підбірка інших корисних калькуляторів повʼязаних з курсовими різницями</p>

      <ul className="links list-unstyled row row-cols-1 row-cols-lg-2 g-5 mb-0">
        <li className="col d-flex align-items-stretch">
          <Link to="/exchange-rate-differences/zero" activeClassName="text-body-emphasis" className="text-bg-light d-flex p-4 border shadow-sm text-body-secondary text-decoration-none">
            <i className="fa-solid fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            <i className="fa-regular fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці
          </Link>
        </li>
        <li className="col d-flex align-items-stretch">
          <Link to="/exchange-rate-differences/forecast" activeClassName="text-body-emphasis" className="text-bg-light d-flex p-4 border shadow-sm text-body-secondary text-decoration-none">
            <i className="fa-solid fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            <i className="fa-regular fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості
          </Link>
        </li>
        <li className="col d-flex align-items-stretch">
          <Link
            to="/exchange-rate-differences/interactive-brokers/orders"
            activeClassName="text-body-emphasis"
            className="text-bg-light d-flex p-4 border shadow-sm text-body-secondary text-decoration-none"
          >
            <i className="fa-solid fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            <i className="fa-regular fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
            Розрахунок поточних фінансових результатів з виписки Interactive Brokers
          </Link>
        </li>
      </ul>
    </div>
  </div>
)

export default ExchangeRateDifferencesLinks
