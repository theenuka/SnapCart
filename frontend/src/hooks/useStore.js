import { useAuthStore, useReceiptStore, useUIStore } from '../context/store'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

// Auth hook
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    initializeAuth
  } = useAuthStore()

  const handleLogin = useCallback(async (credentials) => {
    try {
      await login(credentials)
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.message || 'Login failed')
      return false
    }
  }, [login])

  const handleRegister = useCallback(async (userData) => {
    try {
      await register(userData)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      return false
    }
  }, [register])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
        } catch {
      toast.error('Logout failed')
    }
  }, [logout])

  const handleUpdateProfile = useCallback(async (userData) => {
    try {
      await updateProfile(userData)
      toast.success('Profile updated successfully!')
      return true
    } catch (error) {
      toast.error(error.message || 'Profile update failed')
      return false
    }
  }, [updateProfile])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    clearError,
    initializeAuth
  }
}

// Receipt hook
export const useReceipts = () => {
  const {
    receipts,
    currentReceipt,
    analytics,
    isLoading,
    error,
    uploadProgress,
    uploadReceipt,
    fetchReceipts,
    fetchReceipt,
    updateReceipt,
    deleteReceipt,
    fetchAnalytics,
    clearError,
    clearCurrentReceipt
  } = useReceiptStore()

  const handleUploadReceipt = useCallback(async (file) => {
    try {
      const result = await uploadReceipt(file)
      toast.success('Receipt uploaded successfully!')
      return result
    } catch (error) {
      toast.error(error.message || 'Upload failed')
      throw error
    }
  }, [uploadReceipt])

  const handleDeleteReceipt = useCallback(async (id) => {
    try {
      await deleteReceipt(id)
      toast.success('Receipt deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Delete failed')
      throw error
    }
  }, [deleteReceipt])

  const handleUpdateReceipt = useCallback(async (id, data) => {
    try {
      const result = await updateReceipt(id, data)
      toast.success('Receipt updated successfully!')
      return result
    } catch (error) {
      toast.error(error.message || 'Update failed')
      throw error
    }
  }, [updateReceipt])

  return {
    receipts,
    currentReceipt,
    analytics,
    isLoading,
    error,
    uploadProgress,
    uploadReceipt: handleUploadReceipt,
    fetchReceipts,
    fetchReceipt,
    updateReceipt: handleUpdateReceipt,
    deleteReceipt: handleDeleteReceipt,
    fetchAnalytics,
    clearError,
    clearCurrentReceipt
  }
}

// UI hook
export const useUI = () => {
  const {
    theme,
    sidebarOpen,
    notifications,
    loading,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading
  } = useUIStore()

  const showNotification = useCallback((message, type = 'info') => {
    addNotification({
      message,
      type,
      timestamp: new Date().toISOString()
    })
  }, [addNotification])

  const showSuccess = useCallback((message) => {
    toast.success(message)
    showNotification(message, 'success')
  }, [showNotification])

  const showError = useCallback((message) => {
    toast.error(message)
    showNotification(message, 'error')
  }, [showNotification])

  const showInfo = useCallback((message) => {
    toast(message)
    showNotification(message, 'info')
  }, [showNotification])

  return {
    theme,
    sidebarOpen,
    notifications,
    loading,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading,
    showNotification,
    showSuccess,
    showError,
    showInfo
  }
}