import React from 'react'

interface Person {
  id: number
  name: string
  age: number
}

const Page = ({ pageContext }: { pageContext: Person }) => {
  console.log('person', pageContext)
  return (
    <div>
      <h1>Person</h1>
      <pre>{JSON.stringify(pageContext, null, 2)}</pre>
    </div>
  )
}

export default Page

export const Head = ({ pageContext }: { pageContext: Person }) => {
  console.log('head', pageContext)
  return <title>{pageContext.name || 'unknown person'}</title>
}
