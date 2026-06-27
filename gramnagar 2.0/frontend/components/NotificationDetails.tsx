import React from 'react';
import { Calendar, Clock, User, Pin, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { NotificationCategory, NotificationPriority } from '../pages/admin/Notifications';

interface NotificationDetailsProps {
  notification: {
    id: number;
    title: string;
    description: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    effective_date: string;
    expiry_date: string | null;
    is_active: boolean;
    is_pinned: boolean;
    created_by_name: string | null;
    created_at: string;
  };
  isAdminView?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const NotificationDetails: React.FC<NotificationDetailsProps> = ({
  notification,
  isAdminView = false,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    const icons: Record<NotificationCategory, string> = {
      MEETING: '👥',
      EVENT: '🎉',
      ALERT: '⚠️',
      GENERAL: '📢',
      HOLIDAY: '📅',
      ANNOUNCEMENT: '🔔'
    };
    return icons[category];
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    const colors: Record<NotificationPriority, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    const labels: Record<NotificationPriority, string> = {
      LOW: 'Low Priority',
      MEDIUM: 'Medium Priority',
      HIGH: 'High Priority',
      URGENT: 'Urgent'
    };
    return labels[priority];
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">{getCategoryIcon(notification.category)}</span>
            <h2 className="text-2xl font-bold text-gray-900">{notification.title}</h2>
            {notification.is_pinned && (
              <div className="ml-3 flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                <Pin size={14} className="mr-1" />
                Pinned
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
              {getPriorityLabel(notification.priority)}
            </span>
            <span className="capitalize">{notification.category}</span>
            {notification.created_by_name && (
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                {notification.created_by_name}
              </div>
            )}
          </div>
        </div>
        
        {isAdminView && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                <Edit3 size={14} className="mr-1" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-wrap">{notification.description}</p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-gray-600">
          <Calendar size={18} className="mr-2 text-blue-500" />
          <div>
            <div className="text-sm font-medium">Effective Date</div>
            <div className="text-sm">{formatDate(notification.effective_date)}</div>
          </div>
        </div>
        
        {notification.expiry_date && (
          <div className="flex items-center text-gray-600">
            <Clock size={18} className="mr-2 text-orange-500" />
            <div>
              <div className="text-sm font-medium">Expiry Date</div>
              <div className="text-sm">{formatDate(notification.expiry_date)}</div>
            </div>
          </div>
        )}
        
        {!notification.is_active && (
          <div className="flex items-center text-red-600 md:col-span-2">
            <AlertCircle size={18} className="mr-2" />
            <div>
              <div className="text-sm font-medium">Inactive</div>
              <div className="text-sm">This notification is currently inactive</div>
            </div>
          </div>
        )}
      </div>

      {/* Created At */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
        Created on {formatDate(notification.created_at)}
      </div>
    </div>
  );
};

export default NotificationDetails;