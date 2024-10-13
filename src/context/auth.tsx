import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, User, getAuth, signInWithCustomToken, signInWithPopup } from 'firebase/auth'
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

export const AuthContext = React.createContext<{ user: User | null | undefined; found: boolean; login: () => void; logout: () => void; telegram: (token: string) => void }>({
  user: undefined,
  found: false,
  login: () => {},
  logout: () => {},
  telegram: () => {},
})

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [found, setFound] = useState<boolean>(false)

  useEffect(() => {
    if (app == null) {
      return
    }

    getAuth(app).onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        user
          .getIdToken()
          .then((token) => fetch('https://europe-west3-iplantalks.cloudfunctions.net/user_subscription', { headers: { authorization: `Bearer ${token}` } }))
          .then((r) => r.json())
          .then((r) => {
            setFound(r.found ? true : false)
          })
          .catch((error) => {
            console.log('subscription', error.message)
            setFound(false)
          })
      } else {
        setFound(false)
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

  const telegram = (token: string) => {
    if (app == null) {
      return
    }

    signInWithCustomToken(getAuth(app), token)
  }

  return <AuthContext.Provider value={{ user, found, login, logout, telegram }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
