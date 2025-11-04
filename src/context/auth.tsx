import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, User, getAuth, signInWithCustomToken, signInWithPopup, updateProfile } from 'firebase/auth'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'

const app =
  typeof window == 'undefined'
    ? null
    : initializeApp({
      apiKey: 'AIzaSyBvRGUAA8u3F09n0U26m5IoPwrwMsKzRTM',
      authDomain: 'iplantalks.firebaseapp.com',
      projectId: 'iplantalks',
      storageBucket: 'iplantalks.appspot.com',
      messagingSenderId: '1006859178341',
      appId: '1:1006859178341:web:b5dc86f76f1872fe97518c',
    })

export const AuthContext = React.createContext<{ user: User | null | undefined; login: () => void; logout: () => void }>({
  user: undefined,
  login: () => { },
  logout: () => { }
})

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    if (app == null) {
      return
    }

    getAuth(app).onAuthStateChanged(user => {
      setUser(user)
      if (user && user.email) {
        fetch('https://nethunt.com/service/automation/hooks/68f0c80df21e5b74dc674338', {
          method: 'POST',
          body: JSON.stringify({ email: user.email }),
          headers: { 'Content-Type': 'application/json' }
        })
      }
    })
  }, [])

  const login = () => {
    if (app == null) {
      return
    }

    signInWithPopup(getAuth(app), new GoogleAuthProvider())
  }

  const logout = () => {
    if (app == null) {
      return
    }

    getAuth(app).signOut()
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
