import api from './api';
import { User } from '@/types';

export interface AuthResponse {
  token: string;
  data: { user: User };
  [key: string]: unknown;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller';
  [key: string]: unknown;
}

const authService = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post('/auth/register', payload).then((res) => res.data),
  login: (payload: { email: string; password: string }): Promise<AuthResponse> =>
    api.post('/auth/login', payload).then((res) => res.data),
  logout: (): Promise<unknown> => api.post('/auth/logout').then((res) => res.data),
  getMe: (): Promise<{ data: { user: User } }> => api.get('/auth/me').then((res) => res.data),
  updateMe: (payload: Partial<User>): Promise<{ data: { user: User } }> =>
    api.patch('/auth/update-me', payload).then((res) => res.data),
  updatePassword: (payload: { currentPassword: string; newPassword: string }): Promise<unknown> =>
    api.patch('/auth/update-password', payload).then((res) => res.data),
};

export const socialLogin = (provider: string): void => {
  window.location.href = `${api.defaults.baseURL}/auth/${provider}`;
};

export default authService;
