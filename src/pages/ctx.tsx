import { HeadFC } from 'gatsby'
import * as React from 'react'
import { useAuth } from '../context/auth'

const CtxPage: React.FC = () => {
  const { user, login, logout } = useAuth()
  return (
    <main>
      <div className="container py-5">
        <h2>Context Demo</h2>
        {user !== undefined && user && user.displayName}
        {user !== undefined && user && <button onClick={logout}>Logout</button>}
        {user !== undefined && !user && <button onClick={login}>Login</button>}
      </div>
    </main>
  )
}

export default CtxPage
export const Head: HeadFC = () => <title>Context Demo</title>
