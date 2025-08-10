import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import CommonHeader from '../components/CommonHeader'
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  LinkIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  EyeIcon,
  UserIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

// Simple Pie Chart Component
const PieChart = ({ data, title, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-sm">No data available</div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="text-center">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="flex justify-center">
        <div className="w-32 h-32 relative">
          <svg viewBox="0 0 42 42" className="w-full h-full">
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="3"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const rotation = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0)
              
              return (
                <circle
                  key={index}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset="25"
                  style={{
                    transform: `rotate(${rotation * 3.6}deg)`,
                    transformOrigin: '21px 21px'
                  }}
                />
              )
            })}
          </svg>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-600">{item.label}</span>
            </div>
            <span className="font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to get question type icons
const getQuestionTypeIcon = (type) => {
  switch (type) {
    case 'text':
    case 'textarea':
      return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
    case 'rating':
      return <CheckCircleIcon className="w-5 h-5 text-yellow-500" />
    case 'multiple-choice':
      return <UsersIcon className="w-5 h-5 text-blue-500" />
    default:
      return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
  }
}

const FormAnalyticsSimple = () => {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [responses, setResponses] = useState([])
  const [activeTab, setActiveTab] = useState('preview')
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview') // 'overview', 'by-user', 'by-question'
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  // Calculate stats for sidebar
  const sidebarStats = {
    totalAssignments: assignments.length,
    completedResponses: responses.length,
    completionRate: assignments.length > 0 ? Math.round((responses.length / assignments.length) * 100) : 0
  }

  // Calculate question type stats
  const questionTypeStats = form?.questions?.reduce((acc, question) => {
    const type = question.type || 'text'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {}) || {}

  useEffect(() => {
    if (formId) {
      fetchAnalyticsData()
    }
  }, [formId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching analytics data for form:', formId)
      
      // Get form data, assignments, and responses
      const [formData, assignmentData, responseData] = await Promise.all([
        apiClient.getForm(formId),
        apiClient.getFormAssignments(formId),
        apiClient.getFormResponses(formId)
      ])
      
      console.log('🔍 RAW API RESPONSES:')
      console.log('  📋 Form Data:', formData)
      console.log('  👥 Assignment Data (raw):', assignmentData)
      console.log('  📝 Response Data (raw):', responseData)
      console.log('  � Assignment Array Length:', Array.isArray(assignmentData) ? assignmentData.length : 'Not an array')
      console.log('  📏 Response Array Length:', Array.isArray(responseData) ? responseData.length : 'Not an array')
      
      // Ensure we have arrays
      const finalAssignments = Array.isArray(assignmentData) ? assignmentData : (assignmentData?.assignments || [])
      const finalResponses = Array.isArray(responseData) ? responseData : (responseData?.responses || [])
      
      console.log('🔧 PROCESSED DATA:')
      console.log('  👥 Final Assignments:', finalAssignments)
      console.log('  📝 Final Responses:', finalResponses)
      console.log('  📊 Assignment Count:', finalAssignments.length)
      console.log('  📊 Response Count:', finalResponses.length)
      
      setForm(formData)
      setAssignments(finalAssignments)
      setResponses(finalResponses)
      
      console.log('✅ Analytics data state updated')
      
    } catch (err) {
      console.error('❌ Error fetching analytics data:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getCompletionStats = () => {
    console.log('📊 CALCULATING STATS:')
    console.log('  🔍 Form:', form)
    console.log('  👥 Assignments:', assignments)
    console.log('  📝 Responses:', responses)
    console.log('  📋 Form Type:', form?.formType)
    
    if (!form || !assignments || !responses) {
      console.log('❌ Missing data, returning zeros')
      return { totalPeopleAssigned: 0, completed: 0, pending: 0, completionRate: 0 }
    }
    
    // For enhanced forms (which is what we're using)
    const totalPeopleAssigned = Array.isArray(assignments) ? assignments.length : 0
    const completed = Array.isArray(responses) ? responses.length : 0
    const pending = Math.max(0, totalPeopleAssigned - completed)
    const completionRate = totalPeopleAssigned > 0 ? (completed / totalPeopleAssigned) * 100 : 0
    
    console.log('📊 CALCULATED STATS:')
    console.log('  👥 Total Assigned:', totalPeopleAssigned)
    console.log('  ✅ Completed:', completed)
    console.log('  ⏳ Pending:', pending)
    console.log('  📈 Completion Rate:', completionRate.toFixed(1) + '%')
    
    return { totalPeopleAssigned, completed, pending, completionRate }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CommonHeader showBackButton={true} backUrl="/dashboard" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CommonHeader showBackButton={true} backUrl="/dashboard" />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CommonHeader showBackButton={true} backUrl="/dashboard" />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Form not found</h3>
            <p className="text-gray-500">The form you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = getCompletionStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CommonHeader showBackButton={true} backUrl="/dashboard" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
              <p className="text-gray-600">Form Preview & Analytics</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/edit-form/${formId}`)}
                className="btn btn-primary"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Form
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="tab-nav">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('preview')}
                className={`tab-button ${
                  activeTab === 'preview' ? 'active' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <PlayIcon className="w-4 h-4" />
                  <span>Form Preview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`tab-button ${
                  activeTab === 'analytics' ? 'active' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Analytics Sub-Tab Navigation */}
        {activeTab === 'analytics' && (
          <div className="mb-8">
            <div className="border-b border-gray-100">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setAnalyticsSubTab('overview')}
                  className={`sub-tab-button ${
                    analyticsSubTab === 'overview' ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <PresentationChartBarIcon className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>
                <button
                  onClick={() => setAnalyticsSubTab('by-user')}
                  className={`sub-tab-button ${
                    analyticsSubTab === 'by-user' ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>By User</span>
                  </div>
                </button>
                <button
                  onClick={() => setAnalyticsSubTab('by-question')}
                  className={`sub-tab-button ${
                    analyticsSubTab === 'by-question' ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>By Question</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Form Preview Content */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <PlayIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">How this form appears to users</span>
              </div>
              
              {/* Form Title and Description */}
              <div className="mb-10 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h3>
                {form.description && (
                  <p className="text-gray-700 leading-relaxed text-lg">{form.description}</p>
                )}
                {form.dueDate && (
                  <div className="mt-6 flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-xl inline-flex">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Due: {new Date(form.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Questions Preview */}
              <div className="space-y-6">
                {form.questions?.map((question, index) => (
                  <div key={question.id} className="card p-8 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-lg font-semibold text-white">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-semibold text-gray-900 leading-relaxed">{question.text}</h4>
                          {question.required && (
                            <span className="badge badge-red ml-4">Required</span>
                          )}
                        </div>

                        {/* Question Type Indicator */}
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                            {getQuestionTypeIcon(question.type)}
                            <span className="text-sm text-gray-600 capitalize font-medium">{question.type || 'text'}</span>
                          </div>
                        </div>

                        {/* Question Input Preview */}
                        <div className="mt-6">
                          {question.type === 'multiple-choice' || question.type === 'checkbox' ? (
                            <div className="space-y-3">
                              {question.options?.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                  <input
                                    type={question.type === 'checkbox' ? 'checkbox' : 'radio'}
                                    disabled
                                    className="text-blue-600 w-4 h-4"
                                  />
                                  <span className="text-gray-700 font-medium">{option}</span>
                                </label>
                              ))}
                            </div>
                          ) : question.type === 'rating' ? (
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button key={rating} disabled className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                                  ⭐
                                </button>
                              ))}
                              <span className="text-sm text-gray-500 ml-4 font-medium">1-5 rating scale</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {question.type === 'textarea' ? (
                                <textarea
                                  placeholder="User will type their response here..."
                                  disabled
                                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                                  rows={4}
                                />
                              ) : (
                                <input
                                  type="text"
                                  placeholder="User will type their response here..."
                                  disabled
                                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Access Control Info */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          {question.canSubjectAnswer && (
                            <span className="badge badge-blue">
                              <UserIcon className="w-3 h-3 mr-1" />
                              Subject can answer
                            </span>
                          )}
                          {question.evaluatorPositions?.length > 0 && (
                            <span className="badge badge-green">
                              <UsersIcon className="w-3 h-3 mr-1" />
                              Evaluators: {question.evaluatorPositions.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button Preview */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <button disabled className="btn btn-primary opacity-50 cursor-not-allowed mt-5">
                  <CheckCircleIcon className="w-4 h-4" />
                  Submit Evaluation
                </button>
                <p className="text-sm text-gray-500 mt-4">This is how the submit button will appear to users</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Overview Sub-Tab */}
            {analyticsSubTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPeopleAssigned}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                      </div>
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</p>
                      </div>
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <PresentationChartBarIcon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Response Activity</h3>
                  {!responses || responses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No responses submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.isArray(responses) && responses.slice(0, 5).map((response, index) => (
                        <div key={response._id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {response.participantEmail || 'Anonymous User'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Type: {response.participantType || 'Unknown'} | 
                                Submitted: {new Date(response.submittedAt || response.updatedAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedResponse(selectedResponse === response._id ? null : response._id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {selectedResponse === response._id ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                          
                          {selectedResponse === response._id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="space-y-3">
                                {form.questions?.map((question, qIndex) => {
                                  const answer = response.responses?.[question.id]
                                  if (!answer) return null
                                  
                                  return (
                                    <div key={question.id} className="bg-white rounded p-3 border">
                                      <h5 className="font-medium text-gray-800 mb-2">
                                        Q{qIndex + 1}: {question.text}
                                      </h5>
                                      <p className="text-gray-700">
                                        {typeof answer === 'object' ? JSON.stringify(answer) : answer}
                                      </p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {responses.length > 5 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Showing 5 of {responses.length} responses. Use "By User" tab to view all.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* By User Sub-Tab */}
            {analyticsSubTab === 'by-user' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User-Based Analysis</h3>
                  
                  {/* User List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {assignments.map((assignment, index) => {
                      const userResponses = responses.filter(r => r.participantEmail === assignment.participantEmail)
                      const hasResponded = userResponses.length > 0
                      
                      return (
                        <div
                          key={assignment._id || index}
                          onClick={() => setSelectedUser(selectedUser === assignment.participantEmail ? null : assignment.participantEmail)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedUser === assignment.participantEmail
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {assignment.participantName || assignment.participantEmail}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {assignment.participantType || 'Unknown Role'}
                              </p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${
                              hasResponded ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {hasResponded ? `${userResponses.length} response(s)` : 'No responses yet'}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selected User Details */}
                  {selectedUser && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Responses from {selectedUser}
                      </h4>
                      
                      {(() => {
                        const userResponses = responses.filter(r => r.participantEmail === selectedUser)
                        
                        if (userResponses.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <p>No responses from this user yet</p>
                            </div>
                          )
                        }

                        return userResponses.map((response, responseIndex) => (
                          <div key={response._id || responseIndex} className="mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-800 mb-3">
                                Response #{responseIndex + 1} - {new Date(response.submittedAt || response.updatedAt).toLocaleString()}
                              </h5>
                              
                              <div className="space-y-4">
                                {form.questions?.map((question, qIndex) => {
                                  const answer = response.responses?.[question.id]
                                  
                                  return (
                                    <div key={question.id} className="bg-white p-3 rounded border">
                                      <h6 className="font-medium text-gray-700 mb-2">
                                        Q{qIndex + 1}: {question.text}
                                      </h6>
                                      <div className="text-gray-600">
                                        {answer ? (
                                          typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer
                                        ) : (
                                          <span className="text-gray-400 italic">No answer provided</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* By Question Sub-Tab */}
            {analyticsSubTab === 'by-question' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Question-Based Analysis</h3>
                  
                  {/* Question List */}
                  <div className="space-y-4 mb-6">
                    {form?.questions?.map((question, qIndex) => {
                      const questionResponses = responses.filter(r => r.responses?.[question.id])
                      const responseCount = questionResponses.length
                      const responseRate = assignments.length > 0 ? (responseCount / assignments.length * 100).toFixed(1) : 0
                      
                      return (
                        <div
                          key={question.id}
                          onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedQuestion === question.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Q{qIndex + 1}: {question.text}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Type: {question.type || 'text'}</span>
                                <span>Required: {question.required ? 'Yes' : 'No'}</span>
                                <span className={`font-medium ${responseCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {responseCount}/{assignments.length} responses ({responseRate}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getQuestionTypeIcon(question.type)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selected Question Details */}
                  {selectedQuestion && (
                    <div className="border-t pt-6">
                      {(() => {
                        const question = form.questions?.find(q => q.id === selectedQuestion)
                        const questionResponses = responses.filter(r => r.responses?.[selectedQuestion])
                        
                        if (!question) return null

                        return (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">
                              All Responses to: "{question.text}"
                            </h4>
                            
                            {questionResponses.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p>No responses to this question yet</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {questionResponses.map((response, responseIndex) => (
                                  <div key={response._id || responseIndex} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h5 className="font-medium text-gray-800">
                                          {response.participantEmail || 'Anonymous User'}
                                        </h5>
                                        <p className="text-sm text-gray-500">
                                          {response.participantType || 'Unknown'} • {new Date(response.submittedAt || response.updatedAt).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border">
                                      <div className="text-gray-700">
                                        {(() => {
                                          const answer = response.responses?.[selectedQuestion]
                                          if (!answer) return <span className="text-gray-400 italic">No answer provided</span>
                                          
                                          if (typeof answer === 'object') {
                                            return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(answer, null, 2)}</pre>
                                          }
                                          
                                          return answer
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormAnalyticsSimple
