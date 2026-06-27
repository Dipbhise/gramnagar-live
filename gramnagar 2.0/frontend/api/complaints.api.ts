import api from './axios';

/* =========================
   Types
========================= */
export interface SubmitComplaintPayload {
  address: string;
  latitude: number;
  longitude: number;
  photo: File;
  village?: string;
  area?: string;
}

/* =========================
   API
========================= */
export const complaintsApi = {
  submit: (data: SubmitComplaintPayload) => {
    /* =========================
       HARD GUARDS
    ========================= */
    if (!data.address || !data.address.trim()) {
      throw new Error('Address is required');
    }

    if (typeof data.latitude !== 'number' || Number.isNaN(data.latitude)) {
      throw new Error('Valid latitude is required');
    }

    if (typeof data.longitude !== 'number' || Number.isNaN(data.longitude)) {
      throw new Error('Valid longitude is required');
    }

    if (!(data.photo instanceof File)) {
      throw new Error('Photo file is required');
    }

    /* =========================
       FORM DATA (MUST MATCH BACKEND)
    ========================= */
    const formData = new FormData();

    formData.append('address', data.address.trim());
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('photo', data.photo);

    // Optional fields — backend expects strings
    formData.append('village', data.village?.trim() ?? '');
    formData.append('area', data.area?.trim() ?? '');

    /* =========================
       REQUEST
    ========================= */
    return api.post('/complaints/submit', formData);
  },

  /** Citizen: list own complaints */
  getMyComplaints: () => api.get('/complaints/my'),

  /** Citizen: complaint detail */
  getById: (id: number) => api.get(`/complaints/${id}`),
};
