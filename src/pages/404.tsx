import * as React from 'react'
import { HeadFC, PageProps } from 'gatsby'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <main>
      <div className="bg-rainbow text-white h-svh">
        <div className="container mx-auto my-0 p-4 h-svh">
          <div className="flex items-center justify-between gap-2 h-svh">
            <div className="flex-1">
              <img width="120" src={logo} />
              <h1 className="text-3xl font-bold mt-2">iPlan Talks</h1>
              <p className="text-2xl my-3">Нажаль такої сторінки не існує &mdash; доєднуйся до спільноти<span style={{ opacity: 0.5 }}>, там допоможуть знайти відповіді на будь які запитання</span></p>
              <p>
                <a className="inline-block border border-white text-white text-lg px-6 py-2 rounded hover:bg-white hover:!text-black transition font-semibold" href="https://cutt.ly/2e460oFu" target="_blank">
                  Дізнатись більше
                </a>
              </p>
            </div>
            <div>
              <img height="300" className='h-[80svh]' src={bot} alt="bot screenshot" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <title>Сторінку не знайдено</title>
