import { AxiosResponse } from 'axios';
import api from './api';
import { Pagination } from '@/types';

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  author?: { name: string };
  viewCount?: number;
  tags?: string[];
  createdAt: string;
  [key: string]: unknown;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const blogService = {
  getPosts: (
    params?: BlogQueryParams
  ): Promise<AxiosResponse<{ data: BlogPost[]; pagination?: Pagination }>> =>
    api.get('/blog', { params }),
  getPost: (slug: string): Promise<AxiosResponse<{ data: BlogPost }>> => api.get(`/blog/${slug}`),
};

export default blogService;
