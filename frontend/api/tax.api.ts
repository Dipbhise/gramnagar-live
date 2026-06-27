import api from './axios';

export const taxApi = {
  // Admin endpoints
  getTaxTypes: () => api.get('/taxes/admin/types'),
  createTaxType: (data: any) => api.post('/taxes/admin/types', data),
  
  getCitizensInOrg: () => api.get('/taxes/admin/citizens'),
  getCitizenTaxes: (citizenId: number) => api.get(`/taxes/admin/citizens/${citizenId}/taxes`),
  assignTaxToCitizen: (citizenId: number, data: any) => 
    api.post(`/taxes/admin/citizens/${citizenId}/taxes`, data),
  
  // Citizen endpoints
  getMyTaxes: () => api.get('/taxes/citizen/my-taxes'),
  markTaxAsPaid: (taxId: number) => api.put(`/taxes/citizen/taxes/${taxId}/mark-paid`),
};
