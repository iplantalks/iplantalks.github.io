import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'

const FooPage: React.FC<PageProps> = () => {
  return (
    <main>
      <h1>Foo</h1>
      <p>bar</p>
      <img src="/images/logo.png" />
    </main>
  )
}

export default FooPage

export const Head: HeadFC = () => <title>Foo Page</title>
