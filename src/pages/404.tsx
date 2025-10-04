import * as React from 'react'
import { HeadFC, PageProps } from 'gatsby'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <main>
      <div className="bg-rainbow text-white vh-100">
        <div className="container">
          <div className="d-flex align-items-center vh-100">
            <div className="flex-grow-1 ms-3">
              <img width="120" src={logo} />
              <h1 className="display-1 fw-bold mt-2">iPlan Talks</h1>
              <p className="fs-3">
                Нажаль такої сторінки не існує &mdash; доєднуйся до спільноти<span style={{ opacity: 0.5 }}>, там допоможуть знайти відповіді на будь які запитання</span>
              </p>
              <p>
                <a className="btn btn-outline-light btn-lg" href="https://italks.com.ua/#reasons">
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
    </main>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <title>Сторінку не знайдено</title>
