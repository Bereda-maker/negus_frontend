'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import PageLoader from '@/components/common/PageLoader';
import RequireAuth from '@/components/common/RequireAuth';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { timeAgo } from '@/utils/formatter';
import { RefreshCw } from 'lucide-react';
import { Order } from '@/types';
import '@/i18n';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'];

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-red-100 text-red-800',
};

function SellerOrdersContent() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to get translated status label
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('sellerOrders.statuses.pending'),
      paid: t('sellerOrders.statuses.paid'),
      shipped: t('sellerOrders.statuses.shipped'),
      delivered: t('sellerOrders.statuses.delivered'),
      completed: t('sellerOrders.statuses.completed'),
      cancelled: t('sellerOrders.statuses.cancelled'),
    };
    return map[status] || status;
  };

  // Build status options with translated labels
  const statusOptions = STATUS_OPTIONS.map((status) => ({
    value: status,
    label: getStatusLabel(status),
  }));

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/seller-orders');
      setOrders(res.data.data || []);
    } catch {
      toast.error(t('sellerOrders.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/orders/earnings');
      setEarnings(res.data.total || 0);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEarnings();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
        fetchEarnings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), fetchEarnings()]);
    setRefreshing(false);
    toast.success(t('sellerOrders.toasts.refreshed'));
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (updating === orderId) return;
    const statusLabel = getStatusLabel(newStatus);
    if (!window.confirm(t('sellerOrders.confirmStatusChange', { status: statusLabel }))) return;

    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t('sellerOrders.toasts.statusUpdated', { status: statusLabel }));
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)));
      if (newStatus === 'completed' || newStatus === 'delivered') {
        fetchEarnings();
      }
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('sellerOrders.toasts.statusUpdateFailed'));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title={t('sellerOrders.emptyState.title')}
          description={t('sellerOrders.emptyState.description')}
        />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-playfair font-bold text-primary">{t('sellerOrders.title')}</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-card border border-border shadow-sm px-4 py-2">
              <span className="text-sm text-textSecondary">{t('sellerOrders.earningsLabel')}</span>
              <span className="text-xl font-bold text-gold ml-2">{(earnings || 0).toFixed(2)} ETB</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              className="border-gold text-gold hover:bg-gold hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> {t('sellerOrders.refreshButton')}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-card shadow-card border border-border p-4 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.product?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={order.product?.title}
                    className="w-16 h-16 object-cover rounded-card"
                  />
                  <div className="min-w-0">
                    <Link href={`/product/${order.product?._id}`} className="font-semibold text-primary hover:text-gold transition truncate block">
                      {order.product?.title || t('sellerOrders.unknownProduct')}
                    </Link>
                    <div className="text-sm text-textSecondary">
                      {t('sellerOrders.buyerLabel')}: {order.buyer?.name || t('sellerOrders.unknownBuyer')}
                    </div>
                    <div className="text-sm text-textSecondary">{order.amount} ETB</div>
                    <div className="text-xs text-textSecondary">{timeAgo(order.createdAt)}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${STATUS_BADGES[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-xs border border-border rounded-lg px-2 py-1 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none disabled:opacity-50"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {updating === order._id && (
                    <span className="text-xs text-textSecondary">{t('sellerOrders.updating')}</span>
                  )}
                  <Link href={`/orders/${order._id}`} className="text-gold text-sm hover:underline">
                    {t('sellerOrders.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <RequireAuth>
      <SellerOrdersContent />
    </RequireAuth>
  );
}