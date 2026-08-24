import { AxiosResponse } from 'axios';
import api from './api';
import { User } from '@/types';

export const userService = {
  getUser: (id: string): Promise<AxiosResponse<{ data: User }>> => api.get(`/users/${id}`),

  // Fixed: backend route is PATCH /api/users/me, not /api/users/:id
  updateUser: (data: Partial<User>): Promise<AxiosResponse<{ data: User }>> =>
    api.patch('/users/me', data),

  uploadAvatar: (file: File): Promise<AxiosResponse<{ data: { avatar: { url: string; publicId: string } } }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    // No explicit Content-Type — let axios set the multipart boundary automatically
    return api.post('/users/avatar', formData);
  },

  uploadVerification: (
    file: File,
    documentType: 'nationalId' | 'passport' | 'driverLicense'
  ): Promise<AxiosResponse<{ data: { document: { url: string; publicId: string }; status: string } }>> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return api.post('/users/verification', formData);
  },
};

export default userService;