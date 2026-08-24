import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'negus-gebeya_token';

/**
 * Single Axios instance for the whole app.
 * - Attaches JWT automatically
 * - Normalizes error messages
 * - Handles 401 by clearing session and redirecting to login
 *
 * CRA's `import.meta.env.VITE_API_URL` becomes Next's
 * `process.env.NEXT_PUBLIC_API_URL` -- see "Environment variables" in the
 * migration notes for the full REACT_APP_/VITE_ -> NEXT_PUBLIC_ mapping.
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // This file is imported by both client components (via AuthContext) and
  // could theoretically be pulled into a server context -- guard every
  // browser-only API so it never throws during SSR/build.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      // Clear the invalid/expired session, but do NOT force-navigate here.
      // This interceptor fires for every request app-wide, including the
      // background "is there a valid session?" check AuthContext runs on
      // every page load (including public ones like Home). A hard redirect
      // here was sending logged-out visitors to /login from ANY page just
      // because a stale token in localStorage got rejected. Actual
      // page-level protection is handled by middleware.ts (server-side)
      // and <RequireAuth>/<RequireAdmin> (client-side) -- this just cleans
      // up so the app knows the user is signed out.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('negus-gebeya_user');
        Cookies.remove(TOKEN_KEY);
      }
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;