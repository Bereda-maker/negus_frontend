import { AxiosResponse } from 'axios';
import api from './api';

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  reviewer: { _id: string; name: string; avatar?: { url: string } | null };
  product?: string;
  seller?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ReviewPayload {
  productId?: string;
  sellerId?: string;
  rating: number;
  comment?: string;
  [key: string]: unknown;
}

export const reviewService = {
  createReview: (data: ReviewPayload): Promise<AxiosResponse<{ data: Review }>> => api.post('/reviews', data),
  getProductReviews: (productId: string): Promise<AxiosResponse<{ data: Review[] }>> =>
    api.get(`/reviews/product/${productId}`),
  getSellerReviews: (sellerId: string): Promise<AxiosResponse<{ data: Review[] }>> =>
    api.get(`/reviews/seller/${sellerId}`),
  updateReview: (id: string, data: Partial<ReviewPayload>): Promise<AxiosResponse<{ data: Review }>> =>
    api.patch(`/reviews/${id}`, data),
  deleteReview: (id: string): Promise<AxiosResponse<unknown>> => api.delete(`/reviews/${id}`),
};

export default reviewService;
