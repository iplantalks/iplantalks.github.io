# iplantalks.com.ua

Gatsby powered public website

## Workflow

Clone and start locally

```bash
git clone https://github.com/iplantalks/iplantalks.github.io
cd iplantalks.github.io
npm install
npm start
open http://localhost:8000
```

Create or edit new page

**src/pages/demo.tsx**

```tsx
import * as React from 'react'
import { HeadFC } from 'gatsby'
import '../styles/common.css'
import logo from '../images/logo.svg'
import bot from '../images/bot.png'

const DemoPage = () => {
  return (
    <main>
      <div className="bg-rainbow text-white vh-100">
        <div className="container">
          <div className="d-flex align-items-center vh-100">
            <div className="flex-grow-1 ms-3">
              <img width="120" src={logo} />
              <h1 className="display-1 fw-bold mt-2">iPlan Talks</h1>
              <p className="fs-3">Demo Page</p>
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

export default DemoPage

export const Head: HeadFC = () => <title>Demo</title>
```

This page will be accessible at [http://localhost:8000/demo/](http://localhost:8000/demo/)

Once everything is done, build website by running `npm run build`

`public` folder will be created with site contents

Once changes are saved to github, this flow is triggered by github actions and fresh version of website published

## Styling

At moment there is no dedicated designer, also we do not have specific preferernces

To not waste time by reinventing the wheel - bootstrap is used, it has its good and bad parts and can be always replaced

Was choosed just to start from something

So far it is powerfull enough to fully covered our needs (aka no need for manualy styles, everything done by its classes)

## React & Typescript

React is an out of the box templating engine for gatsby, so not many choices here

The only noticeable change here is typescript, so everything should be strongly typed and hopefully catch silly mistakes

Technically Gatsby allow us to use anything as a datasource and render it via react into site pages which will be used later

## Hosting

At moment we are using github pages, which means there is no servers from our side that we need manage

Just make some changes and save them - everything else will happen automatically

## TODO

- `// TODO: serviceworker - prepearing for rip` - cleanup `gatsby-browser.tsx` and remove `static/ss-messaging-sw.js` in few weeks
