import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import {
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const UniversalLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiClient.login(email, password)
      
      if (response.success) {
        // Store user data
        localStorage.setItem('auth_user', JSON.stringify(response.user))
        localStorage.setItem('auth_token', response.token)
        
        // All users go to unified dashboard
        navigate('/dashboard')
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError('Invalid email or password')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'alex.johnson@company.com', password: 'password123', role: 'Engineering' },
    { email: 'emma.wilson@company.com', password: 'password123', role: 'Marketing' },
    { email: 'jessica.brown@company.com', password: 'password123', role: 'HR' },
  
    
  ]

  const handleDemoLogin = (account) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to your workspace
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Demo Accounts */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.slice(0, 2).map((account, index) => (
              <button
                key={index}
                onClick={() => handleDemoLogin(account)}
                className="p-3 bg-white/90 backdrop-blur-xl rounded-xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  {account.role === 'Admin' ? (
                    <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-xs font-medium text-gray-700">{account.role}</span>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  Click to fill
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl py-6 px-6 shadow-lg rounded-2xl border border-white/30">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts List */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Demo Accounts</h3>
            <div className="space-y-1">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(account)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <div className="text-gray-700 font-medium truncate">{account.email}</div>
                      <div className="text-gray-500">{account.role}</div>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-600 shrink-0">
                      Click
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Secure workspace authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UniversalLogin
