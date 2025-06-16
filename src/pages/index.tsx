import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import '../styles/common.css'
import Join from '../components/join'
import { Link } from 'gatsby'
import { Header } from '../components/header'

const Block = ({ icon, title, description, link }: { icon: string, title: string, description: string, link: string }) => <div className="col">
  <Link to={link} className='d-flex align-items-start h-100 p-4 text-decoration-none text-body-secondary border rounded-3 homeblock'>
    <i className={`${icon} flex-shrink-0 me-3 fs-1 text-secondary`}></i>
    <div>
      <h3 className="fs-2 text-body-emphasis">{title}</h3>
      <p className='text-secondary'>{description}</p>
    </div>
  </Link>
</div>


const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <Header />

      <div className="container py-5">
        <h2 className="text-center fs-2 pb-2 border-bottom">Податкові калькулятори</h2>

        <div className="row g-4 py-5 row-cols-1 row-cols-lg-2">
          <Block
            icon="fa-solid fa-magnet"
            title="Граничні ціни"
            description='Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці.'
            link="/exchange-rate-differences/zero"
          />
          <Block
            icon="fa-solid fa-chart-line"
            title="Прогнозування"
            description='Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості.'
            link="/exchange-rate-differences/forecast"
          />
          <Block
            icon="fa-solid fa-calendar-check"
            title="UA Tax Web"
            description='Формування податкової декларації з урахуванням курсових різниць та податку на прибуток.'
            link="https://ua-tax.web.app"
          />
          <Block
            icon="fa-regular fa-money-bill-1"
            title="Якщо продам?"
            description='Розрахунок курсових різниць відносно позицій вашого портфелю.'
            link="/exchange-rate-differences/interactive-brokers/orders"
          />
          <Block
            icon="fa-solid fa-calendar-check"
            title="Дивіденди"
            description='Розрахунок податків що мали б бути сплачені з нарахованих дивідендів з урахуванням курсових різниць.'
            link="/exchange-rate-differences/interactive-brokers/dividends"
          />

        </div>
      </div>

      <div className="bg-body-secondary">
        <div className="container py-5">
          <h2 className="text-center fs-2 pb-2 border-bottom">Курс розвороту</h2>

          <div className="row g-4 py-5 row-cols-1 row-cols-lg-2">
            <Block
              icon="fa-solid fa-infinity"
              title="USD vs UAH"
              description='Порівняння ефективності інвестування в гривневі та валютні інструменти.'
              link="/reversal-exchange-rate"
            />
          </div>
        </div>
      </div>

      <div className="">
        <div className="container py-5">
          <h2 className="text-center fs-2 pb-2 border-bottom">Платіжки, банки, брокери</h2>

          <div className="row g-4 py-5 row-cols-1 row-cols-lg-2">
            <Block
              icon="fa-solid fa-file-arrow-up"
              title="Поповнення IB"
              description='Маршрути поповнення Interactive Brokers.'
              link="/payment-systems"
            />
            <Block
              icon="fa-solid fa-piggy-bank"
              title="ОВДП та депозити"
              description='Куди прилаштувати гривню на визначений період.'
              link="/ovdp"
            />
          </div>
        </div>
      </div>

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

/*
<div className="bg-body-secondary">
  <div className="container py-5">
    <h2 className="text-center fs-2 pb-2 border-bottom">
      <span className="text-secondary">Інвест</span> Garage
    </h2>
    <p className="text-center">підбірка цікавинок та ідей що проходать валідацію часом</p>
    <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-regular fa-clock flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Investing Clock</h3>
          <p>Фаза ринку у якій ми знаходимося.</p>
          <Link to="/garage/investing-clock" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-coins flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Flip the Coin</h3>
          <p>Гра у підкидання монетки.</p>
          <Link to="/garage/flip-the-coin" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-regular fa-calendar flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Ten Days</h3>
          <p>Що буде якщо пропустити 10 найкращих днів.</p>
          <Link to="/garage/ten-days" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-chart-pie flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Allocator</h3>
          <p>Як саме аллокація впливає на дохідність портфелю.</p>
          <Link to="/garage/allocator" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-soap flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Bubble</h3>
          <p>Бульбашковий аніліз мультиплікативних індикаторів.</p>
          <Link to="/garage/bubble" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-poo flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Market Timing</h3>
          <p>Перевіряєми чи взагалі є сенс паритися</p>
          <Link to="/garage/market-timing-backtest" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-microscope flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Flex Viewer</h3>
          <p>Переглядяч Flex звітів</p>
          <Link to="/garage/flex/viewer" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-utensils flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">UA Market</h3>
          <p>Гривня через 20 років або Прибуткові ігри</p>
          <Link to="/ua" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
      <div className="col d-flex align-items-start position-relative">
        <i className="fa-solid fa-chart-line flex-shrink-0 me-3 fs-1 text-secondary"></i>
        <div>
          <h3 className="fs-2 text-body-emphasis">Monte Carlo</h3>
          <p>Ворожіння на цифрах</p>
          <Link to="/garage/monte-carlo" className="position-absolute bottom-0 btn btn-primary">
            Відкрити
          </Link>
        </div>
      </div>
    </div>
    <p>
      Якщо маєш ідеї чи побажання -{' '}
      <a href="https://cutt.ly/2e460oFu" target="_blank">
        долучайся до спільноти
      </a>
      , та закидуй їх до гілки <b>🎓 Tools</b>
    </p>
  </div>
</div>
*/
