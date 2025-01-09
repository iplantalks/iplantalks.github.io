import { createElement } from 'react'
import type { RenderBodyArgs } from 'gatsby'

export function onRenderBody({ setHeadComponents }: RenderBodyArgs): void {
  setHeadComponents([
    createElement('script', {
      key: 'gatsby-plugin-smartsender',
      dangerouslySetInnerHTML: {
        __html: `
          window.SPH_INIT = function () {
            window.SPH = {
              cookieName: "ssId",
              identifier: "SPH-TVSK5YV",
              baseUrl: "https://customer.smartsender.eu/pixel",
            };

            let script = document.createElement("script");

            script.src = "https://customer.smartsender.eu/js/client/ph.min.js";
            script.async = true;

            document.getElementsByTagName("head")[0].appendChild(script);
          };
          SPH_INIT();
        `,
      },
    }),
  ])
}
