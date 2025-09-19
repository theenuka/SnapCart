import { motion } from 'framer-motion'
import {
  Camera,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()
  const features = [
    {
      icon: Zap,
      title: "Instant Scanning",
      description: "AI-powered OCR extracts data from receipts in seconds",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Beautiful insights into your spending patterns and trends",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and stored with bank-level security",
      color: "from-purple-400 to-pink-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "SnapCart has revolutionized how I track my business expenses. The OCR is incredibly accurate!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Freelancer",
      content: "I love the analytics dashboard. It helps me understand my spending patterns like never before.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Student",
      content: "Perfect for tracking my monthly budget. The interface is so intuitive and beautiful.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black relative">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl flex items-center justify-center dark:bg-gray-900 dark:ring-gray-800">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-white">SnapCart</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Scan. Track.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Save Money.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transform your receipts into spending insights with AI-powered scanning and clean, straightforward analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm inline-flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Scanning
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm dark:bg-gray-900 dark:border-gray-800"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">What our users say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="text-center rounded-2xl border-slate-200 dark:border-gray-800">
                  <CardContent>
                    <div className="flex justify-center mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{testimonial.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-16 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Ready to get started?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">Join thousands already saving with SnapCart.</p>
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm inline-flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage