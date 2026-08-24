import api from './api';
import { Product, Pagination } from '@/types';

export interface FavoriteQueryParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

const favoriteService = {
  getMyFavorites: (params?: FavoriteQueryParams): Promise<{ data: Product[]; pagination: Pagination }> =>
    api.get('/favorites', { params }).then((res) => res.data),
  addFavorite: (productId: string): Promise<unknown> => api.post(`/favorites/${productId}`).then((res) => res.data),
  removeFavorite: (productId: string): Promise<unknown> =>
    api.delete(`/favorites/${productId}`).then((res) => res.data),
};

export default favoriteService;
