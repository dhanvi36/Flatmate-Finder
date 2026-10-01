import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken)
        const isExpired = decoded.exp * 1000 < Date.now()

        if (isExpired) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } else {
          // Always take role from token — it is the source of truth
          const storedUser  = savedUser ? JSON.parse(savedUser) : {}
          const mergedUser  = {
            ...storedUser,
            userId: decoded.userId,
            role:   decoded.role,   // ← always from token, never stale
          }
          setToken(savedToken)
          setUser(mergedUser)
          // Keep localStorage in sync too
          localStorage.setItem('user', JSON.stringify(mergedUser))
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (tokenStr, userData) => {
    // Decode token to get authoritative role
    try {
      const decoded = jwtDecode(tokenStr)
      const mergedUser = { ...userData, userId: decoded.userId, role: decoded.role }
      localStorage.setItem('token', tokenStr)
      localStorage.setItem('user', JSON.stringify(mergedUser))
      setToken(tokenStr)
      setUser(mergedUser)
    } catch {
      localStorage.setItem('token', tokenStr)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(tokenStr)
      setUser(userData)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updated) => {
    const merged = { ...user, ...updated }
    localStorage.setItem('user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
