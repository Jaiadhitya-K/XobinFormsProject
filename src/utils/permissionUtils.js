/**
 * Utility functions for handling question permissions
 */

/**
 * Get visible questions for a subject based on their permissions
 * @param {Array} questions - All form questions
 * @param {string} subjectId - Subject user ID
 * @returns {Array} Filtered questions the subject can see
 */
export const getSubjectVisibleQuestions = (questions, subjectId) => {
  if (!questions || !subjectId) {
    console.log('❌ Missing questions or subjectId:', { questions: !!questions, subjectId })
    return []
  }
  
  console.log('🔍 Filtering questions for subject:', {
    subjectId,
    totalQuestions: questions.length,
    subjectIdType: typeof subjectId
  })
  
  const visibleQuestions = questions.filter(question => {
    const permission = question.subjectPermissions?.[subjectId] || 'none'
    const hasPermission = permission !== 'none'
    
    console.log(`📋 Question ${question.id || question._id}:`, {
      text: question.text?.substring(0, 30) + '...',
      subjectPermissions: question.subjectPermissions,
      permissionForUser: permission,
      isVisible: hasPermission,
      subjectIdInPermissions: Object.keys(question.subjectPermissions || {})
    })
    
    return hasPermission
  })
  
  console.log('✅ Filtered results:', {
    originalCount: questions.length,
    visibleCount: visibleQuestions.length,
    visibleQuestionIds: visibleQuestions.map(q => q.id || q._id)
  })
  
  return visibleQuestions
}

/**
 * Get visible questions for an evaluator based on their permissions
 * @param {Array} questions - All form questions
 * @param {string} evaluatorId - Evaluator user ID
 * @returns {Array} Filtered questions the evaluator can see
 */
export const getEvaluatorVisibleQuestions = (questions, evaluatorId) => {
  if (!questions || !evaluatorId) return []
  
  return questions.filter(question => {
    // Check if evaluator is assigned to this question
    const isAssigned = question.evaluators?.some(id => id.toString() === evaluatorId.toString())
    return isAssigned
  })
}

/**
 * Check if a subject can respond to a specific question
 * @param {Object} question - The question object
 * @param {string} subjectId - Subject user ID
 * @returns {boolean} True if subject can respond
 */
export const canSubjectRespond = (question, subjectId) => {
  const permission = question.subjectPermissions?.[subjectId] || 'none'
  return permission === 'respond'
}

/**
 * Check if a subject can view responses to a specific question
 * @param {Object} question - The question object
 * @param {string} subjectId - Subject user ID
 * @returns {boolean} True if subject can view responses
 */
export const canSubjectViewResponses = (question, subjectId) => {
  const permission = question.subjectPermissions?.[subjectId] || 'none'
  return permission === 'view' || permission === 'respond'
}

/**
 * Check if an evaluator can respond to a specific question
 * @param {Object} question - The question object
 * @param {string} evaluatorId - Evaluator user ID
 * @returns {boolean} True if evaluator can respond
 */
export const canEvaluatorRespond = (question, evaluatorId) => {
  const permission = question.evaluatorPermissions?.[evaluatorId] || 'view'
  return permission === 'respond'
}

/**
 * Check if an evaluator can view responses to a specific question
 * @param {Object} question - The question object
 * @param {string} evaluatorId - Evaluator user ID
 * @returns {boolean} True if evaluator can view responses
 */
export const canEvaluatorViewResponses = (question, evaluatorId) => {
  const permission = question.evaluatorPermissions?.[evaluatorId] || 'view'
  return permission === 'view' || permission === 'respond'
}

/**
 * Get the permission level for a subject on a specific question
 * @param {Object} question - The question object
 * @param {string} subjectId - Subject user ID
 * @returns {string} Permission level: 'none' | 'view' | 'respond'
 */
export const getSubjectPermission = (question, subjectId) => {
  return question.subjectPermissions?.[subjectId] || 'none'
}

/**
 * Get the permission level for an evaluator on a specific question
 * @param {Object} question - The question object
 * @param {string} evaluatorId - Evaluator user ID
 * @returns {string} Permission level: 'view' | 'respond'
 */
export const getEvaluatorPermission = (question, evaluatorId) => {
  return question.evaluatorPermissions?.[evaluatorId] || 'view'
}

/**
 * Filter questions and responses based on user permissions
 * @param {Array} questions - All form questions
 * @param {Array} responses - All responses
 * @param {string} userId - Current user ID
 * @param {string} userType - 'subject' | 'evaluator'
 * @returns {Object} { questions, responses } filtered by permissions
 */
export const filterByPermissions = (questions, responses, userId, userType) => {
  if (!questions || !userId || !userType) {
    return { questions: [], responses: [] }
  }

  let visibleQuestions
  if (userType === 'subject') {
    visibleQuestions = getSubjectVisibleQuestions(questions, userId)
  } else {
    visibleQuestions = getEvaluatorVisibleQuestions(questions, userId)
  }

  // Filter responses to only include those for visible questions
  const visibleQuestionIds = visibleQuestions.map(q => q.id)
  const filteredResponses = responses.filter(response => {
    return response.responses?.some(r => visibleQuestionIds.includes(r.questionId))
  })

  return {
    questions: visibleQuestions,
    responses: filteredResponses
  }
}

/**
 * Check if a user has any permissions on any questions
 * @param {Array} questions - All form questions
 * @param {string} userId - User ID
 * @param {string} userType - 'subject' | 'evaluator'
 * @returns {boolean} True if user has access to at least one question
 */
export const hasAnyAccess = (questions, userId, userType) => {
  if (!questions || !userId || !userType) return false

  if (userType === 'subject') {
    return questions.some(q => {
      const permission = q.subjectPermissions?.[userId] || 'none'
      return permission !== 'none'
    })
  } else {
    return questions.some(q => {
      return q.evaluators?.some(id => id.toString() === userId.toString())
    })
  }
}
