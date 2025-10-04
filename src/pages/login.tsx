import { HeadFC, navigate } from 'gatsby'
import * as React from 'react'
import { useEffect } from 'react'
import { useAuth } from '../context/auth'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const LoginPage: React.FC = () => {
  const { user, login } = useAuth()

  useEffect(() => {
    if (user !== undefined && user) {
      navigate(new URLSearchParams(window.location.search).get('redirect') || '/')
    }
  }, [user])

  return (
    <div className="bg-rainbow text-white h-svh">
      <div className="container mx-auto my-0 p-4 h-svh">
        <div className="flex items-center justify-between gap-2 h-svh">
          <div className="flex-1">
            <img width="120" src={logo} />
            <h1 className="text-3xl font-bold mt-2">iPlan Talks</h1>
            <p className="text-2xl my-3">За для перегляду сторінок потрібно авторизуватися</p>
            <p>
              <a
                className="inline-block border border-white text-white text-lg px-6 py-2 rounded hover:bg-white hover:!text-black transition cursor-default"
                onClick={(e) => {
                  e.preventDefault()
                  login()
                }}
              >
                <span className='flex items-center gap-2'>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="me-2" />
                  Увійти за допомогою Google
                </span>
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

  return <div className="bg-rainbow text-white vh-100">
    <div className="container">
      <div className="d-flex align-items-center vh-100">
        <div className="flex-grow-1 ms-3">
          <img width="120" src={logo} />
          <h1 className="display-1 fw-bold mt-2">iPlan Talks</h1>
          <p className="fs-3">За для перегляду сторінок потрібно авторизуватися</p>
          <p>
            <a
              className="btn btn-outline-light btn-lg"
              onClick={(e) => {
                e.preventDefault()
                login()
              }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="me-2" />
              Увійти за допомогою Google
            </a>
          </p>
        </div>
        <div className="flex-shrink-0 d-none d-lg-block">
          <img width="300" src={bot} alt="bot screenshot" />
        </div>
      </div>
    </div>
  </div>
}

export default LoginPage
export const Head: HeadFC = () => <title>iTalks Login</title>
