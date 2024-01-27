import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import '../styles/common.css'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

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
      <div className="bg-rainbow text-white vh-100">
        <div className="container">
          <div className="d-flex align-items-center vh-100">
            <div className="flex-grow-1 ms-3">
              <img width="120" src={logo} alt="logo" />
              <h1 className="display-1 fw-bold">iPlan Talks</h1>
              <p className="fs-3">Отримуй цінний досвід планерів iPlan.ua за щомісячною підпискою</p>
              <p>
                <a className="btn btn-outline-light btn-lg" href="#reasons">
                  Дізнатись більше
                </a>
              </p>
            </div>
            <div className="flex-shrink-0 d-none d-lg-block">
              <img width="300" src={bot} alt="bot screenshot" />
            </div>
          </div>
        </div>
      </div>

      <div id="reasons" className="container py-5">
        <ul className="row gap-5 list-unstyled mb-0">
          <li className="bg-info text-white col p-5 fw-bold fs-4 text-center d-flex align-items-center">Досі опановуєте тему інвестицій самостійно?</li>
          <li className="bg-primary text-white col p-5 fw-bold fs-4 text-center d-flex align-items-center">Шукаєте з ким можна змістовно поспілкуватись про фінанси без флуду?</li>
          <li className="bg-warning text-white col p-5 fw-bold fs-4 text-center d-flex align-items-center">Хочете отримати відповіді щодо управління персональними фінансами від практиків?</li>
        </ul>
      </div>

      <div id="services" className="bg-body-secondary">
        <div className="container py-5">
          <h2 className="text-uppercase text-center">До послуг учасників спільноти</h2>
          <hr className="mx-auto border-3" style={{ width: '5em' }} />
          <p className="text-center mb-5">
            Ми створили iPlan Talks – найякіснішу в Україні інвестиційну спільноту, де понад 500 учасників та 15 фінансових радників iPlan.ua діляться своїм досвідом щодо пасивного інвестування,
            захисту від фінансових ризиків, декларуванню податків
          </p>

          <ul className="list-unstyled row row-cols-1 row-cols-lg-2 g-5 mb-0">
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-brands fa-youtube flex-shrink-0 me-3 fs-3 text-primary"></i>
                База записів минулих ефірів, яка містить понад 150 ефірів + підказки по їх системному перегляду + план ефірів на наступні 3-4 місяці
              </div>
            </li>
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-regular fa-calendar-check flex-shrink-0 me-3 fs-3 text-primary"></i>2 нових прямих ефіри щотижня: по понеділкам, ми підводимо підсумки тижня по новинам та запитанням
                учасників та по четвергам, де ми розбираємо теми, за які проголосувала спільнота (такі опитування ми робимо щокварталу).
              </div>
            </li>
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-regular fa-comment-dots flex-shrink-0 me-3 fs-3 text-primary"></i>
                Телеграм – чат з 20 темами спілкування, де ми запитуємо один одного та ділимось досвідом
              </div>
            </li>
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-regular fa-bookmark flex-shrink-0 me-3 fs-3 text-primary"></i>
                Власна Вікіпедія для інвестора з сотнею корисних статей та відео по головним крокам кожного інвестора
              </div>
            </li>
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-solid fa-microphone flex-shrink-0 me-3 fs-3 text-primary"></i>
                П’ятничний нетворкінг на окремому ефірі без модерації та згодом і у офф-лайн)
              </div>
            </li>
            <li className="col d-flex align-items-stretch">
              <div className="text-bg-light d-flex p-4 border shadow-sm">
                <i className="fa-solid fa-recycle flex-shrink-0 me-3 fs-3 text-primary"></i>
                Ми соціально відповідальні: Щомісяця спільнота відраховує частину прибутку на допомогу ЗСУ.
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="text-uppercase text-center">Корисні ефіри</h2>
        <hr className="mx-auto border-3 mb-5" style={{ width: '5em' }} />
        <div className="row row-cols-1 row-cols-lg-2 g-5">
          <TalksVideo href="https://www.youtube.com/watch?v=ivjT9t4bX7k" year={2023} time="50 mins">
            <b>Податки</b>
            <br />
            Про декларування доходів за 2022 рік
          </TalksVideo>
          <TalksVideo href="https://www.youtube.com/watch?v=vJ8EFO2MKfo" year={2022} time="58 mins">
            <strong>Брокери</strong>
            <br />
            Огляд функціоналу Interactive Brokers
          </TalksVideo>
          <TalksVideo href="https://www.youtube.com/watch?v=KyFkQBxiJxY" year={2023} time="57 mins">
            <strong>Інвестиції</strong>
            <br />
            Target date ETF &laquo;для чайників&raquo;
          </TalksVideo>
          <TalksVideo href="https://www.youtube.com/watch?v=cB8ZJfcv5Iw" year={2022} time="74 mins">
            <strong>Крипто</strong>
            <br />
            Про інфраструктуру та ризики криптовалют
          </TalksVideo>
          <TalksVideo href="https://www.youtube.com/watch?v=eXKKnqWuWAQ" year={2022} time="49 mins">
            <strong>Психологія фінансів</strong>
            <br />
            Робота та фінанси під час війни
          </TalksVideo>
        </div>
      </div>

      <div style={joinStyles}>
        <div className="container text-center text-white py-5">
          <p className="h1 mb-5">Долучайтесь до нас</p>
          <p>Якщо в ході опанування матеріалів у вас виникнуть питання – ви можете завітати на один з щотижневих ефірів, де наші фінансові радники допоможуть знайти на них відповідь.</p>
          <p>З нами Ви можете масштабувати та обмінюватись досвідом і разом опановувати шлях до Вашої фінансової свободи!</p>
          <p>Долучитись до спільноти можна натиснувши кнопку нижче!</p>
          <p className="mt-5">
            <a className="btn btn-outline-light text-uppercase" href="https://t.me/iPlanTalksBot?start=ZGw6OTIzNzU" target="_blank">
              Долучитись
            </a>
          </p>
        </div>
      </div>

      <div>
        <div className="container py-5">
          <h2 className="text-uppercase text-center">Участь в спільноті</h2>
          <hr className="mx-auto border-3 mb-5" style={{ width: '5em' }} />
          <div className="row g-5 text-center">
            <div className="col-12 col-lg-4">
              <div className="ratio ratio-16x9 border">
                <img className="w-100" src="https://italks.com.ua/users/sergii.mikulov/img/6560662c3a2c4-20231124090028211720.webp" />
              </div>
              <p className="my-3 fw-bold">Квартальна підписка</p>
              <p>
                <a className="btn btn-outline-dark" href="https://www.liqpay.ua/uk/checkout/i96090974757" target="_blank">
                  Оплатити
                </a>
              </p>
            </div>
            <div className="col-12 col-lg-4">
              <div className="ratio ratio-16x9 border">
                <img className="w-100" src="https://italks.com.ua/users/sergii.mikulov/img/6560663b6f5ea-20231124090043829564.webp" />
              </div>
              <p className="my-3 fw-bold">Річна підписка</p>
              <p>
                <a className="btn btn-outline-dark" href="https://gmlnk.com/api/v1/track/link/click/5d36d95ca2cf46f056995e93/1682502100082/?link=https%3A%2F%2Ft.me%2Fvahanova" target="_blank">
                  Оформити
                </a>
              </p>
            </div>
            <div className="col-12 col-lg-4">
              <div className="ratio ratio-16x9 border">
                <img className="w-100" src="https://italks.com.ua/users/sergii.mikulov/img/6567b0ea8ca24-20231129214514476847.webp" />
              </div>
              <p className="my-3 fw-bold">Перегляд бази етерів</p>
              <p>
                <a className="btn btn-outline-dark" href="https://eters.italks.com.ua/" target="_blank">
                  Переглянути
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2 className="text-uppercase text-center">Контакти</h2>
          <hr className="mx-auto border-3" style={{ width: '5em' }} />
          <p className="text-center mb-5">Залиште свій запит і ми зв'яжемось з Вами! Або ж завітайте до нас в гості</p>
          <div className="d-flex">
            <div className="text-bg-light border shadow-sm p-5 mx-auto">
              <form>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">
                    Ім'я
                  </label>
                  <input type="text" className="form-control" id="firstName" />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Номер телефону
                  </label>
                  <input type="tel" className="form-control" id="phone" aria-describedby="phoneHelp" />
                  <div id="phoneHelp" className="form-text">
                    We'll never share your phone with anyone else.
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Повідомлення нам
                  </label>
                  <textarea className="form-control" id="message" rows={3}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  Надіслати
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="text-bg-secondary">
        <div className="container py-5">
          <div className="row">
            <div className="col">
              <p className="lead">iTalks</p>
              <p>Інвестуємо розумно!</p>
              <p>
                <a className="text-light" href="https://t.me/iPlanTalksBot" target="_blank">
                  <i className="fa-brands fa-telegram fs-3"></i>
                </a>
              </p>
            </div>
            <div className="col">
              <p className="lead text-uppercase">Наші контакти</p>

              <p className="mb-0">
                Telegram:{' '}
                <a className="text-light" href="https://t.me/vahanova" target="_blank">
                  @vahanova
                </a>
              </p>
              <p>
                Email:{' '}
                <a className="text-light" href="mailto:talks@uwmc.com.ua" target="_blank">
                  talks@uwmc.com.ua
                </a>
              </p>
            </div>
            <div className="col">
              <p className="lead text-uppercase">Меню</p>
              <ul className="nav flex-column">
                <li className="nav-item mb-2">
                  <a href="#" className="nav-link p-0 text-light">
                    Про нас
                  </a>
                </li>
                <li className="nav-item mb-2">
                  <a href="#services" className="nav-link p-0 text-light">
                    Наші сервіси
                  </a>
                </li>
                <li className="nav-item mb-2">
                  <a href="#" className="nav-link p-0 text-light">
                    Блог
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
