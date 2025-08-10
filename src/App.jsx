import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// New Enhanced System
import UniversalLogin from './pages/UniversalLogin'
import UnifiedDashboard from './pages/UnifiedDashboard'
import EnhancedFormCreator from './pages/FormCreator'
import FormAnalytics from './pages/FormAnalyticsSimple'

// Legacy Pages (for existing evaluations)
import EvaluationForm from './pages/EvaluationForm'

import './index.css'

// Protected Route for any logged-in user
function ProtectedRoute({ children }) {
  const authUser = localStorage.getItem('auth_user')
  
  if (!authUser) {
    return <Navigate to="/login" />
  }

  return children
}

// Public Route (redirects if already logged in)
function PublicRoute({ children }) {
  const authUser = localStorage.getItem('auth_user')

  if (authUser) {
    return <Navigate to="/dashboard" />
  }

  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <UniversalLogin />
              </PublicRoute>
            } 
          />
          
          {/* Public Evaluation Routes - All Matrix Forms */}
          <Route path="/evaluate/:token" element={<EvaluationForm />} />
          <Route path="/simple-evaluate/:token" element={<EvaluationForm />} />
          <Route path="/matrix-evaluate/:token" element={<EvaluationForm />} />
          <Route path="/enhanced-evaluate/:token" element={<EvaluationForm />} />
          {/* Legacy evaluation routes for backward compatibility */}
          <Route path="/evaluation/subject/:token" element={<EvaluationForm />} />
          <Route path="/evaluation/evaluator/:token" element={<EvaluationForm />} />
          
          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UnifiedDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/create-form"
            element={
              <ProtectedRoute>
                <EnhancedFormCreator />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/create-form-advanced"
            element={
              <ProtectedRoute>
                <EnhancedFormCreator />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/edit-form/:formId"
            element={
              <ProtectedRoute>
                <EnhancedFormCreator />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/form-analytics/:formId"
            element={
              <ProtectedRoute>
                <FormAnalytics />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/forms/:formId/manage"
            element={
              <ProtectedRoute>
                <EnhancedFormCreator />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/form-preview/:formId"
            element={
              <ProtectedRoute>
                <FormAnalytics />
              </ProtectedRoute>
            }
          />
          
          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
