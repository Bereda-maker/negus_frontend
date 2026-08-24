import api from './api';
import { Pagination } from '@/types';
import { ReportReason } from '@/utils/constants';

export interface Report {
  _id: string;
  product: string;
  reason: ReportReason;
  details?: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ReportPayload {
  productId: string;
  reason: ReportReason;
  details?: string;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

const reportService = {
  createReport: (payload: ReportPayload): Promise<{ data: Report }> =>
    api.post('/reports', payload).then((res) => res.data),
  getMyReports: (params?: ReportQueryParams): Promise<{ data: Report[]; pagination: Pagination }> =>
    api.get('/reports/my-reports', { params }).then((res) => res.data),
};

export default reportService;
