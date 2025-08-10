import { useState, useEffect, useRef } from 'react'
// CSV parsing helper (no dependency, simple split, with user matching)
function parseMatrixCSV(text, availableUsers) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
  // Expect: [Subject Name, Subject Email, Evaluator 1 Name, Evaluator 1 Email, ...]
  return rows.map((cols, idx) => {
    const subjectName = cols[0] || '';
    const subjectEmail = cols[1] || '';
    // Find subject in availableUsers by email
    const subjectUser = availableUsers.find(u => u.email.toLowerCase() === subjectEmail.toLowerCase());
    let evaluators = [];
    for (let i = 2, pos = 1; i + 1 < cols.length; i += 2, pos++) {
      if (cols[i] && cols[i+1]) {
        // Find evaluator in availableUsers by email
        const evalUser = availableUsers.find(u => u.email.toLowerCase() === cols[i+1].toLowerCase());
        evaluators.push({
          position: pos,
          evaluatorId: evalUser ? evalUser._id : null,
          evaluatorName: cols[i],
          evaluatorEmail: cols[i+1]
        });
      }
    }
    return {
      id: `subject_csv_${idx}_${Date.now()}`,
      subjectId: subjectUser ? subjectUser._id : null,
      subjectName,
      subjectEmail,
      evaluators: evaluators.length ? evaluators : [{ position: 1, evaluatorId: null, evaluatorName: '', evaluatorEmail: '' }]
    };
  });
}
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../lib/api'
import CommonHeader from '../components/CommonHeader'
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const EnhancedFormCreator = () => {
  const [currentStep, setCurrentStep] = useState(1) // 1: Matrix Setup, 2: Questions, 3: Summary
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()
  const { formId } = useParams()

  // Form basic info
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    allowLateSubmissions: false,
    allowMultipleResponses: false,
    notifyOnCompletion: true
  })

  // Subject-Evaluator Matrix
  const [subjects, setSubjects] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])

  // Questions
  const [questions, setQuestions] = useState([])

  // UI State
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState({}) // Track which dropdowns are open

  useEffect(() => {
    fetchUsers()
    if (formId) {
      setIsEditing(true)
      loadExistingForm()
    }
  }, [formId])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setOpenDropdowns({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const users = await apiClient.getUsers()
      setAvailableUsers(users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingForm = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading existing form with ID:', formId)
      const form = await apiClient.getForm(formId)
      console.log('📋 Loaded form data:', form)
      
      if (form) {
        setFormData({
          title: form.title || '',
          description: form.description || '',
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString().split('T')[0] : '',
          allowLateSubmissions: form.allowLateSubmissions || false,
          allowMultipleResponses: form.allowMultipleResponses || false,
          notifyOnCompletion: form.notifyOnCompletion !== false,
          creator: form.creator || null
        })
        if (form.subjectMatrix) {
          console.log('📋 Setting subjects from subjectMatrix:', form.subjectMatrix)
          setSubjects(form.subjectMatrix)
        }
        if (form.questions) {
          console.log('📋 Setting questions:', form.questions)
          setQuestions(form.questions)
        }
        console.log('✅ Form loaded successfully')
      } else {
        console.warn('⚠️ No form data received')
      }
    } catch (error) {
      console.error('❌ Error loading form:', error)
      alert('Failed to load form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add new subject
  const addSubject = () => {
    const newSubject = {
      id: `subject_${Date.now()}`,
      subjectId: null,
      subjectName: '',
      subjectEmail: '',
      evaluators: [
        {
          position: 1,
          evaluatorId: null,
          evaluatorName: '',
          evaluatorEmail: ''
        }
      ] // Start with one evaluator, can add more
    }
    setSubjects([...subjects, newSubject])
  }

  // Remove subject
  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  // Get current user (form creator)
  const getCurrentUser = () => {
    const authUser = localStorage.getItem('auth_user')
    return authUser ? JSON.parse(authUser) : null
  }

  // Get users available for subject selection (exclude form creator)
  const getAvailableSubjectUsers = () => {
    const currentUser = getCurrentUser()
    return availableUsers.filter(user => user._id !== currentUser?.id)
  }

  // Get users available for evaluator selection (exclude form creator and selected subject)
  const getAvailableEvaluatorUsers = (subjectIndex) => {
    const currentUser = getCurrentUser()
    const selectedSubject = subjects[subjectIndex]
    const selectedSubjectIds = subjects.map(s => s.subjectId).filter(Boolean)
    
    return availableUsers.filter(user => 
      user._id !== currentUser?.id && // Exclude form creator
      user._id !== selectedSubject?.subjectId && // Exclude the subject being evaluated
      !selectedSubjectIds.includes(user._id) || user._id === selectedSubject?.subjectId // Don't exclude other subjects unless they're this subject
    )
  }

  // Check if user is already selected as a subject
  const isUserAlreadySubject = (userId) => {
    return subjects.some(s => s.subjectId === userId)
  }

  // Check if user can be selected as a subject (not form creator, not already a subject)
  const canUserBeSubject = (userId) => {
    const currentUser = getCurrentUser()
    return userId !== currentUser?.id && !isUserAlreadySubject(userId)
  }

  // Check if user can be evaluator for specific subject
  const canUserBeEvaluatorForSubject = (userId, subjectIndex) => {
    const currentUser = getCurrentUser()
    const selectedSubject = subjects[subjectIndex]
    
    return userId !== currentUser?.id && // Not form creator
           userId !== selectedSubject?.subjectId // Not the subject being evaluated (can't evaluate themselves)
    // Removed the restriction about being a subject elsewhere - users can be subjects and evaluators for different people
  }

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Dropdown controls
  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }))
  }

  const closeDropdown = (dropdownId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: false
    }))
  }

  // Select user for subject
  const selectSubjectUser = (subjectIndex, userId) => {
    if (!userId) {
      // Clear subject selection
      const newSubjects = [...subjects]
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        subjectId: null,
        subjectName: '',
        subjectEmail: ''
      }
      setSubjects(newSubjects)
      return
    }
    
    const user = availableUsers.find(u => u._id === userId)
    if (!user) return
    
    const newSubjects = [...subjects]
    newSubjects[subjectIndex] = {
      ...newSubjects[subjectIndex],
      subjectId: user._id,
      subjectName: user.name,
      subjectEmail: user.email
    }
    setSubjects(newSubjects)
  }

  // Select evaluator for subject
  const selectEvaluator = (subjectIndex, evaluatorPosition, userId) => {
    if (!userId) {
      // Clear evaluator selection
      const newSubjects = [...subjects]
      const evaluatorIndex = evaluatorPosition - 1
      newSubjects[subjectIndex].evaluators[evaluatorIndex] = {
        position: evaluatorPosition,
        evaluatorId: null,
        evaluatorName: '',
        evaluatorEmail: ''
      }
      setSubjects(newSubjects)
      return
    }
    
    const user = availableUsers.find(u => u._id === userId)
    if (!user) return
    
    const newSubjects = [...subjects]
    const evaluatorIndex = evaluatorPosition - 1
    newSubjects[subjectIndex].evaluators[evaluatorIndex] = {
      position: evaluatorPosition,
      evaluatorId: user._id,
      evaluatorName: user.name,
      evaluatorEmail: user.email
    }
    setSubjects(newSubjects)
  }

  // Remove evaluator
  const removeEvaluator = (subjectIndex, evaluatorPosition) => {
    const newSubjects = [...subjects]
    const evaluatorIndex = evaluatorPosition - 1
    newSubjects[subjectIndex].evaluators[evaluatorIndex] = {
      position: evaluatorPosition,
      evaluatorId: null,
      evaluatorName: '',
      evaluatorEmail: ''
    }
    setSubjects(newSubjects)
  }

  // Add evaluator to subject
  const addEvaluatorToSubject = (subjectIndex) => {
    const newSubjects = [...subjects]
    const currentEvaluators = newSubjects[subjectIndex].evaluators
    const nextPosition = currentEvaluators.length + 1
    
    newSubjects[subjectIndex].evaluators.push({
      position: nextPosition,
      evaluatorId: null,
      evaluatorName: '',
      evaluatorEmail: ''
    })
    setSubjects(newSubjects)
  }

  // Remove evaluator from subject
  const removeEvaluatorFromSubject = (subjectIndex, evaluatorPosition) => {
    const newSubjects = [...subjects]
    const evaluators = newSubjects[subjectIndex].evaluators
    
    if (evaluators.length > 1) { // Keep at least one evaluator
      newSubjects[subjectIndex].evaluators = evaluators
        .filter(e => e.position !== evaluatorPosition)
        .map((e, index) => ({ ...e, position: index + 1 })) // Reindex positions
    }
    setSubjects(newSubjects)
  }

  // Get all unique evaluator positions across all subjects
  const getAllEvaluatorPositions = () => {
    const positions = new Set()
    subjects.forEach(subject => {
      subject.evaluators.forEach(evaluator => {
        if (evaluator.evaluatorId) {
          positions.add(evaluator.position)
        }
      })
    })
    return Array.from(positions).sort((a, b) => a - b)
  }

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'text',
      required: true,
      canSubjectAnswer: false,
      evaluatorPositions: [], // Which evaluator positions can answer [1,2,3...]
      options: [] // For multiple choice
    }
    setQuestions([...questions, newQuestion])
  }

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  // Remove question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  // Toggle evaluator position for question
  const toggleEvaluatorPosition = (questionIndex, position) => {
    const newQuestions = [...questions]
    const question = newQuestions[questionIndex]
    
    if (question.evaluatorPositions.includes(position)) {
      question.evaluatorPositions = question.evaluatorPositions.filter(p => p !== position)
    } else {
      question.evaluatorPositions = [...question.evaluatorPositions, position].sort((a, b) => a - b)
    }
    
    setQuestions(newQuestions)
  }

  // Add option to multiple choice question
  const addQuestionOption = (questionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  // Update question option
  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  // Remove question option
  const removeQuestionOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.splice(optionIndex, 1)
    setQuestions(newQuestions)
  }

  // Validation functions
  const validateStep1 = () => {
    return formData.title.trim() && 
           subjects.length > 0 && 
           subjects.every(s => 
             s.subjectId && 
             s.evaluators.every(e => e.evaluatorId)
           )
  }

  const validateStep2 = () => {
    if (questions.length === 0) return false
    
    // Basic question validation
    const basicValidation = questions.every(q => 
      q.text.trim() && 
      (q.canSubjectAnswer || q.evaluatorPositions.length > 0)
    )
    
    if (!basicValidation) return false
    
    // Advanced validation: Ensure all evaluators get at least one question
    const allEvaluatorPositions = new Set()
    
    // Collect all evaluator positions across all subjects
    subjects.forEach(subject => {
      subject.evaluators.forEach(evaluator => {
        if (evaluator.evaluatorId) {
          allEvaluatorPositions.add(evaluator.position)
        }
      })
    })
    
    // Check if each evaluator position is assigned to at least one question
    for (const position of allEvaluatorPositions) {
      const hasQuestion = questions.some(q => 
        q.evaluatorPositions.includes(position)
      )
      if (!hasQuestion) {
        return false // This evaluator position has no questions assigned
      }
    }
    
    return true
  }

  // Navigation
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      alert('Please complete all required fields: form title, subjects, and assign evaluators to each subject.')
      return
    }
    
    if (currentStep === 2 && !validateStep2()) {
      // Check what specifically is wrong
      if (questions.length === 0) {
        alert('Please add at least one question.')
        return
      }
      
      const invalidQuestions = questions.filter(q => 
        !q.text.trim() || (!q.canSubjectAnswer && q.evaluatorPositions.length === 0)
      )
      if (invalidQuestions.length > 0) {
        alert('Please ensure all questions have text and are assigned to at least one participant.')
        return
      }
      
      // Check if all evaluators have at least one question
      const allEvaluatorPositions = new Set()
      subjects.forEach(subject => {
        subject.evaluators.forEach(evaluator => {
          if (evaluator.evaluatorId) {
            allEvaluatorPositions.add(evaluator.position)
          }
        })
      })
      
      const unassignedPositions = []
      for (const position of allEvaluatorPositions) {
        const hasQuestion = questions.some(q => q.evaluatorPositions.includes(position))
        if (!hasQuestion) {
          unassignedPositions.push(`Evaluator ${position}`)
        }
      }
      
      if (unassignedPositions.length > 0) {
        alert(`Please assign at least one question to: ${unassignedPositions.join(', ')}. All evaluators must have at least one question.`)
        return
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Save/Update form
  const saveForm = async () => {
    try {
      setSaving(true)
      
      const user = JSON.parse(localStorage.getItem('auth_user'))
      
      const formPayload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null,
        allowLateSubmissions: formData.allowLateSubmissions,
        allowMultipleResponses: formData.allowMultipleResponses,
        notifyOnCompletion: formData.notifyOnCompletion,
        formType: 'enhanced',
        subjectMatrix: subjects.map(s => ({
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          subjectEmail: s.subjectEmail,
          evaluators: s.evaluators.map(e => ({
            evaluatorId: e.evaluatorId,
            evaluatorName: e.evaluatorName,
            evaluatorEmail: e.evaluatorEmail,
            position: e.position
          }))
        })),
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          canSubjectAnswer: q.canSubjectAnswer,
          evaluatorPositions: q.evaluatorPositions,
          options: q.options
        })),
        createdBy: user.id
      }

      console.log('💾 Saving enhanced form:', formPayload)
      
      let response
      if (isEditing) {
        console.log('🔄 Updating existing form with ID:', formId)
        response = await apiClient.updateEnhancedForm(formId, formPayload)
        console.log('📝 Update response:', response)
      } else {
        console.log('🆕 Creating new form')
        response = await apiClient.createEnhancedForm(formPayload)
        console.log('📝 Create response:', response)
      }
      
      if (response.success) {
        console.log('✅ Form saved successfully')
        navigate('/dashboard')
      } else {
        console.error('❌ Form save failed:', response)
        throw new Error(response.message || 'Failed to save form')
      }
      
    } catch (error) {
      console.error('❌ Error saving form:', error)
      alert(`Failed to save form: ${error.message}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  // Step indicator
  const stepIndicator = (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center space-x-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            <div className={`ml-3 text-sm font-medium ${
              currentStep >= step ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step === 1 ? 'Subject-Evaluator Matrix' : step === 2 ? 'Questions & Assignments' : 'Summary & Publish'}
            </div>
            {step < 3 && (
              <ArrowRightIcon className="w-10 h-5 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CommonHeader 
        showBackButton={true}
        backUrl="/dashboard"
      />

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Global actions for form creator (edit mode only, top left below header) */}
        {isEditing && formData?.creator?.email === (JSON.parse(localStorage.getItem('auth_user')||'{}').email) && (
          <div className="flex justify-end mb-8">
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this form? This cannot be undone.')) {
                    try {
                      await apiClient.deleteForm(formId);
                      alert('Form deleted.');
                      navigate('/dashboard');
                    } catch (err) {
                      alert('Failed to delete form.');
                    }
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Duplicate this form and all assignments?')) {
                    try {
                      const res = await apiClient.duplicateForm(formId);
                      alert('Form duplicated. Redirecting to new form.');
                      navigate(`/form-preview/${res.newFormId}`);
                    } catch (err) {
                      alert('Failed to duplicate form.');
                    }
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Duplicate
              </button>
            </div>
          </div>
  )}
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isEditing ? `Edit Form: ${formData.title}` : "Create New Evaluation Form"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditing ? "Modify your evaluation form settings and assignments" : "Set up subjects, evaluators, and questions for your evaluation"}
          </p>
        </div>

        {stepIndicator}

        {/* Step 1: Subject-Evaluator Matrix */}
        {currentStep === 1 && (
          <div className="space-y-12">
            {/* Form Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Form Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter form title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form description"
                />
              </div>

              {/* Form Settings */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowLateSubmissions}
                      onChange={(e) => setFormData({ ...formData, allowLateSubmissions: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Allow late submissions after due date</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowMultipleResponses}
                      onChange={(e) => setFormData({ ...formData, allowMultipleResponses: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Allow participants to edit their responses after submission</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notifyOnCompletion}
                      onChange={(e) => setFormData({ ...formData, notifyOnCompletion: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Notify form creator when evaluations are completed</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Subject-Evaluator Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Subject-Evaluator Matrix</h2>
                <div className="flex gap-3">
                  <button
                    onClick={addSubject}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Subject
                  </button>
                  <label className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = evt => {
                          const text = evt.target.result;
                          const parsed = parseMatrixCSV(text, availableUsers);
                          if (parsed.length) setSubjects(parsed);
                          else alert('CSV format invalid or empty.');
                        };
                        reader.readAsText(file);
                        // Reset input so same file can be uploaded again if needed
                        e.target.value = '';
                      }}
                    />
                    Upload CSV
                  </label>
                </div>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-16">
                  <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <p className="text-gray-500 text-lg mb-6">No subjects added yet. Click "Add Subject" to get started.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {subjects.map((subject, subjectIndex) => (
                    <div key={subject.id} className="border border-gray-200 rounded-lg p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium text-gray-900">
                          Subject {subjectIndex + 1}
                        </h3>
                        <button
                          onClick={() => removeSubject(subjectIndex)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Subject Selection */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Subject
                        </label>
                        {subject.subjectId ? (
                          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                {getUserInitials(subject.subjectName)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{subject.subjectName}</div>
                                <div className="text-sm text-gray-600">{subject.subjectEmail}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => selectSubjectUser(subjectIndex, null)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => toggleDropdown(`subject-${subjectIndex}`)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left shadow-sm hover:border-gray-400 transition-colors flex items-center justify-between"
                            >
                              <span className="text-gray-500">Choose a subject...</span>
                              <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${openDropdowns[`subject-${subjectIndex}`] ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {openDropdowns[`subject-${subjectIndex}`] && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {getAvailableSubjectUsers().map((user) => {
                                  const canSelect = canUserBeSubject(user._id)
                                  const reason = !canSelect ? 
                                    (getCurrentUser()?.id === user._id ? 'Form Creator' : 'Already Selected') : ''
                                  
                                  return (
                                    <button
                                      key={`subject-${subjectIndex}-${user._id}`}
                                      type="button"
                                      onClick={() => {
                                        if (canSelect) {
                                          selectSubjectUser(subjectIndex, user._id)
                                          closeDropdown(`subject-${subjectIndex}`)
                                        }
                                      }}
                                      className={`w-full flex items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
                                        !canSelect ? 'opacity-50 cursor-not-allowed bg-gray-25' : 'cursor-pointer'
                                      }`}
                                      disabled={!canSelect}
                                    >
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                                        !canSelect 
                                          ? 'bg-gray-400' 
                                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                      }`}>
                                        {getUserInitials(user.name)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={`font-medium ${!canSelect ? 'text-gray-400' : 'text-gray-900'}`}>
                                          {user.name}
                                          {reason && (
                                            <span className="ml-2 text-xs font-normal text-red-500">
                                              ({reason})
                                            </span>
                                          )}
                                        </div>
                                        <div className={`text-sm truncate ${!canSelect ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {user.email}
                                        </div>
                                        <div className={`text-xs ${!canSelect ? 'text-gray-400' : 'text-gray-400'}`}>
                                          {user.department} • {user.jobTitle}
                                        </div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Evaluators Grid */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <label className="block text-sm font-medium text-gray-700">
                            Evaluators for {subject.subjectName || 'this subject'} ({subject.evaluators.length})
                          </label>
                          <button
                            onClick={() => addEvaluatorToSubject(subjectIndex)}
                            className="inline-flex items-center px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Evaluator
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {subject.evaluators.map((evaluator, evalIndex) => (
                            <div key={`subject-${subjectIndex}-evaluator-${evaluator.position}`} className="border border-gray-200 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-900">
                                  Evaluator {evaluator.position}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {evaluator.evaluatorId && (
                                    <button
                                      onClick={() => removeEvaluator(subjectIndex, evaluator.position)}
                                      className="p-1 text-gray-400 hover:text-red-600"
                                      title="Clear evaluator"
                                    >
                                      <XMarkIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  {subject.evaluators.length > 1 && (
                                    <button
                                      onClick={() => removeEvaluatorFromSubject(subjectIndex, evaluator.position)}
                                      className="p-1 text-red-400 hover:text-red-600"
                                      title="Remove evaluator position"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {evaluator.evaluatorId ? (
                                <div className="bg-purple-50 border border-purple-200 rounded p-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                      {getUserInitials(evaluator.evaluatorName)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{evaluator.evaluatorName}</div>
                                      <div className="text-xs text-gray-600">{evaluator.evaluatorEmail}</div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => toggleDropdown(`evaluator-${subjectIndex}-${evaluator.position}`)}
                                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left shadow-sm hover:border-gray-400 transition-colors flex items-center justify-between"
                                  >
                                    <span className="text-gray-500">Choose evaluator...</span>
                                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${openDropdowns[`evaluator-${subjectIndex}-${evaluator.position}`] ? 'rotate-180' : ''}`} />
                                  </button>
                                  
                                  {openDropdowns[`evaluator-${subjectIndex}-${evaluator.position}`] && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                      {availableUsers
                                        .filter(user => user._id !== getCurrentUser()?.id) // Exclude form creator
                                        .map((user) => {
                                          const canSelect = canUserBeEvaluatorForSubject(user._id, subjectIndex)
                                          const reason = !canSelect ? 
                                            (user._id === subjects[subjectIndex]?.subjectId ? 'Cannot Evaluate Self' : 'Form Creator') : ''
                                          
                                          return (
                                            <button
                                              key={`evaluator-${subjectIndex}-${evaluator.position}-${user._id}`}
                                              type="button"
                                              onClick={() => {
                                                if (canSelect) {
                                                  selectEvaluator(subjectIndex, evaluator.position, user._id)
                                                  closeDropdown(`evaluator-${subjectIndex}-${evaluator.position}`)
                                                }
                                              }}
                                              className={`w-full flex items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
                                                !canSelect ? 'opacity-50 cursor-not-allowed bg-gray-25' : 'cursor-pointer'
                                              }`}
                                              disabled={!canSelect}
                                            >
                                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4 ${
                                                !canSelect 
                                                  ? 'bg-gray-400' 
                                                  : 'bg-gradient-to-br from-green-500 to-teal-600'
                                              }`}>
                                                {getUserInitials(user.name)}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className={`font-medium text-sm ${!canSelect ? 'text-gray-400' : 'text-gray-900'}`}>
                                                  {user.name}
                                                  {reason && (
                                                    <span className="ml-2 text-xs font-normal text-red-500">
                                                      ({reason})
                                                    </span>
                                                  )}
                                                </div>
                                                <div className={`text-xs truncate ${!canSelect ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  {user.email}
                                                </div>
                                                <div className={`text-xs ${!canSelect ? 'text-gray-400' : 'text-gray-400'}`}>
                                                  {user.department} • {user.jobTitle}
                                                </div>
                                              </div>
                                            </button>
                                          )
                                        })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-8">
              <button
                onClick={nextStep}
                disabled={!validateStep1()}
                className={`mt-12 px-6 py-2 rounded-lg font-medium text-base transition-colors flex items-center ${
                  validateStep1()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Questions
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions & Assignments */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Questions & Assignment Control</h2>
                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {questions.map((question, questionIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Question {questionIndex + 1}
                        </h3>
                        <button
                          onClick={() => removeQuestion(questionIndex)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      {/* Question Type */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="text">Text Response</option>
                          <option value="rating">Rating Scale (1-5)</option>
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="yes-no">Yes/No</option>
                        </select>
                      </div>

                      {/* Multiple Choice Options */}
                      {question.type === 'multiple-choice' && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={`question-${questionIndex}-option-${optionIndex}`} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <button
                                  onClick={() => removeQuestionOption(questionIndex, optionIndex)}
                                  className="p-2 text-red-600 hover:text-red-700"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addQuestionOption(questionIndex)}
                              className="px-3 py-2 text-blue-600 hover:text-blue-700 text-sm flex items-center"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add Option
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Assignment Control */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Who can answer this question?</h4>
                        
                        <div className="space-y-4">
                          {/* Subject Option */}
                          <div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={question.canSubjectAnswer}
                                onChange={(e) => updateQuestion(questionIndex, 'canSubjectAnswer', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 font-medium">Subject can answer this question</span>
                            </label>
                          </div>

                          {/* Evaluator Options */}
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Evaluator positions that can answer:</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {getAllEvaluatorPositions().map((position) => {
                                return (
                                  <label key={position} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={question.evaluatorPositions.includes(position)}
                                      onChange={() => toggleEvaluatorPosition(questionIndex, position)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Evaluator {position}</span>
                                  </label>
                                )
                              })}
                            </div>
                            
                              {/* Quick selection buttons */}
                              <div className="mt-4 flex space-x-2 ml-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allPositions = getAllEvaluatorPositions()
                                    updateQuestion(questionIndex, 'evaluatorPositions', allPositions)
                                  }}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  All Evaluators
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(questionIndex, 'evaluatorPositions', [])}
                                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                  None
                                </button>
                              </div>
                          </div>
                        </div>

                        {/* Validation warning */}
                        {!question.canSubjectAnswer && question.evaluatorPositions.length === 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">⚠️ At least one participant type must be able to answer this question.</p>
                          </div>
                        )}
                      </div>

                      {/* Required Field */}
                      <div className="mt-4 pt-4 border-t">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required question</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back: Matrix
              </button>
              <button
                onClick={nextStep}
                disabled={!validateStep2()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  validateStep2()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Summary
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary & Publish */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Summary</h2>
              
              {/* Form Details Summary */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-gray-900">{formData.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total evaluator positions:</span>
                      <span className="ml-2 text-gray-900">{getAllEvaluatorPositions().length}</span>
                    </div>
                    {formData.dueDate && (
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className="ml-2 text-gray-900">{new Date(formData.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Total Subjects:</span>
                      <span className="ml-2 text-gray-900">{subjects.length}</span>
                    </div>
                  </div>
                  {formData.description && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-900">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject-Evaluator Matrix Summary */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subject-Evaluator Matrix</h3>
                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{subject.subjectName}</div>
                            <div className="text-sm text-gray-600">{subject.subjectEmail}</div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {subject.evaluators.length} evaluators
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {subject.evaluators.map((evaluator) => (
                          <div key={evaluator.position} className="bg-white border border-gray-200 rounded p-4">
                            <div className="text-sm font-medium text-gray-900">
                              Evaluator {evaluator.position}: {evaluator.evaluatorName}
                            </div>
                            <div className="text-xs text-gray-600">{evaluator.evaluatorEmail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Questions ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Q{index + 1}: {question.text}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {question.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {question.canSubjectAnswer && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Subject
                          </span>
                        )}
                        {question.evaluatorPositions.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Evaluators: {question.evaluatorPositions.join(', ')}
                          </span>
                        )}
                        {question.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back: Questions
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isEditing ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Form' : 'Publish Form'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedFormCreator
