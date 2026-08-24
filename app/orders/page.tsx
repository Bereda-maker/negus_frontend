'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import PageLoader from '@/components/common/PageLoader';
import RequireAuth from '@/components/common/RequireAuth';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, timeAgo } from '@/utils/formatter';
import { Order } from '@/types';
import '@/i18n';

// Status styles (unchanged)
const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

function MyOrdersContent() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    api
      .get('/orders/my-orders')
      .then((res) => setOrders(res.data.data))
      .catch(() => toast.error(t('orders.errors.loadFailed')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Helper to get translated status label
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: t('orders.statuses.completed'),
      pending: t('orders.statuses.pending'),
      cancelled: t('orders.statuses.cancelled'),
      failed: t('orders.statuses.failed'),
      refunded: t('orders.statuses.refunded'),
      // fallback for any other status
    };
    return statusMap[status] || status;
  };

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title={t('orders.emptyState.title')} description={t('orders.emptyState.description')} />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">{t('orders.title')}</h1>
          <button onClick={fetchOrders} className="text-gold hover:underline text-sm">
            {t('orders.refresh')}
          </button>
        </div>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-card shadow-card border border-border p-4 flex flex-wrap items-center justify-between hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.product?.images?.[0]?.url || '/placeholder.jpg'}
                  alt={order.product?.title}
                  className="w-16 h-16 object-cover rounded-card"
                />
                <div>
                  <Link
                    href={`/product/${order.product?._id}`}
                    className="font-semibold text-primary hover:text-gold transition"
                  >
                    {order.product?.title || t('orders.unknownProduct')}
                  </Link>
                  <div className="text-sm text-textSecondary">
                    {t('orders.sellerLabel')}: {order.seller?.name || t('orders.unknownSeller')}
                  </div>
                  <div className="text-sm text-textSecondary">{formatCurrency(order.amount)} ETB</div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    STATUS_STYLES[order.status] || 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
                <div className="text-xs text-textSecondary mt-1">{timeAgo(order.createdAt)}</div>
                <Link href={`/orders/${order._id}`} className="text-gold text-sm hover:underline">
                  {t('orders.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <RequireAuth>
      <MyOrdersContent />
    </RequireAuth>
  );
}