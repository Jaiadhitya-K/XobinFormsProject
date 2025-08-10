import React from 'react'
import { useNavigate } from 'react-router-dom'

const CommonHeader = ({ showBackButton = false, backUrl = '/dashboard' }) => {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    // Check if user is logged in
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleBackClick = () => {
    navigate(backUrl)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const getCurrentUser = () => {
    const authUser = localStorage.getItem('auth_user')
    return authUser ? JSON.parse(authUser) : null
  }

  const currentUser = getCurrentUser()

  return (
    <>
      {/* Anti-overlay backdrop */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/98 backdrop-blur-sm z-40"></div>
      
      <header className="bg-transparent shadow-sm border-b border-gray-200 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity relative z-10"
              onClick={handleLogoClick}
            >
              <div className="flex items-center space-x-3">
              {/* Modern Analytics/Chart Icon */}
              <div className="bg-blue-600 text-white rounded-lg p-3 relative z-10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>                {/* Logo Text */}
                <div className="relative z-10">
                  <h1 className="text-xl font-bold text-gray-900">XOBIN</h1>
                  <p className="text-xs text-gray-500 -mt-1">Forms</p>
                </div>
              </div>
            </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Back Button (optional) */}
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            )}

            {/* User Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {currentUser.name || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

export default CommonHeader
