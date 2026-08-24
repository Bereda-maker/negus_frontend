import { AxiosResponse } from 'axios';
import api from './api';

export interface Promotion {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export const promotionService = {
  getActivePromotion: (): Promise<AxiosResponse<{ data: Promotion | null }>> => api.get('/promotions/active'),
};

export default promotionService;
