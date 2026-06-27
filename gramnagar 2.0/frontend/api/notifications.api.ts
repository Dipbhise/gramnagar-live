import api from './axios';

export const notificationsApi = {
  // Admin: Create notification
  createNotification: (data: any) => api.post('/notifications/', data),

  // Admin: Get all notifications
  getAdminNotifications: () => api.get('/notifications/admin'),

  // Admin: Get specific notification
  getAdminNotification: (id: string) => api.get(`/notifications/admin/${id}`),

  // Admin: Update notification
  updateNotification: (id: string, data: any) => api.put(`/notifications/admin/${id}`, data),

  // Admin: Delete notification
  deleteNotification: (id: string) => api.delete(`/notifications/admin/${id}`),

  // Citizen: Get active notifications
  getCitizenNotifications: () => api.get('/notifications/'),

  // Citizen: Get specific notification
  getCitizenNotification: (id: string) => api.get(`/notifications/${id}`),
};