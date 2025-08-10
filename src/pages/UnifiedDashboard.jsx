import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import CommonHeader from '../components/CommonHeader'
import {
  DocumentPlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const UnifiedDashboard = () => {
  const [userForms, setUserForms] = useState({ created: [], assignedForms: [] })
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalForms: 0,
    activeAssignments: 0,
    completedEvaluations: 0,
    pendingTasks: 0
  })
  const [evaluationTab, setEvaluationTab] = useState('pending') // 'pending' or 'completed'
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Refresh data when the page becomes visible again (user returns from evaluation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📊 Page became visible, refreshing dashboard data...')
        fetchDashboardData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('auth_user'))
      
      if (!user?.id) {
        setError('User session invalid')
        return
      }

      // Fetch user forms and assignments
      const [formsData, notificationsData] = await Promise.all([
        apiClient.getUserForms(user.id),
        apiClient.getUserNotifications(user.id)
      ])

      console.log('Dashboard data received:', { formsData, notificationsData })

      setUserForms({
        created: formsData?.createdForms || [],
        assignedForms: formsData?.assignedForms || []
      })
      
      setNotifications(notificationsData || [])

      // Calculate stats
      const totalForms = (formsData?.createdForms || []).length
      const activeAssignments = (formsData?.assignedForms || []).length
      const completedCount = (formsData?.assignedForms || []).filter(assignment => {
        return assignment.myStatus === 'completed'
      }).length
      const pendingCount = (formsData?.assignedForms || []).filter(assignment => {
        return assignment.myStatus === 'pending'
      }).length

      setStats({
        totalForms,
        activeAssignments,
        completedEvaluations: completedCount,
        pendingTasks: pendingCount
      })

    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Remove from local state (you can add API endpoint later)
      setNotifications(notifications.filter(n => n._id !== notificationId))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleEvaluationClick = (assignment) => {
    // Use the token provided by the backend
    if (assignment.myToken) {
      // Choose the right evaluation route based on form type
      if (assignment.formType === 'enhanced') {
        // Enhanced forms use the enhanced-evaluate route
        window.open(`/enhanced-evaluate/${assignment.myToken}`, '_blank')
      } else {
        // Legacy forms use the old routes
        if (assignment.myRole === 'subject') {
          window.open(`/evaluation/subject/${assignment.myToken}`, '_blank')
        } else {
          window.open(`/evaluation/evaluator/${assignment.myToken}`, '_blank')
        }
      }
    }
  }

  const handleViewResponse = (assignment) => {
    // For completed evaluations, open in view mode
    if (assignment.myToken) {
      if (assignment.formType === 'enhanced') {
        // Enhanced forms view mode
        navigate(`/enhanced-evaluate/${assignment.myToken}?mode=view`)
      } else {
        // Legacy forms view mode
        if (assignment.myRole === 'subject') {
          navigate(`/evaluation/subject/${assignment.myToken}?mode=view`)
        } else {
          navigate(`/evaluation/evaluator/${assignment.myToken}?mode=view`)
        }
      }
    }
  }

  const handleEditResponse = (assignment) => {
    // For completed evaluations with multiple responses allowed, open in edit mode
    if (assignment.myToken) {
      if (assignment.formType === 'enhanced') {
        // Enhanced forms edit mode
        navigate(`/enhanced-evaluate/${assignment.myToken}?mode=edit`)
      } else {
        // Legacy forms edit mode
        if (assignment.myRole === 'subject') {
          navigate(`/evaluation/subject/${assignment.myToken}?mode=edit`)
        } else {
          navigate(`/evaluation/evaluator/${assignment.myToken}?mode=edit`)
        }
      }
    }
  }

  // Force refresh dashboard data (for debugging)
  const forceRefresh = () => {
    console.log('🔄 Force refreshing dashboard data...')
    fetchDashboardData()
  }

  const getFilteredAssignments = () => {
    return userForms.assignedForms.filter(assignment => {
      const status = getAssignmentStatus(assignment)
      return evaluationTab === 'pending' ? status !== 'completed' : status === 'completed'
    })
  }

  const getAssignmentStatus = (assignment) => {
    return assignment.myStatus || 'pending'
  }

  const getStatusBadge = (assignment) => {
    const status = getAssignmentStatus(assignment)
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
    const now = new Date()
    const isOverdue = dueDate && dueDate < now && status === 'pending'

    if (status === 'completed') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircleIcon className="h-3 w-3" />
          <span>Completed</span>
        </span>
      )
    }

    if (isOverdue) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span>Overdue</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        <ClockIcon className="h-3 w-3" />
        <span>Pending</span>
      </span>
    )
  }

  const getRoleInAssignment = (assignment) => {
    return assignment.myRole === 'subject' ? 'Subject' : 'Evaluator'
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Common Header */}
      <CommonHeader />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your forms and evaluations</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={forceRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh Dashboard"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/create-form')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md"
              style={{isolation: 'isolate', position: 'relative', zIndex: 10}}
            >
              <DocumentPlusIcon className="h-4 w-4 inline mr-2" />
              Create Form
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created Forms</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalForms}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedEvaluations}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Created Forms Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Forms</h2>
                <span className="text-sm text-gray-500">{userForms.created.length} form(s)</span>
              </div>

              {userForms.created.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentPlusIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No forms created yet</h3>
                  <p className="text-gray-600 mb-6">Create your first evaluation form to get started</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/create-form-advanced')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                      Create Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userForms.created.map((form) => (
                    <div key={form._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              {form.questions?.length || 0} questions
                            </span>
                          </div>
                          {form.description && (
                            <p className="text-gray-600 text-sm mb-3">{form.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Status: {form.status || 'Active'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => navigate(`/form-analytics/${form._id}`)}
                            className="px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Form"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-6">
            {/* Assigned Evaluations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Evaluations</h3>
                <span className="text-sm text-gray-500">{userForms.assignedForms.length} assignment(s)</span>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setEvaluationTab('pending')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      evaluationTab === 'pending'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <ClockIcon className="h-4 w-4 inline mr-2" />
                    Pending ({userForms.assignedForms.filter(a => getAssignmentStatus(a) !== 'completed').length})
                  </button>
                  
                  <button 
                    onClick={() => setEvaluationTab('completed')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      evaluationTab === 'completed'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Completed ({userForms.assignedForms.filter(a => getAssignmentStatus(a) === 'completed').length})
                  </button>
                </nav>
              </div>

              {getFilteredAssignments().length === 0 ? (
                <div className="text-center py-8">
                  {evaluationTab === 'pending' ? (
                    <>
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No pending evaluations</p>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No completed evaluations</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAssignments().slice(0, 5).map((assignment) => (
                    <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{assignment.formTitle}</h4>
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {getRoleInAssignment(assignment)}
                            </span>
                            {assignment.formType === 'enhanced' && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                Enhanced
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {assignment.formType === 'enhanced' ? (
                              // Enhanced form description
                              assignment.myRole === 'evaluator' 
                                ? `Evaluate: ${assignment.subjectName} (Position ${assignment.evaluatorPosition})`
                                : 'Self-evaluation'
                            ) : (
                              // Legacy form description
                              assignment.myRole === 'evaluator' && assignment.formTitle
                                ? `Evaluate: ${assignment.formTitle}`
                                : 'Self-evaluation'
                            )}
                          </p>
                          {assignment.dueDate && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {getStatusBadge(assignment)}
                      </div>
                      
                      {/* Action buttons based on status */}
                      <div className="flex space-x-2">
                        {getAssignmentStatus(assignment) === 'pending' ? (
                          <button
                            onClick={() => handleEvaluationClick(assignment)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Start Evaluation
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewResponse(assignment)}
                              className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Response
                            </button>
                            {assignment.allowMultipleResponses && (
                              <button
                                onClick={() => handleEditResponse(assignment)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                                Edit Response
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <span className="text-sm text-gray-500">{notifications.filter(n => !n.read).length} unread</span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.read 
                          ? 'border-gray-200 bg-gray-50' 
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification._id)
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedDashboard
