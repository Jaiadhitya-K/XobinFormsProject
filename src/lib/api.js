const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    }

    // Add auth token if available (for demo purposes)
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      config.headers.Authorization = `Bearer demo-token`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // ========== AUTHENTICATION ==========
  
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // ========== USERS API ==========
  
  async getUsers() {
    return this.request('/users')
  }

  // Alias for compatibility
  async getAllUsers() {
    return this.getUsers()
  }

  // ========== FORMS API ==========
  
  async getForms() {
    return this.request('/forms')
  }

  async getForm(id) {
    return this.request(`/forms/${id}`)
  }

  async createForm(formData) {
    return this.request('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  }

  async updateForm(id, formData) {
    return this.request(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    })
  }

  async deleteForm(id) {
    return this.request(`/forms/${id}`, {
      method: 'DELETE',
    })
  }

  async duplicateForm(id) {
    return this.request(`/forms/${id}/duplicate`, {
      method: 'POST',
    })
  }

  // ========== USER FORMS ==========
  
  async getUserForms(userId) {
    return this.request(`/users/${userId}/forms`)
  }

  // ========== ASSIGNMENTS & RESPONSES ==========
  
  async getFormAssignments(formId) {
    return this.request(`/forms/${formId}/assignments`)
  }

  async getFormResponses(formId) {
    return this.request(`/forms/${formId}/responses`)
  }

  // ========== EVALUATION API ==========
  
  async getEvaluationForm(token) {
    return this.request(`/evaluate/${token}`)
  }

  async submitEvaluation(token, responses) {
    return this.request(`/evaluate/${token}`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    })
  }

  // ========== NOTIFICATIONS ==========
  
  async getUserNotifications(userId) {
    return this.request(`/notifications/${userId}`)
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  // ========== DASHBOARD & ANALYTICS ==========
  
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getReportsSummary() {
    return this.getDashboardStats()
  }

  async getFormReports(formId) {
    return this.getFormResponses(formId)
  }

  // ========== ADMIN UTILITIES ==========
  
  async clearAllData() {
    return this.request('/admin/clear-data', {
      method: 'DELETE',
    })
  }

  // ========== ENHANCED FORMS API ==========
  
  async createEnhancedForm(formData) {
    return this.request('/forms/enhanced', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  }

  async updateEnhancedForm(formId, formData) {
    return this.request(`/forms/enhanced/${formId}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    })
  }

  async getEnhancedEvaluation(token) {
    return this.request(`/enhanced-evaluate/${token}`)
  }

  async submitEnhancedEvaluation(token, data) {
    return this.request(`/enhanced-evaluate/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createSimpleForm(formData) {
    // Simple forms are unified under the main forms endpoint
    return this.createForm(formData)
  }

  async createMatrixForm(formData) {
    // Matrix forms are unified under the main forms endpoint
    return this.createForm(formData)
  }

  async getSimpleEvaluation(token) {
    return this.getEvaluationForm(token)
  }

  async submitSimpleEvaluation(token, data) {
    return this.submitEvaluation(token, data.responses || data)
  }

  async getMatrixEvaluation(token) {
    return this.getEvaluationForm(token)
  }

  async submitMatrixEvaluation(token, data) {
    return this.submitEvaluation(token, data.responses || data)
  }

  // Legacy assignment methods (deprecated)
  async assignForm(assignmentData) {
    console.warn('assignForm is deprecated. Use the unified form creation with subjectMatrix instead.')
    return { success: false, message: 'Legacy assignment method deprecated' }
  }

  async assignAdvancedForm(assignmentData) {
    console.warn('assignAdvancedForm is deprecated. Use the unified form creation with subjectMatrix instead.')
    return { success: false, message: 'Legacy assignment method deprecated' }
  }

  // Legacy evaluation methods (deprecated)
  async getAdvancedEvaluation(type, token) {
    console.warn('getAdvancedEvaluation is deprecated. Use getEvaluationForm instead.')
    return this.getEvaluationForm(token)
  }

  async submitAdvancedEvaluation(type, token, data) {
    console.warn('submitAdvancedEvaluation is deprecated. Use submitEvaluation instead.')
    return this.submitEvaluation(token, data.responses || data)
  }
}

export const apiClient = new ApiClient()
