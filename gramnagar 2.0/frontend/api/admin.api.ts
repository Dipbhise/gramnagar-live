
import api from './axios';

export interface WorkerCreatePayload {
  name: string;
  email: string;
  password: string;
  village?: string;
  area?: string;
}

export const adminApi = {
  getAllComplaints: () => api.get('/admin/complaints'),
  assignWorker: (complaintId: string, workerId: string) => 
    api.post(`/admin/complaints/${complaintId}/assign/${workerId}`),
  getWorkers: () => api.get('/admin/workers'),
  createWorker: (data: WorkerCreatePayload) => api.post('/admin/workers', data),
};
