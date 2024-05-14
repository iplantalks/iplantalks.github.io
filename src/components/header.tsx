import * as React from 'react'
import logo from '../images/logo.svg'

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
                <a href="/payment-systems/">Гайд по маршрутам поповнень ІВ</a>
                <a href="/reversal-exchange-rate/">Калькулятор курсу розвороту</a>
                <a href="/exchange-rate-differences/forecast/">Калькулятор податку на курсові різниці</a>
                <a href="/ovdp/">Калькулятор ОВДП</a>
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
