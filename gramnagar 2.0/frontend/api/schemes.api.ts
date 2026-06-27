
import api from './axios';
import { STORAGE_KEYS } from '../constants';

export const schemesApi = {
  getAll: async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.debug('[schemesApi] getAll - token:', token);
      const res = await api.get('/schemes');
      console.debug('[schemesApi] getAll - response-count:', Array.isArray(res.data) ? res.data.length : 'N/A', res.data?.slice?.(0,2));
      return res;
    } catch (err) {
      console.error('[schemesApi] getAll error', err);
      throw err;
    }
  },
  create: (data: any) => api.post('/schemes/admin', data),
  update: (id: string, data: any) => api.put(`/schemes/admin/${id}`, data),
  delete: (id: string) => api.delete(`/schemes/admin/${id}`),
  uploadGRPdf: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/schemes/admin/${id}/upload-gr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
