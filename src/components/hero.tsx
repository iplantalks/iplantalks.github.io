import * as React from 'react'
import logo from '../images/logo.svg'

const HeroSimple = ({ title, subtitle }: { title: string; subtitle: string }) => (
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

const HeroComplex = ({ title, subtitle, youtube }: { title: string; subtitle: string; youtube: string }) => (
  <div className="bg-rainbow text-white vh-100">
    <div className="container">
      <div className="d-flex vh-100 align-items-center">
        <div>
          <img width="120" src={logo} />
          <h1 className="display-5 display-lg-1 fw-bold mt-2">{title}</h1>
          <p className="fs-3">{subtitle}</p>
        </div>
        <div className="d-none d-md-block col-6 ms-3">
          <div className="ratio ratio-16x9">
            <iframe src={'https://www.youtube.com/embed/' + new URL(youtube).searchParams.get('v')} title="YouTube video" allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Hero = ({ title, subtitle, youtube }: { title: string; subtitle: string; youtube?: string }) =>
  youtube ? <HeroComplex title={title} subtitle={subtitle} youtube={youtube} /> : <HeroSimple title={title} subtitle={subtitle} />

export default Hero
