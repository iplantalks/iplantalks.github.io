import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: `italks`,
    siteUrl: `https://italks.com.ua`,
  },
  graphqlTypegen: true,
  trailingSlash: 'always',
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: { trackingIds: ['G-HRXQ4P204N'] },
    },
    {
      resolve: `gatsby-plugin-hotjar`,
      options: {
        id: 3873202,
        sv: 6,
      },
    },
  ],
}

export default config
