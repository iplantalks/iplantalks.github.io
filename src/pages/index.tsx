import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import Join from '../components/join'
import { Link } from 'gatsby'
import { Header } from '../components/header'
import { Banknote, Bubbles, CalendarCheck, CalendarX, ChartPie, ChartSpline, Clock, Coins, FileUp, Infinity, LucideProps, Magnet, Microscope, PiggyBank, Utensils, Watch } from 'lucide-react'
import { createElement, ForwardRefExoticComponent, RefAttributes } from 'react'

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <Header />

      <div className='py-4'>
        <div className='container mx-auto my-0 p-4'>
          <h2 className='text-center text-2xl mb-4'>Податкові калькулятори</h2>
          <div className='grid grid-cols-2 gap-4'>
            <Block
              icon={Magnet}
              title="Граничні ціни"
              description='Розрахунок граничних цін та курсу інвестицій з урахуванням податку на курсові різниці.'
              to="/exchange-rate-differences/zero/"
            />
            <Block
              icon={ChartSpline}
              title="Прогнозування"
              description='Модель впливу податку на інвестиційний прибуток на результат інвестицій при змінних темпах девальвації та % прибутковості.'
              to="/exchange-rate-differences/forecast/"
            />
            <Block
              icon={CalendarCheck}
              title="UA Tax Web"
              description='Формування податкової декларації з урахуванням курсових різниць та податку на прибуток.'
              to="https://ua-tax.web.app"
            />
            <Block
              icon={Banknote}
              title="Якщо продам?"
              description='Розрахунок курсових різниць відносно позицій вашого портфелю.'
              to="/exchange-rate-differences/interactive-brokers/orders/"
            />
            <Block
              icon={CalendarCheck}
              title="Дивіденди"
              description='Розрахунок податків що мали б бути сплачені з нарахованих дивідендів з урахуванням курсових різниць.'
              to="/exchange-rate-differences/interactive-brokers/dividends/"
            />
          </div>
        </div>
      </div>

      <div className="py-4 bg-neutral-100">
        <div className='container mx-auto my-0 p-4'>
          <h2 className='text-center text-2xl mb-4'>Курс розвороту</h2>

          <div className='grid grid-cols-2 gap-4'>
            <Block
              icon={Infinity}
              title="USD vs UAH"
              description='Порівняння ефективності інвестування в гривневі та валютні інструменти.'
              to="/reversal-exchange-rate/"
            />
          </div>
        </div>
      </div>

      <div className='py-4'>
        <div className='container mx-auto my-0 p-4'>
          <h2 className='text-center text-2xl mb-4'>Платіжки, банки, брокери</h2>

          <div className='grid grid-cols-2 gap-4'>
            <Block
              icon={FileUp}
              title="Поповнення IB"
              description='Маршрути поповнення Interactive Brokers.'
              to="/payment-systems/"
            />
            <Block
              icon={PiggyBank}
              title="ОВДП та депозити"
              description='Куди прилаштувати гривню на визначений період.'
              to="/ovdp/"
            />
          </div>
        </div>
      </div>

      <div className="py-4 bg-neutral-100">
        <div className='container mx-auto my-0 p-4'>
          <h2 className='text-center text-2xl my-0'>
            <span className="text-neutral-500">Інвест</span> Garage
          </h2>
          <p className="text-center mt-1 mb-4">підбірка цікавинок та ідей що проходать валідацію часом</p>

          <div className='grid grid-cols-2 gap-4'>
            <Block
              icon={Clock}
              title="Investing Clock"
              description="Фаза ринку у якій ми знаходимося."
              to="/garage/investing-clock/"
            />
            <Block
              icon={Coins}
              title="Flip the Coin"
              description="Гра у підкидання монетки."
              to="/garage/flip-the-coin/"
            />
            <Block
              icon={CalendarX}
              title="Ten Days"
              description="Що буде якщо пропустити 10 найкращих днів."
              to="/garage/ten-days/"
            />
            <Block
              icon={ChartPie}
              title="Allocator"
              description="Як саме аллокація впливає на дохідність портфелю."
              to="/garage/allocator/"
            />
            <Block
              icon={Bubbles}
              title="Bubble"
              description="Бульбашковий аніліз мультиплікативних індикаторів."
              to="/garage/bubble/"
            />
            <Block
              icon={Watch}
              title="Market Timing"
              description="Перевіряєми чи взагалі є сенс паритися"
              to="/garage/market-timing-backtest/"
            />
            <Block
              icon={Microscope}
              title="Flex Viewer"
              description="Переглядяч Flex звітів"
              to="/garage/flex/viewer/"
            />
            <Block
              icon={Utensils}
              title="UA Market"
              description="Гривня через 20 років або Прибуткові ігри"
              to="/ua/"
            />
            <Block
              icon={ChartSpline}
              title="Monte Carlo"
              description="Ворожіння на цифрах"
              to="/garage/monte-carlo/"
            />
          </div>

          <p className='text-center mt-5 text-neutral-500'>
            Якщо маєш ідеї чи побажання - <a className='text-blue-500' href="https://cutt.ly/2e460oFu" target="_blank">долучайся до спільноти</a>, та закидуй їх до гілки <b>🎓 Tools</b>
          </p>
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

function Block({ to, title, description, icon }: { to: string, title: string, description: string, icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }) {
  return <Link to={to} className='flex gap-3 items-start border border-neutral-200 rounded p-4 hover:shadow hover:border-neutral-300 group'>
    {createElement(icon, { className: 'w-14 h-14 transition-transform text-neutral-500 group-hover:!text-blue-500 group-hover:scale-105' })}
    <div>
      <h3 className='text-lg font-semibold mb-1 text-black group-hover:!text-blue-500'>{title}</h3>
      <p className='my-0 text-neutral-500'>{description}</p>
    </div>
  </Link>
}
