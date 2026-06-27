
import api from './axios';

export const workerApi = {
  // Stats & Profile
  getStats: () => api.get('/worker/stats'),
  
  // History (completed tasks)
  getHistory: () => api.get('/worker/history'),
  
  // Active tasks
  getAssigned: () => api.get('/worker/complaints'),
  
  // Task actions
  startWork: (complaintId: string) => api.post(`/worker/complaints/${complaintId}/start`),
  completeWork: (complaintId: string, formData: FormData) => 
    api.post(`/worker/complaints/${complaintId}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
