import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'pf_admin_token') setTokenState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  async function login(username, password) {
    setLoading(true)
    setError(null)
    try {
      const data = await api.login(username, password)
      setToken(data.token)
      setTokenState(data.token)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setToken(null)
    setTokenState(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
