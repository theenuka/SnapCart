import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowLeft, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../hooks/useStore'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
  const { register, isLoading, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    clearError()
    setErrors({})

    try {
      // Only send the fields that the backend expects
      const { confirmPassword: _, ...registrationData } = formData
      const success = await register(registrationData)
      if (success) navigate('/dashboard')
    } catch (error) {
      if (error.message && error.message.includes('email')) {
        setErrors({ email: error.message })
      } else {
        setErrors({ general: error.message || 'Registration failed. Please try again.' })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Real-time validation for better UX
    if (name === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }))
      }
    } else if (name === 'confirmPassword' && value && formData.password) {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }))
      }
    } else if (errors[name]) {
      // Clear other errors when user starts typing
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-lg border border-slate-200 dark:border-gray-800 rounded-2xl">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="w-16 h-16 bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-gray-900 dark:ring-gray-800">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Account
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Join SnapCart and start tracking your expenses
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                >
                  {errors.general}
                </motion.div>
              )}

              <Input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                error={errors.name}
                required
              />

              <Input
                type="email"
                name="email"
                placeholder="Enter your email (e.g., user@gmail.com)"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                error={errors.email}
                required
              />

              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                error={errors.password}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                error={errors.confirmPassword}
                required
              />

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-gray-600 bg-transparent"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                      className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                loading={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-300">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage