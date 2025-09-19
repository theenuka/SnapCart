import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Camera, 
  FileText, 
  ArrowLeft, 
  CheckCircle,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useNavigate } from 'react-router-dom'

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileUpload = async (files) => {
    setProcessing(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processed',
      data: {
        store: 'Demo Store',
        total: Math.floor(Math.random() * 200) + 20,
        items: Math.floor(Math.random() * 10) + 3,
        date: new Date().toLocaleDateString()
      }
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    setProcessing(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Upload Receipts</span>
          </div>
          
          <div className="w-20"></div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed m-6 p-12 rounded-2xl text-center transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-50 scale-105' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="space-y-6"
                >
                  {processing ? (
                    <div className="space-y-4">
                      <Loader2 className="w-16 h-16 text-purple-500 mx-auto animate-spin" />
                      <h3 className="text-2xl font-bold text-gray-900">Processing Receipt...</h3>
                      <p className="text-gray-600">Our AI is extracting data from your receipt</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {isDragging ? 'Drop your receipts here!' : 'Upload Your Receipts'}
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Drag and drop receipt images, or click to browse
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Choose Files
                        </Button>
                        <Button variant="secondary" size="lg" className="flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Take Photo
                        </Button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Supports JPG, PNG, PDF files up to 10MB each
                      </p>
                    </>
                  )}
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processed Files */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Processed Receipts ({uploadedFiles.length})
            </h3>
            
            <div className="grid gap-4">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-4 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{file.data.store}</h4>
                        <p className="text-sm text-gray-600">
                          ${file.data.total.toFixed(2)} • {file.data.items} items • {file.data.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="flex items-center gap-2"
              >
                View Dashboard
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UploadPage