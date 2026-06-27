import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { AlertCircle, Bell, Calendar, Clock, Pin } from 'lucide-react';
import NotificationDetails from '../../components/NotificationDetails';
import type { NotificationCategory, NotificationPriority } from '../admin/Notifications';

interface CitizenNotification {
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

const CitizenNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<CitizenNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<CitizenNotification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getCitizenNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with important announcements</p>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedNotification(notification)}
            >
              <div className="flex items-start">
                {/* Icon */}
                <div className="flex-shrink-0 mr-4 mt-1">
                  <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {notification.title}
                    </h3>
                    {notification.is_pinned && (
                      <Pin size={16} className="ml-2 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {notification.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                    </span>
                    <span className="capitalize">{notification.category}</span>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(notification.effective_date)}
                    </div>
                    {notification.expiry_date && (
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        Expires {formatDate(notification.expiry_date)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Chevron */}
                <div className="flex-shrink-0 ml-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">There are currently no active notifications for your organization.</p>
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
                isAdminView={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenNotifications;