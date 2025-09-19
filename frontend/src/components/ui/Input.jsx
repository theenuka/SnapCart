import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn'

const inputVariants = {
  default: 'input',
  glass: 'input-glass',
  minimal: 'w-full px-4 py-3 bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-200'
}

const Input = forwardRef(({ 
  type = 'text',
  variant = 'default',
  label,
  error,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          className={cn(
            inputVariants[variant],
            Icon && 'pl-10',
            (isPassword || RightIcon) && 'pr-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          // focus handlers removed to avoid unused state warnings
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {RightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <RightIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }