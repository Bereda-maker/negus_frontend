import api from './api';
import { Category } from '@/types';

const categoryService = {
  getCategories: (): Promise<{ data: Category[] }> => api.get('/categories').then((res) => res.data),
};

export default categoryService;
