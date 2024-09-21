import * as React from 'react'
import { useEffect } from 'react'
import { useAuth } from '../context/auth'

export const User = () => {
  const { user, found, login, logout } = useAuth()
  if (!user) {
    return null
  }
  return (
    <div className="bg-secondary-subtle">
      <div className="container py-2">
        <div className="d-flex align-items-center gap-3">
          <span>{found ? <i className="fa-solid fa-credit-card" /> : <i className="fa-regular fa-credit-card" />}</span>
          {user.photoURL && <img src={user.photoURL} width="24" height="24" />}
          <span>{user.displayName}</span>
          <span>{user.email}</span>
          <span>{user.phoneNumber}</span>
          <span className="flex-fill"></span>
          <button className="btn btn-outline-dark btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
