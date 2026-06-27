import api from './axios';

export const certificatesApi = {
  // Get available certificate types
  getCertificateTypes: () => api.get('/certificates/types'),

  // Apply for a certificate
  applyForCertificate: (data: any) => api.post('/certificates/apply', data),

  // Apply for a certificate with supporting documents
  applyForCertificateWithDocs: (certificateTypeId: number, formData: string, documents: File[]) => {
    const formDataToSend = new FormData();
    formDataToSend.append('certificate_type_id', certificateTypeId.toString());
    formDataToSend.append('form_data', formData);
    
    // Append documents if any
    documents.forEach(file => {
      formDataToSend.append('supporting_documents', file);
    });
    
    return api.post('/certificates/apply', formDataToSend, {
      headers: {
        // Don't set Content-Type header when sending FormData - browser sets it automatically with boundary
      }
    });
  },

  // Get my certificate applications
  getMyApplications: () => api.get('/certificates/my-applications'),

  // Get specific application
  getApplicationById: (id: string) => api.get(`/certificates/applications/${id}`),

  // Download certificate (when approved)
  downloadCertificate: (id: string) => api.get(`/certificates/download/${id}`),

  // Admin: Get all applications
  getAllApplications: () => api.get('/certificates/admin/applications'),

  // Admin: Get application details
  getApplicationDetail: (id: string) => api.get(`/certificates/admin/applications/${id}`),

  // Admin: Review application
  reviewApplication: (id: string, data: any) => api.put(`/certificates/admin/applications/${id}/review`, data),

  // Admin: Get certificate types
  getAdminCertificateTypes: () => api.get('/certificates/admin/types'),

  // Admin: Create certificate type
  createCertificateType: (data: any) => api.post('/certificates/admin/types', data),

  // Admin: Update certificate type
  updateCertificateType: (id: string, data: any) => api.put(`/certificates/admin/types/${id}`, data),

  // Admin: Delete certificate type
  deleteCertificateType: (id: string) => api.delete(`/certificates/admin/types/${id}`),
};