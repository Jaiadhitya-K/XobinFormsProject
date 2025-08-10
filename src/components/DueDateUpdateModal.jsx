import { useState, useEffect } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

const DueDateUpdateModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  assignments,
  users,
  form
}) => {
  const [subjectDueDates, setSubjectDueDates] = useState({})
  const [evaluatorDueDates, setEvaluatorDueDates] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && assignments.length > 0) {
      // Initialize due dates from existing assignments
      const subjectDates = {}
      const evaluatorDates = {}
      
      assignments.forEach(assignment => {
        if (assignment.subject?.userId && assignment.subject?.dueDate) {
          subjectDates[assignment.subject.userId.toString()] = 
            assignment.subject.dueDate.split('T')[0] // Convert to date input format
        }
        
        if (assignment.evaluatorTokens) {
          assignment.evaluatorTokens.forEach(evalToken => {
            if (evalToken.userId && evalToken.dueDate) {
              evaluatorDates[evalToken.userId.toString()] = 
                evalToken.dueDate.split('T')[0]
            }
          })
        }
      })

      setSubjectDueDates(subjectDates)
      setEvaluatorDueDates(evaluatorDates)
    }
  }, [isOpen, assignments])

  // Get all unique evaluators from form questions
  const getAllEvaluators = () => {
    if (!form?.questions) return []
    
    const evaluatorSet = new Set()
    
    form.questions.forEach(question => {
      // Check new granular permission system first
      if (question.evaluatorPermissions) {
        Object.keys(question.evaluatorPermissions).forEach(evalId => {
          const permission = question.evaluatorPermissions[evalId]
          // Only include evaluators who have some level of access (not 'none')
          if (permission && permission !== 'none') {
            evaluatorSet.add(evalId.toString())
          }
        })
      }
      
      // Fallback to old evaluators array format for backward compatibility
      if (question.evaluators && Array.isArray(question.evaluators)) {
        question.evaluators.forEach(evalId => evaluatorSet.add(evalId.toString()))
      }
    })
    
    console.log('📊 All evaluators found:', Array.from(evaluatorSet))
    return Array.from(evaluatorSet)
  }

  const getEvaluatorName = (evalId) => {
    const user = users.find(u => u._id.toString() === evalId.toString())
    return user?.name || 'Unknown'
  }

  const getSubjectName = (subjectId) => {
    const user = users.find(u => u._id.toString() === subjectId.toString())
    return user?.name || 'Unknown'
  }

  const handleSubjectDateChange = (subjectId, date) => {
    setSubjectDueDates(prev => ({
      ...prev,
      [subjectId.toString()]: date
    }))
  }

  const handleEvaluatorDateChange = (evalId, date) => {
    setEvaluatorDueDates(prev => ({
      ...prev,
      [evalId]: date
    }))
  }

  const handleConfirm = async () => {
    setLoading(true)
    
    const dueDateUpdates = {
      subjects: subjectDueDates,
      evaluators: evaluatorDueDates
    }
    
    await onConfirm(dueDateUpdates)
    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const getAssignedSubjects = () => {
    return assignments.map(assignment => assignment.subject?.userId).filter(Boolean)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <PencilIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Update Due Dates</h2>
                <p className="text-sm text-gray-600">Modify deadlines for subjects and evaluators</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Subject Due Dates */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <UserGroupIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Subject Due Dates</h3>
              <span className="text-sm text-gray-500">({getAssignedSubjects().length} subjects)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAssignedSubjects().map(subjectId => (
                <div key={subjectId} className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getSubjectName(subjectId)[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getSubjectName(subjectId)}</p>
                      <p className="text-xs text-gray-600">Subject</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-800">Due Date</label>
                    <input
                      type="date"
                      value={subjectDueDates[subjectId.toString()] || ''}
                      onChange={(e) => handleSubjectDateChange(subjectId, e.target.value)}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-purple-600">
                      Current: {formatDate(subjectDueDates[subjectId.toString()])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluator Due Dates */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <UsersIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Evaluator Due Dates</h3>
              <span className="text-sm text-gray-500">({getAllEvaluators().length} evaluators)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAllEvaluators().map(evalId => {
                // Find which questions this evaluator is assigned to
                const assignedQuestions = form?.questions?.filter(q => {
                  // Check new granular permission system first
                  if (q.evaluatorPermissions && q.evaluatorPermissions[evalId]) {
                    const permission = q.evaluatorPermissions[evalId]
                    return permission && permission !== 'none'
                  }
                  
                  // Fallback to old evaluators array format
                  return q.evaluators?.some(e => e.toString() === evalId)
                }) || []

                return (
                  <div key={evalId} className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getEvaluatorName(evalId)[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getEvaluatorName(evalId)}</p>
                        <p className="text-xs text-gray-600">
                          Evaluating {assignedQuestions.length} question{assignedQuestions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-green-800">Due Date</label>
                      <input
                        type="date"
                        value={evaluatorDueDates[evalId] || ''}
                        onChange={(e) => handleEvaluatorDateChange(evalId, e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-green-600">
                        Current: {formatDate(evaluatorDueDates[evalId])}
                      </p>
                    </div>

                    {/* Show assigned questions */}
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">Assigned Questions:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignedQuestions.map((q, idx) => (
                          <span key={q.id} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Q{form.questions.findIndex(fq => fq.id === q.id) + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Changes will be applied to all assignments
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Update Due Dates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DueDateUpdateModal
