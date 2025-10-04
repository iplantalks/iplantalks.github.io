import * as React from 'react'
import logo from '../images/logo.svg'
import { Link } from 'gatsby'
import { createElement } from 'react'
import { Banknote, Bubbles, CalendarCheck, CalendarX, ChartPie, ChartSpline, Clock, Coins, FileUp, Infinity, LucideProps, Magnet, Microscope, PiggyBank, Utensils, Watch } from 'lucide-react'

export const Header = () => (
  <header className="bg-sky-500 text-white">
    <div className="container mx-auto my-0 p-4">
      <div className="flex justify-between">
        <a href="/" className="flex gap-2 items-center no-underline text-white">
          <img width="50" src={logo} style={{ margin: '-10px 0' }} />
          <span className='text-2xl'>iTalks</span>
        </a>
        <nav className="hidden md:flex gap-4 items-center">
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.com.ua/#questions">
            Про нас
          </a>
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.com.ua/blog/">
            Блог
          </a>
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.com.ua/#services">
            Послуги
          </a>
          <div className="relative group">
            <a className="text-white hover:opacity-75 uppercase" href="#">
              <span>Інструменти</span>
              <i className="fa-solid fa-chevron-down ms-2" />
            </a>
            <div className='absolute left-0 top-full hidden group-hover:block bg-white shadow-lg z-10 min-w-[300px]'>
              <div className='py-2'>
                <small className="text-neutral-500 block font-bold text-nowrap py-2 px-3">
                  Курсові різниці
                </small>
                <Block
                  icon={Magnet}
                  title="Граничні ціни"
                  to="/exchange-rate-differences/zero/"
                  description="Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці."
                />
                <Block
                  icon={ChartSpline}
                  title="Прогнозування"
                  to="/exchange-rate-differences/forecast/"
                  description="Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості."
                />
                <Block
                  icon={Banknote}
                  title="Якщо продам?"
                  to="/exchange-rate-differences/interactive-brokers/orders/"
                  description="Розрахунок курсових різниць відносно позицій вашого портфелю."
                />
                <Block
                  icon={CalendarCheck}
                  title="Дивіденди"
                  to="/exchange-rate-differences/interactive-brokers/dividends/"
                  description="Розрахунок податків що мали б бути сплачені з нарахованих дивідендів з урахуванням курсових різниць."
                />
                <Block
                  icon={CalendarCheck}
                  title="UA Tax Web"
                  to="https://ua-tax.web.app"
                  description="Формування податкової декларації з урахуванням курсових різниць та податку на прибуток."
                />
                <small className="text-neutral-500 block font-bold text-nowrap py-2 px-3">
                  Курс розвороту
                </small>
                <Block icon={Infinity} title="USD vs UAH" to="/reversal-exchange-rate/" description="Порівняння ефективності інвестування в гривневі та валютні інструменти." />
                <small className="text-neutral-500 block font-bold text-nowrap py-2 px-3">
                  Платіжки, брокери, банки
                </small>
                <Block icon={FileUp} title="Поповнення IB" to="/payment-systems/" description="Маршрути поповнення Interactive Brokers." />
                <Block icon={PiggyBank} title="ОВДП та депозити" to="/ovdp/" description="Куди прилаштувати гривню на визначений період." />
                <small className="text-neutral-500 block font-bold text-nowrap py-2 px-3">
                  <span className="text-secondary">Інвест</span> Garage
                </small>
                <Block icon={Clock} title="Investing Clock" to="/garage/investing-clock/" description="Фаза ринку у якій ми знаходимося." />
                <Block icon={Coins} title="Flip the Coin" to="/garage/flip-the-coin/" description="Гра у підкидання монетки." />
                <Block icon={CalendarX} title="Ten Days" to="/garage/ten-days/" description="Що буде якщо пропустити 10 найкращих днів." />
                <Block icon={ChartPie} title="Allocator" to="/garage/allocator/" description="Як саме аллокація впливає на дохідність портфелю." />
                <Block icon={Bubbles} title="Bubble" to="/garage/bubble/" description="Бульбашковий аніліз мультиплікативних індикаторів." />
                <Block icon={Watch} title="Market Timing" to="/garage/market-timing-backtest/" description="Перевіряємо чи варто взагалі паритися." />
                <Block icon={Microscope} title="Flex Viewer" to="/garage/flex/viewer/" description="Переглядач Flex звітів." />
                <Block icon={Utensils} title="UA Market" to="/ua/" description="Гривня через 20 років або Прибуткові ігри." />
                <Block icon={ChartSpline} title="Monte Carlo" to="/garage/monte-carlo/" description="Ворожіння на цифрах." />
              </div>
            </div>
          </div>
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.wayforpay.shop/">
            Магазин
          </a>
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.com.ua/Oferta/">
            Оферта
          </a>
          <a className="text-white hover:opacity-75 uppercase" href="https://italks.com.ua/#contact">
            Контакти
          </a>
        </nav>
      </div>
    </div>
  </header>
)

function Block({ to, title, description, icon }: { to: string, title: string, description: string, icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }) {
  return <Link to={to} className='flex gap-2 text-black py-1 px-3 mb-2 text-sm group/link'>
    <span className='block w-10 h-10 text-neutral-500 group-hover/link:!text-blue-500'>{createElement(icon, { className: "w-10" })}</span>
    <span className='block'>
      <span className='block wrap-anywhere group-hover/link:text-blue-500'>{title}</span>
      <span className='block wrap-anywhere text-neutral-500'>{description}</span>
    </span>
  </Link>
}
