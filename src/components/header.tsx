import * as React from 'react'
import logo from '../images/logo.svg'
import { Link } from 'gatsby'

const Card = ({ title, to, icon, description }: { title: string; to: string; icon: string; description: string }) => (
  <Link to={to} className="d-flex align-items-start">
    <i className={icon + ' flex-shrink-0 mt-1 me-2 text-secondary'}></i>
    <span className="d-block">
      <span className="d-block text-body-emphasis text-wrap">{title}</span>
      <small className="d-block text-wrap">{description}</small>
    </span>
  </Link>
)

export const Header = () => (
  <header className="header">
    <div className="container py-4">
      <div className="d-flex justify-content-between">
        <a href="https://italks.com.ua" className="text-decoration-none text-white fs-3" style={{ margin: '-10px 0' }}>
          <img className="me-3" height="40" src={logo} style={{ margin: '-10px 0' }} />
          iTalks
        </a>
        <nav className="d-none d-md-flex" style={{ gap: '30px' }}>
          <a className="header-link" href="https://italks.com.ua/#questions">
            Про нас
          </a>
          <a className="header-link" href="https://italks.com.ua/blog/">
            Блог
          </a>
          <a className="header-link" href="https://italks.com.ua/#services">
            Послуги
          </a>
          <div className="header-submenu">
            <a className="header-link" href="#">
              <span className="header-link">Інструменти</span>
              <i className="fa-solid fa-chevron-down ms-2" />
            </a>
            <div>
              <div>
                <small className="text-secondary d-block fw-bold text-nowrap" style={{ padding: '10px 20px' }}>
                  Курсові різниці
                </small>
                <Card
                  icon="fa-solid fa-magnet"
                  title="Граничні ціни"
                  to="/exchange-rate-differences/zero"
                  description="Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці."
                />
                <Card
                  icon="fa-solid fa-chart-line"
                  title="Прогнозування"
                  to="/exchange-rate-differences/forecast"
                  description="Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості."
                />
                <Card
                  icon="fa-regular fa-money-bill-1"
                  title="Якщо продам?"
                  to="/exchange-rate-differences/interactive-brokers/orders"
                  description="Розрахунок курсових різниць відносно позицій вашого портфелю."
                />
                <Card
                  icon="fa-solid fa-calendar-check"
                  title="Дивіденди"
                  to="/exchange-rate-differences/interactive-brokers/dividends"
                  description="Розрахунок податків що мали б бути сплачені з нарахованих дивідендів з урахуванням курсових різниць."
                />
                <small className="text-secondary d-block fw-bold text-nowrap" style={{ padding: '10px 20px' }}>
                  Курс розвороту
                </small>
                <Card icon="fa-solid fa-infinity" title="USD vs UAH" to="/reversal-exchange-rate" description="Порівняння ефективності інвестування в гривневі та валютні інструменти." />
                <small className="text-secondary d-block fw-bold text-nowrap" style={{ padding: '10px 20px' }}>
                  Платіжки, брокери, банки
                </small>
                <Card icon="fa-solid fa-file-arrow-up" title="Поповнення IB" to="/payment-systems" description="Маршрути поповнення Interactive Brokers." />
                <Card icon="fa-solid fa-piggy-bank" title="ОВДП та депозити" to="/ovdp" description="Куди прилаштувати гривню на визначений період." />
                {/* <small className="text-secondary d-block fw-bold text-nowrap" style={{ padding: '10px 20px' }}>
                  <span className="text-secondary">Інвест</span> Garage
                </small>
                <Card icon="fa-regular fa-clock" title="Investing Clock" to="/garage/investing-clock" description="Фаза ринку у якій ми знаходимося." /> */}
              </div>
            </div>
          </div>
          <a className="header-link" href="https://italks.wayforpay.shop/">
            Магазин
          </a>
          <a className="header-link" href="https://italks.com.ua/Oferta/">
            Оферта
          </a>
          <a className="header-link" href="https://italks.com.ua/#contact">
            Контакти
          </a>
        </nav>
      </div>
    </div>
  </header>
)

/*
<div className="bg-rainbow text-white">
        <div className="container">
          <div className="d-flex align-items-center py-4">
            <div className="d-flex-shrink-0">
              <a href="/">
                <img width="80" src={logo} />
              </a>
            </div>
            <div className="d-flex-grow-1 ms-4">
              <h1 className="display-6 fw-bold m-0">Курсові різниці</h1>
              <p className="m-0">Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці</p>
            </div>
          </div>
        </div>
      </div>
*/
