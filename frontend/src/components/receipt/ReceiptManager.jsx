import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Calendar, 
  DollarSign, 
  Tag, 
  X, 
  Image, 
  Check, 
  AlertCircle,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import { useReceipts, useUI } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Receipt Upload Component
export const ReceiptUpload = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { uploadReceipt } = useReceipts();
  const { showSuccess, showError } = useUI();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadReceipt(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      showSuccess('Receipt uploaded and processed successfully!');
      
      setTimeout(() => {
        if (onUpload) {
          onUpload(result);
        }
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
      showError(error.message || 'Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    setUploading(false);
    setUploadProgress(0);
    if (onClose) {
      onClose();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Upload Receipt</h3>
            <p className="text-sm text-gray-500 mt-1">
              Take a photo or upload an image of your receipt
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            /* Upload Area */
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleFileInput}
              />
              
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Drop your receipt here
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400">
                Supports JPEG, PNG, WebP (max 10MB)
              </p>
            </div>
          ) : (
            /* File Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Image className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadProgress < 100 ? 'Processing receipt with AI...' : 'Complete!'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                  {uploadProgress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-green-600"
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Receipt processed successfully!</span>
                    </motion.div>
                  )}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFile && !uploading && uploadProgress < 100 && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loading size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Upload Receipt'
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Receipt Card Component
export const ReceiptCard = ({ receipt, onView, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">{receipt.storeName || 'Unknown Store'}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(receipt.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span className="capitalize">{receipt.category || 'other'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {formatCurrency(receipt.total || 0)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {receipt.items?.length || 0} items
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView && onView(receipt)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit && onEdit(receipt)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete && onDelete(receipt)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Receipt List Component
export const ReceiptList = ({ receipts, isLoading, onView, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No receipts yet</h3>
        <p className="text-gray-500">Upload your first receipt to get started</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt._id}
          receipt={receipt}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};

// Main Receipt Manager Component
const ReceiptManager = () => {
  const { receipts, isLoading, fetchReceipts, deleteReceipt } = useReceipts();
  const { showSuccess, showError } = useUI();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  React.useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchReceipts(); // Refresh the list
  };

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setShowViewModal(true);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    showSuccess('Edit functionality coming soon!');
  };

  const handleDelete = async (receipt) => {
    if (window.confirm(`Are you sure you want to delete the receipt from ${receipt.storeName}?`)) {
      try {
        await deleteReceipt(receipt._id);
        showSuccess('Receipt deleted successfully');
        fetchReceipts();
      } catch {
        showError('Failed to delete receipt');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Receipts</h2>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Receipt
        </Button>
      </div>

      <ReceiptList
        receipts={receipts}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <ReceiptUpload
            onUpload={handleUploadSuccess}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Receipt Details"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Store</label>
                <p className="text-gray-900">{selectedReceipt.storeName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total</label>
                <p className="text-gray-900 text-xl font-bold">Rs. {selectedReceipt.total?.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{new Date(selectedReceipt.date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900 capitalize">{selectedReceipt.category}</p>
              </div>
            </div>
            
            {selectedReceipt.items && selectedReceipt.items.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Items</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedReceipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-900">{item.name}</span>
                      <span className="text-gray-600">Rs. {item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReceiptManager;