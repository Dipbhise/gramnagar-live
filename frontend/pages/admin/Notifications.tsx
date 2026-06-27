import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { AlertCircle, Plus, Calendar, Clock, Bell, Trash2, Edit3, Pin } from 'lucide-react';
import CreateNotificationForm from './CreateNotificationForm';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import NotificationDetails from '../../components/NotificationDetails';

// Notification types as they would be in the backend enums
export type NotificationCategory = 'MEETING' | 'EVENT' | 'ALERT' | 'GENERAL' | 'HOLIDAY' | 'ANNOUNCEMENT';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface AdminNotification {
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
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getAdminNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchNotifications();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationsApi.deleteNotification(id.toString());
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage official announcements and notices</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Create Notification
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateNotificationForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedNotification(notification)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">{getCategoryIcon(notification.category)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    {notification.is_pinned && (
                      <Pin size={16} className="ml-2 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {notification.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    <span className="capitalize">{notification.category}</span>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(notification.effective_date).toLocaleDateString('en-IN')}
                    </div>
                    {!notification.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality would go here
                      alert('Edit functionality coming soon');
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500 mb-6">Create your first notification to keep citizens informed</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} className="mr-2" />
            Create Notification
          </button>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <NotificationDetails
                notification={selectedNotification}
                isAdminView={true}
                onDelete={() => handleDelete(selectedNotification.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;