import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const cardVariants = {
  default: 'card',
  glass: 'card-glass',
  elevated: 'card shadow-2xl',
  flat: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6'
}

const Card = forwardRef(({ 
  children, 
  variant = 'default', 
  className = '',
  hover = false,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(cardVariants[variant], className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={cn('mb-4', className)} {...props}>
    {children}
  </div>
))

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ children, className = '', ...props }, ref) => (
  <h3 ref={ref} className={cn('text-xl font-semibold text-gray-900 dark:text-gray-100', className)} {...props}>
    {children}
  </h3>
))

CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef(({ children, className = '', ...props }, ref) => (
  <p ref={ref} className={cn('text-gray-600 dark:text-gray-400', className)} {...props}>
    {children}
  </p>
))

CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props}>
    {children}
  </div>
))

CardContent.displayName = 'CardContent'

const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
))

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }