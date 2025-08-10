import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient } from '../lib/api'
import CommonHeader from '../components/CommonHeader'
import {
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const EvaluationForm = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [responses, setResponses] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState('form') // 'form', 'view', 'edit', 'success'

  useEffect(() => {
    if (token) {
      fetchEvaluationData()
    }
  }, [token])

  useEffect(() => {
    // Check URL parameters for mode
    const urlMode = searchParams.get('mode')
    if (urlMode === 'view' || urlMode === 'edit') {
      setMode(urlMode)
    }
  }, [searchParams])

  const fetchEvaluationData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching evaluation data for token:', token)
      
      // Try enhanced evaluation endpoint first
      const data = await apiClient.getEnhancedEvaluation(token)
      
      console.log('📋 Raw API response:', data)
      console.log('📋 Form data:', data.form)
      console.log('📋 Assignment data:', data.assignment)
      console.log('📋 Questions in form:', data.form?.questions)
      console.log('📋 Questions count:', data.form?.questions?.length)
      console.log('📋 Participant type:', data.assignment?.participantType)
      console.log('📋 Assigned questions:', data.assignment?.assignedQuestions)
      
      if (data.success === false) {
        throw new Error(data.message || 'Evaluation not found')
      }
      
      setEvaluation(data)
      
      // If there's existing response data, populate the form
      if (data.existingResponse?.responses) {
        setResponses(data.existingResponse.responses)
        
        // Check if URL mode overrides the default behavior
        const urlMode = searchParams.get('mode')
        if (urlMode === 'view') {
          setMode('view')
        } else if (urlMode === 'edit') {
          setMode('edit')
        } else if (data.existingResponse.status === 'completed') {
          setMode('view')
        }
      } else {
        // No existing response, check URL mode
        const urlMode = searchParams.get('mode')
        if (urlMode === 'view' || urlMode === 'edit') {
          setMode(urlMode)
        }
      }
      
    } catch (err) {
      console.error('❌ Error fetching evaluation:', err)
      setError(err.message || 'Failed to load evaluation form')
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const validateResponses = () => {
    console.log('🔍 Starting validation...')
    console.log('🔍 Evaluation:', evaluation)
    console.log('🔍 Questions from evaluation?.questions:', evaluation?.questions)
    console.log('🔍 Questions from evaluation?.form?.questions:', evaluation?.form?.questions)
    
    // Use the same source as the form display
    const questions = evaluation?.form?.questions || []
    
    if (questions.length === 0) {
      console.log('❌ No questions found')
      return { isValid: false, errors: ['No questions available'] }
    }
    
    const errors = []
    const requiredQuestions = questions.filter(q => q.required)
    console.log('🔍 Required questions:', requiredQuestions)
    console.log('🔍 Current responses:', responses)
    
    requiredQuestions.forEach(question => {
      const hasResponse = responses[question.id] && responses[question.id].toString().trim() !== ''
      console.log(`🔍 Question ${question.id}: required=${question.required}, hasResponse=${hasResponse}, value="${responses[question.id]}"`)
      
      if (!hasResponse) {
        errors.push(`Please answer: ${question.text}`)
      }
    })
    
    console.log('🔍 Validation errors:', errors)
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🔥 SUBMIT BUTTON CLICKED!', { mode, submitting })
    console.log('🔥 Validation check starting...')
    
    const validation = validateResponses()
    console.log('🔥 Validation result:', validation)
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors)
      setError(validation.errors.join('\n'))
      return
    }
    
    console.log('✅ Validation passed, proceeding with submission...')
    
    try {
      setSubmitting(true)
      setError('')
      
      console.log('📤 Submitting evaluation responses:', responses)
      console.log('🔧 Submit mode:', mode)
      
      const submitData = {
        responses,
        participantId: evaluation.assignment.participantId,
        participantType: evaluation.assignment.participantType,
        subjectId: evaluation.assignment.subjectId,
        evaluatorPosition: evaluation.assignment.evaluatorPosition
      }
      
      const result = await apiClient.submitEnhancedEvaluation(token, submitData)
      
      if (result.success) {
        const message = result.updated ? 'Evaluation updated successfully!' : 'Evaluation submitted successfully!'
        setSuccess(message)
        setMode('success')
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        throw new Error(result.message || 'Failed to submit evaluation')
      }
      
    } catch (err) {
      console.error('❌ Error submitting evaluation:', err)
      setError(err.message || 'Failed to submit evaluation')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question) => {
    const value = responses[question.id] || ''
    
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your response..."
            disabled={mode === 'view'}
            required={question.required}
          />
        )
        
      case 'rating':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rating}
                    checked={value.toString() === rating.toString()}
                    onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={mode === 'view'}
                    required={question.required}
                  />
                  <span className="mt-2 text-sm font-medium text-gray-700">{rating}</span>
                </label>
              ))}
            </div>
          </div>
        )
        
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                  disabled={mode === 'view'}
                  required={question.required}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )
        
      case 'yes-no':
        return (
          <div className="flex space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                disabled={mode === 'view'}
                required={question.required}
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="no"
                checked={value === 'no'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                disabled={mode === 'view'}
                required={question.required}
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        )
        
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your response..."
            disabled={mode === 'view'}
            required={question.required}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading evaluation form...</p>
        </div>
      </div>
    )
  }

  if (error && !evaluation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CommonHeader showBackButton={true} backUrl="/" />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CommonHeader showBackButton={true} backUrl="/" />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Submitted!</h1>
            <p className="text-gray-600 mb-2">{success}</p>
            <p className="text-sm text-gray-500 mb-6">You will be redirected to the dashboard shortly...</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // The backend already filters questions based on assignment, so we just use them directly
  const availableQuestions = evaluation?.form?.questions || []

  console.log('🎯 Available questions for display:', availableQuestions)
  console.log('🎯 Questions count:', availableQuestions.length)
  console.log('🎯 Form data:', evaluation?.form)
  console.log('🎯 Assignment data:', evaluation?.assignment)
  console.log('🎯 Current mode:', mode)
  console.log('🎯 Responses state:', responses)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CommonHeader showBackButton={true} backUrl="/" />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{evaluation?.form?.title}</h1>
              {evaluation?.form?.description && (
                <p className="text-gray-600 mb-4">{evaluation.form.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-blue-600">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {evaluation?.assignment?.participantType === 'subject' ? 'Self-Evaluation' : 
                     `Evaluating: ${evaluation?.assignment?.subjectName} (Position ${evaluation?.assignment?.evaluatorPosition})`}
                  </span>
                </div>
                
                {evaluation?.form?.dueDate && (
                  <div className="flex items-center text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(evaluation.form.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {mode === 'view' && (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <EyeIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">View Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Please fix the following issues:</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.split('\n').map((line, index) => (
                    <div key={index}>• {line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Form */}
        {availableQuestions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
            <p className="text-gray-600">No questions are available for your participant type.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {availableQuestions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {index + 1}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {question.type}
                    </span>
                  </div>
                  <p className="text-gray-700">{question.text}</p>
                </div>
                
                {renderQuestion(question)}
              </div>
            ))}

            {/* Action Buttons */}
            {mode === 'view' ? (
              <div className="flex justify-between items-center pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
                
                {evaluation?.allowMultipleResponses && (
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Edit Response
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={() => console.log('🔥 Submit button clicked directly!')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {mode === 'edit' ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      {mode === 'edit' ? 'Update Evaluation' : 'Submit Evaluation'}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default EvaluationForm
