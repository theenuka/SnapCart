import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on API calls that are not auth endpoints and when not already on login
    const status = error.response?.status
    const isAuthPath = error.config?.url?.includes('/auth/') || error.config?.url?.includes('/users/')
    if (status === 401 && !isAuthPath) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      // Backend returns data.accessToken and data.user
      if (response.data.success && response.data.data) {
        const { accessToken, user } = response.data.data
        if (accessToken) {
          localStorage.setItem('token', accessToken)
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      // Backend returns data.accessToken and data.user
      if (response.data.success && response.data.data) {
        const { accessToken, user } = response.data.data
        if (accessToken) {
          localStorage.setItem('token', accessToken)
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' }
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData)
      if (response.data.success && response.data.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' }
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const response = await api.get('/auth/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user stats' }
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken })
      if (response.data.success && response.data.data?.accessToken) {
        localStorage.setItem('token', response.data.data.accessToken)
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' }
    }
  }
}

// Receipt API endpoints
export const receiptAPI = {
  // Upload receipt
  uploadReceipt: async (formData) => {
    try {
      const response = await api.post('/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Upload failed' }
    }
  },

  // Get all receipts
  getReceipts: async (params = {}) => {
    try {
      const response = await api.get('/receipts', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch receipts' }
    }
  },

  // Get receipt by ID
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/receipts/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch receipt' }
    }
  },

  // Update receipt
  updateReceipt: async (id, data) => {
    try {
      const response = await api.put(`/receipts/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update receipt' }
    }
  },

  // Delete receipt
  deleteReceipt: async (id) => {
    try {
      const response = await api.delete(`/receipts/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete receipt' }
    }
  },

  // Get analytics
  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/receipts/analytics', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch analytics' }
    }
  }
}

export default api