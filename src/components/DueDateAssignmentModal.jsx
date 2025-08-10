import { useState, useEffect } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const DueDateAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  formData, 
  users 
}) => {
  const [subjectDueDates, setSubjectDueDates] = useState({})
  const [evaluatorDueDates, setEvaluatorDueDates] = useState({})
  const [globalSubjectDueDate, setGlobalSubjectDueDate] = useState('')
  const [globalEvaluatorDueDate, setGlobalEvaluatorDueDate] = useState('')
  const [useGlobalDates, setUseGlobalDates] = useState(true)

  // Get all unique evaluators from all questions
  const getAllEvaluators = () => {
    const evaluatorSet = new Set()
    formData.questions.forEach(question => {
      question.evaluators.forEach(evalId => evaluatorSet.add(evalId.toString()))
    })
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

  const handleGlobalSubjectDateChange = (date) => {
    setGlobalSubjectDueDate(date)
    if (useGlobalDates) {
      const updatedDates = {}
      formData.selectedSubjects.forEach(subjectId => {
        updatedDates[subjectId.toString()] = date
      })
      setSubjectDueDates(updatedDates)
    }
  }

  const handleGlobalEvaluatorDateChange = (date) => {
    setGlobalEvaluatorDueDate(date)
    if (useGlobalDates) {
      const updatedDates = {}
      getAllEvaluators().forEach(evalId => {
        updatedDates[evalId] = date
      })
      setEvaluatorDueDates(updatedDates)
    }
  }

  const handleIndividualSubjectDateChange = (subjectId, date) => {
    setSubjectDueDates(prev => ({
      ...prev,
      [subjectId.toString()]: date
    }))
  }

  const handleIndividualEvaluatorDateChange = (evalId, date) => {
    setEvaluatorDueDates(prev => ({
      ...prev,
      [evalId]: date
    }))
  }

  const handleConfirm = () => {
    const dueDateAssignments = {
      subjects: subjectDueDates,
      evaluators: evaluatorDueDates,
      globalSubject: globalSubjectDueDate,
      globalEvaluator: globalEvaluatorDueDate
    }
    onConfirm(dueDateAssignments)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
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
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Due Dates</h2>
                <p className="text-sm text-gray-600">Set deadlines for subjects and evaluators before creating the form</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Global Date Settings */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={useGlobalDates}
                onChange={(e) => setUseGlobalDates(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-blue-900">Use Global Due Dates (Apply to All)</label>
            </div>

            {useGlobalDates && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Global Subject Due Date
                  </label>
                  <input
                    type="date"
                    value={globalSubjectDueDate}
                    onChange={(e) => handleGlobalSubjectDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Global Evaluator Due Date
                  </label>
                  <input
                    type="date"
                    value={globalEvaluatorDueDate}
                    onChange={(e) => handleGlobalEvaluatorDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subject Due Dates */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <UserGroupIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Subject Due Dates</h3>
              <span className="text-sm text-gray-500">({formData.selectedSubjects.length} subjects)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.selectedSubjects.map(subjectId => (
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
                      onChange={(e) => handleIndividualSubjectDateChange(subjectId, e.target.value)}
                      disabled={useGlobalDates}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        useGlobalDates 
                          ? 'bg-gray-100 border-gray-300 text-gray-500' 
                          : 'border-purple-300'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {subjectDueDates[subjectId.toString()] && (
                      <p className="text-xs text-purple-600">
                        Due: {formatDate(subjectDueDates[subjectId.toString()])}
                      </p>
                    )}
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
                const assignedQuestions = formData.questions.filter(q => 
                  q.evaluators.some(e => e.toString() === evalId)
                )

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
                        onChange={(e) => handleIndividualEvaluatorDateChange(evalId, e.target.value)}
                        disabled={useGlobalDates}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          useGlobalDates 
                            ? 'bg-gray-100 border-gray-300 text-gray-500' 
                            : 'border-green-300'
                        }`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {evaluatorDueDates[evalId] && (
                        <p className="text-xs text-green-600">
                          Due: {formatDate(evaluatorDueDates[evalId])}
                        </p>
                      )}
                    </div>

                    {/* Show assigned questions */}
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">Assigned Questions:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignedQuestions.map((q, idx) => (
                          <span key={q.id} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Q{formData.questions.findIndex(fq => fq.id === q.id) + 1}
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
              All dates must be in the future
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Confirm Due Dates & Create Form</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DueDateAssignmentModal
