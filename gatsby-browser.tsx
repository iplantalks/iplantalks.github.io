import * as React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import { AuthProvider } from './src/context/auth'

import './src/styles/common.css'
import './src/styles/rainbow.css'

/*
https://www.gatsbyjs.com/docs/how-to/custom-configuration/typescript/#gatsby-browsertsx--gatsby-ssrtsx
*/

// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#wrapRootElement
export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({ element }) => <AuthProvider>{element}</AuthProvider>


// TODO: serviceworker - prepearing for rip
export const onClientEntry = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
};
