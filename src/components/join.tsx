import * as React from 'react'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const Join = () => (
  <div className="bg-rainbow text-white vh-100">
    <div className="container">
      <div className="d-flex align-items-center vh-100">
        <div className="flex-grow-1 ms-3">
          <img width="120" src={logo} />
          <h1 className="display-1 fw-bold mt-2">iPlan Talks</h1>
          <p className="fs-3">Отримуй цінний досвід планерів iPlan.ua</p>
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
)

export default Join
