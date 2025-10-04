import * as React from 'react'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const Join = () => (
  <div className="bg-rainbow text-white h-svh">
    <div className="container mx-auto my-0 p-4 h-svh">
      <div className="flex items-center justify-between gap-2 h-svh">
        <div className="flex-1">
          <img width="120" src={logo} />
          <h1 className="text-3xl font-bold mt-2">iPlan Talks</h1>
          <p className="text-2xl">Отримуй цінний досвід планерів iPlan.ua</p>
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
)

export default Join
