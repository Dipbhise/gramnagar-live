// frontend/api/auth.api.ts
import api from './axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organization_type: string;
  village?: string;
  area?: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  role: 'citizen' | 'worker' | 'admin';
  organization: string;
  organization_name: string;
  user_id: number;
  name: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  role: string;
  organization: string;
}

export const authApi = {
  login: ({ email, password }: LoginPayload) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // REQUIRED by OAuth2
    formData.append('password', password);

    return api.post<LoginResponse>(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  },

  register: (data: RegisterPayload) => api.post<RegisterResponse>('/auth/register', data),
};
