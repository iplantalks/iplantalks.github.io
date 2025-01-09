import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: `italks`,
    siteUrl: `https://italks.com.ua`,
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: { trackingIds: ['G-HRXQ4P204N'] },
    },
    'smartsender',
  ],
}

export default config
