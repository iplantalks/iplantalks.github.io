import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import '../styles/common.css'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'
import Join from '../components/join'
import Hero from '../components/hero'
import { Link } from 'gatsby'
import { Header } from '../components/header'

const joinStyles = {
  background: 'linear-gradient(rgba(2, 2, 2, 0.2), rgba(0, 0, 0, 0.7)), url("https://italks.com.ua/users/sergii.mikulov/img/1img-20231124083739964883.jpg") fixed no-repeat center center',
  backgroundSize: 'cover',
}

interface TalksVideoProps {
  href: string
  year: number
  time?: string
  children?: React.ReactNode
}

const TalksVideo = (props: TalksVideoProps) => {
  const url = new URL(props.href)
  const src = `https://www.youtube.com/embed/${url.searchParams.get('v')}`
  return (
    <div className="col d-flex align-items-stretch">
      <div className="card w-100 rounded-0 shadow-sm">
        <div className="card-img-top ratio ratio-16x9">
          <iframe
            width="560"
            height="315"
            src={src}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="card-body">
          <p className="card-text">
            <a href={props.href}>{props.children}</a>
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-body-secondary">{props.year}</small>
            <small className="text-body-secondary">{props.time || ''}</small>
          </div>
        </div>
      </div>
    </div>
  )
}

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      {/* <Hero title="iTalks Tools" subtitle="Підбірка корисних фінансових тулів та калькуляторів" /> */}
      <Header />

      <div className="container py-5">
        <h2 className="text-center fs-2 pb-2 border-bottom">Курсові різниці</h2>

        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
          <div className="col d-flex align-items-start">
            <i className="fa-solid fa-magnet flex-shrink-0 me-3 fs-1 text-secondary"></i>
            <div>
              <h3 className="fs-2 text-body-emphasis">Граничні ціни</h3>
              <p>Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці.</p>
              <Link to="/exchange-rate-differences/zero" className="btn btn-primary">
                Відкрити
              </Link>
            </div>
          </div>

          <div className="col d-flex align-items-start">
            <i className="fa-solid fa-chart-line flex-shrink-0 me-3 fs-1 text-secondary"></i>
            <div>
              <h3 className="fs-2 text-body-emphasis">Прогнозування</h3>
              <p>Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості.</p>
              <Link to="/exchange-rate-differences/forecast" className="btn btn-primary">
                Відкрити
              </Link>
            </div>
          </div>

          <div className="col d-flex align-items-start">
            <i className="fa-regular fa-money-bill-1 flex-shrink-0 me-3 fs-1 text-secondary"></i>
            <div>
              <h3 className="fs-2 text-body-emphasis">Якщо продам?</h3>
              <p>Розрахунок курсових різниць відносно позицій вашого портфелю.</p>
              <Link to="/exchange-rate-differences/interactive-brokers/orders" className="btn btn-primary">
                Відкрити
              </Link>
            </div>
          </div>

          <div className="col d-flex align-items-start">
            <i className="fa-solid fa-calendar-check flex-shrink-0 me-3 fs-1 text-secondary"></i>
            <div>
              <h3 className="fs-2 text-body-emphasis">Дивіденди</h3>
              <p>Розрахунок податків що мали б бути сплачені з нарахованих дивідендів з урахуванням курсових різниць.</p>
              <Link to="/exchange-rate-differences/interactive-brokers/dividends" className="btn btn-primary">
                Відкрити
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2 className="text-center fs-2 pb-2 border-bottom">Курс розвороту</h2>

          <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
            <div className="col d-flex align-items-start">
              <i className="fa-solid fa-infinity flex-shrink-0 me-3 fs-1 text-secondary"></i>
              <div>
                <h3 className="fs-2 text-body-emphasis">USD vs UAH</h3>
                <p>Порівняння ефективності інвестування в гривневі та валютні інструменти.</p>
                <Link to="/reversal-exchange-rate" className="btn btn-primary">
                  Відкрити
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div className="container py-5">
          <h2 className="text-center fs-2 pb-2 border-bottom">Платіжки, банки, брокери</h2>

          <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
            <div className="col d-flex align-items-start">
              <i className="fa-solid fa-file-arrow-up flex-shrink-0 me-3 fs-1 text-secondary"></i>
              <div>
                <h3 className="fs-2 text-body-emphasis">Поповнення IB</h3>
                <p>Маршрути поповнення Interactive Brokers.</p>
                <Link to="/payment-systems" className="btn btn-primary">
                  Відкрити
                </Link>
              </div>
            </div>
            <div className="col d-flex align-items-start">
              <i className="fa-solid fa-piggy-bank flex-shrink-0 me-3 fs-1 text-secondary"></i>
              <div>
                <h3 className="fs-2 text-body-emphasis">ОВДП та депозити</h3>
                <p>Куди прилаштувати гривню на визначений період.</p>
                <Link to="/ovdp" className="btn btn-primary">
                  Відкрити
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="bg-body-secondary">
        <div className="container py-5">
          <h2 className="text-center fs-2 pb-2 border-bottom">
            <span className="text-secondary">Інвест</span> Garage
          </h2>
          <p className="text-center">підбірка цікавинок та ідей що проходать валідацію часом</p>
          <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
            <div className="col d-flex align-items-start">
              <i className="fa-regular fa-clock flex-shrink-0 me-3 fs-1 text-secondary"></i>
              <div>
                <h3 className="fs-2 text-body-emphasis">Investing Clock</h3>
                <p>Фаза ринку у якій ми знаходимося.</p>
                <Link to="/garage/investing-clock" className="btn btn-primary">
                  Відкрити
                </Link>
              </div>
            </div>
          </div>
          <p>
            Якщо маєш ідеї чи побажання -{' '}
            <a href="https://t.me/iPlanTalksBot?start=ZGw6MjAxODc3" target="_blank">
              долучайся до спільноти
            </a>
            , та закидуй їх до гілки <b>🎓 Tools</b>
          </p>
        </div>
      </div> */}

      <Join />
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>Home Page</title>
    {/* <meta http-equiv="refresh" content="0; url=https://italks.com.ua/" /> */}
  </>
)
