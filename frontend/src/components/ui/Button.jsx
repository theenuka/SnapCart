import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
  success: 'btn bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
}

const sizeVariants = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg'
}

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  // asChild is not used in this implementation; omitted to avoid lint warnings
  ...props 
}, ref) => {
  const Component = motion.button
  
  return (
    <Component
      ref={ref}
      className={cn(
        buttonVariants[variant],
        sizeVariants[size],
        loading && 'cursor-not-allowed opacity-70',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? { scale: 1.02 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </Component>
  )
})

Button.displayName = 'Button'

export { Button }