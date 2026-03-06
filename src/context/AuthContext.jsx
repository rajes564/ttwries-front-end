import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Read localStorage synchronously — no useEffect, no async, no loading flash.
// This means on every render the initial value is already correct.
function readStoredUser() {
  try {
    const stored = localStorage.getItem('ttwreis_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem('ttwreis_user')
    localStorage.removeItem('ttwreis_token')
    return null
  }
}

export function AuthProvider({ children }) {
  // Initialise synchronously from localStorage — no loading state needed
  const [user, setUser] = useState(() => readStoredUser())

  const setUserData = (userData) => setUser(userData)

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ttwreis_user')
    localStorage.removeItem('ttwreis_token')
  }

  return (
    <AuthContext.Provider value={{ user, setUserData, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
