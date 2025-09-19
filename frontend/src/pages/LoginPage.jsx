import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../hooks/useStore'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    try {
      const success = await login(formData)
      if (success) navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store, but we can add additional handling here if needed
      console.error('Login error:', error)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
              <User className="w-8 h-8 text-blue-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome Back
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Sign in to your SnapCart account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />

              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-slate-300 dark:border-slate-600 bg-transparent"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                loading={isLoading}
                disabled={!formData.email || !formData.password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign up
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

export default LoginPage