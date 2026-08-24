// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  avatar?: {
    url: string;
  } | null; // Allow null just in case
  // Add any other fields your backend sends (e.g., phone, address)
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (payload: any) => Promise<User>; // You can refine 'any' later with a RegisterPayload type
  logout: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => void;
  loginWithToken: (token: string) => Promise<User>;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface Language {
  code: string;
  label: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface ProductImage {
  url: string;
  [key: string]: unknown;
}

export interface Seller {
  _id: string;
  name: string;
  avatar?: { url: string } | null;
  isVerifiedSeller?: boolean;
  isPhoneVerified?: boolean;
  trustScore?: number;
  city?: string;
  bio?: string;
  avgRating?: number;
  reviewCount?: number;
  completedSalesCount?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  city: string;
  condition: string;
  status: 'active' | 'sold' | 'pending' | 'removed' | 'draft';
  category?: string | { _id: string; name: string };
  images?: ProductImage[];
  videos?: { url: string; publicId?: string }[];
  isNegotiable?: boolean;
  seller?: Seller;
  aiAssisted?: boolean;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  slug?: string;
  [key: string]: unknown;
}

export interface Pagination {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination?: Pagination;
}

export interface Order {
  _id: string;
  product?: Product;
  seller?: Seller;
  buyer?: { _id: string; name: string };
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'refunded' | string;
  txRef?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  buyer?: { _id: string; name: string; avatar?: { url: string } | null };
  createdAt: string;
  [key: string]: unknown;
}