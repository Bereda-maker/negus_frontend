import api from './api';
import { Product, Pagination } from '@/types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  condition?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  q?: string;
  [key: string]: unknown;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

export interface ProductPayload {
  title?: string;
  description?: string;
  category?: string;
  price?: number | string;
  isNegotiable?: boolean;
  condition?: string;
  city?: string;
  images?: File[];
  videos?: File[] | { url: string; publicId: string }[];
  aiAssisted?: boolean;
  [key: string]: unknown;
}

/**
 * Builds multipart/form-data for create/update.
 * Handles `images` as file arrays.
 * Handles `videos` as either file arrays or metadata arrays (from direct upload).
 */
const toFormData = (payload: ProductPayload = {}): FormData => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Handle image files
    if (key === 'images' && Array.isArray(value)) {
      (value as File[]).forEach((file) => formData.append('images', file));
      return;
    }

    // Handle videos:
    // - If value is an array of File objects (old method), append each file
    // - If value is an array of metadata objects (direct upload), stringify it
    if (key === 'videos' && Array.isArray(value)) {
      if (value.length > 0 && value[0] instanceof File) {
        (value as File[]).forEach((file) => formData.append('videos', file));
      } else {
        // Metadata: [{ url, publicId }] -> send as JSON string
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    // For deleteVideos (JSON string) or other fields
    if (typeof value === 'boolean') {
      formData.append(key, String(value));
    } else {
      formData.append(key, value as string | Blob);
    }
  });
  return formData;
};

const productService = {
  getProducts: (params?: ProductQueryParams): Promise<ProductListResponse> =>
    api.get('/products', { params }).then((res) => res.data),
  getProduct: (id: string): Promise<{ data: Product }> => api.get(`/products/${id}`).then((res) => res.data),
  getSimilarProducts: (id: string): Promise<{ data: Product[] }> =>
    api.get(`/products/${id}/similar`).then((res) => res.data),
  getMyListings: (params?: ProductQueryParams): Promise<ProductListResponse> =>
    api.get('/products/my-listings', { params }).then((res) => res.data),

  // No explicit multipart Content-Type on either call below -- axios/the
  // browser sets it automatically for FormData, including the boundary
  // param a hardcoded header would strip (see api.ts for the same fix).
  createProduct: (payload: ProductPayload): Promise<{ data: Product }> =>
    api.post('/products', toFormData(payload)).then((res) => res.data),

  updateProduct: (id: string, payload: ProductPayload): Promise<{ data: Product }> =>
    api.patch(`/products/${id}`, toFormData(payload)).then((res) => res.data),

  deleteProduct: (id: string): Promise<unknown> => api.delete(`/products/${id}`).then((res) => res.data),
  contactSeller: (id: string): Promise<unknown> => api.post(`/products/${id}/contact`).then((res) => res.data),
};

export default productService;