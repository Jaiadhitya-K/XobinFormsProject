import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    try {
      // For demo purposes, we'll use a simple admin login
      // In production, this would validate against your user database
      if (email === 'admin@company.com' && password === 'admin123') {
        const userData = {
          id: 'admin-1',
          email: 'admin@company.com',
          name: 'Administrator',
          role: 'admin'
        }
        setUser(userData)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        return { data: { user: userData }, error: null }
      } else {
        return { 
          data: null, 
          error: { message: 'Invalid email or password' } 
        }
      }
    } catch (error) {
      return { 
        data: null, 
        error: { message: 'Authentication failed' } 
      }
    }
  }

  const signUp = async (email, password) => {
    // For demo purposes, just return success
    // In production, this would create a new user in your database
    return { 
      data: { user: null }, 
      error: null 
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    return { error: null }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
