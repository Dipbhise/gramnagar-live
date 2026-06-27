import React, { useState } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { AlertCircle, Calendar, Clock, Bell, Pin } from 'lucide-react';
import { NotificationCategory, NotificationPriority } from './Notifications';

interface CreateNotificationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateNotificationForm: React.FC<CreateNotificationFormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    effective_date: '',
    expiry_date: '',
    is_pinned: false
    });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }

    // Validate dates
    if (formData.effective_date && formData.expiry_date) {
      const effectiveDate = new Date(formData.effective_date);
      const expiryDate = new Date(formData.expiry_date);
      if (effectiveDate >= expiryDate) {
        newErrors.expiry_date = 'Expiry date must be after effective date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Handle datetime conversion properly to preserve local time
      let effectiveDateISO;
      if (formData.effective_date) {
        // For datetime-local inputs, we need to preserve the local time
        const [datePart, timePart] = formData.effective_date.split('T');
        if (datePart && timePart) {
          // Create a date string that preserves local time
          effectiveDateISO = `${datePart}T${timePart}:00`;
        }
      }

      let expiryDateISO = null;
      if (formData.expiry_date) {
        const [datePart, timePart] = formData.expiry_date.split('T');
        if (datePart && timePart) {
          expiryDateISO = `${datePart}T${timePart}:00`;
        }
      }

      const notificationData = {
        ...formData,
        effective_date: effectiveDateISO,
        expiry_date: expiryDateISO
      };

      console.log('Sending notification data:', notificationData);

      await notificationsApi.createNotification(notificationData);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating notification:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Try to get a more detailed error message
      let errorMessage = 'Error creating notification';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors
          errorMessage = error.response.data.detail.map((err: any) => 
            `${err.loc?.join('.') || 'Field'}: ${err.msg}`
          ).join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'meeting', label: 'Meeting', icon: '👥' },
    { value: 'event', label: 'Event', icon: '🎉' },
    { value: 'alert', label: 'Alert', icon: '⚠️' },
    { value: 'general', label: 'General', icon: '📢' },
    { value: 'holiday', label: 'Holiday', icon: '📅' },
    { value: 'announcement', label: 'Announcement', icon: '🔔' }
    ];

    const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
    ];


  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Notification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter notification title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter notification description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('category', option.value)}
                  className={`p-3 rounded-lg border text-center transition ${
                    formData.category === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="space-y-2">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('priority', option.value)}
                  className={`w-full p-2 rounded-lg text-left transition ${
                    formData.priority === option.value
                      ? 'ring-2 ring-blue-500'
                      : 'border border-gray-300 hover:border-gray-400'
                  } ${option.color}`}
                >
                  <span className="font-medium capitalize">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Effective Date */}
          <div>
            <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                id="effective_date"
                value={formData.effective_date}
                onChange={(e) => handleChange('effective_date', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.effective_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.effective_date && <p className="text-red-500 text-sm mt-1">{errors.effective_date}</p>}
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                id="expiry_date"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiry_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.expiry_date && <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>}
          </div>
        </div>

        {/* Pinned Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_pinned"
            checked={formData.is_pinned}
            onChange={(e) => handleChange('is_pinned', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-700 flex items-center">
            <Pin size={16} className="mr-1" />
            Pin this notification (will appear at the top)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Bell size={18} className="mr-2" />
                Create Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotificationForm;