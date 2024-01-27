import * as React from 'react'
import logo from '../images/logo.svg'

const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="bg-rainbow text-white vh-100">
    <div className="container">
      <div className="d-flex vh-100 align-items-center">
        <div>
          <img width="120" src={logo} />
          <h1 className="display-5 display-lg-1 fw-bold mt-2">{title}</h1>
          <p className="fs-3">{subtitle}</p>
        </div>
      </div>
    </div>
  </div>
)

export default Hero
