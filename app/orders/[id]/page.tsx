'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import PageLoader from '@/components/common/PageLoader';
import RequireAuth from '@/components/common/RequireAuth';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, timeAgo } from '@/utils/formatter';
import { Order } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const ALL_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'failed', 'refunded'];

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || 'Order not found.');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Poll for status update if order is pending (after payment)
  useEffect(() => {
    if (!order || order.status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        const newOrder = res.data.data;
        if (newOrder.status !== 'pending') {
          setOrder(newOrder);
          clearInterval(interval);
          toast.success('Payment confirmed! Order is now ' + newOrder.status);
        }
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order, id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (updating) return;
    if (!window.confirm(`Change order status to "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Order not found" description="This order may have been removed." />
      </div>
    );
  }

  const isSeller = order.seller?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canUpdate = isSeller || isAdmin;

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Order Details</h1>
          <Link href="/orders" className="text-gold hover:underline text-sm">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-card shadow-card border border-border p-6 space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-border pb-4">
            <div>
              <p className="text-sm text-textSecondary">Order #{order._id.slice(-8)}</p>
              <p className="text-sm text-textSecondary">Placed {timeAgo(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  STATUS_STYLES[order.status] || 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.status}
              </span>
              {canUpdate && (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="text-xs border border-border rounded-lg px-2 py-1 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none disabled:opacity-50"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Cloudinary thumbnail */}
            <img
              src={order.product?.images?.[0]?.url || '/placeholder.jpg'}
              alt={order.product?.title}
              className="w-24 h-24 object-cover rounded-card border border-border"
            />
            <div className="flex-1">
              <Link href={`/product/${order.product?._id}`} className="font-semibold text-primary hover:text-gold transition">
                {order.product?.title || 'Product'}
              </Link>
              <p className="text-sm text-textSecondary">Price: {formatCurrency(order.amount)} ETB</p>
              <p className="text-sm text-textSecondary">Quantity: 1</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <h3 className="text-sm font-semibold text-primary">Buyer</h3>
              <p className="text-sm text-textSecondary">{order.buyer?.name || 'Unknown'}</p>
              <p className="text-sm text-textSecondary">{(order.buyer as any)?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">Seller</h3>
              <p className="text-sm text-textSecondary">{order.seller?.name || 'Unknown'}</p>
              <p className="text-sm text-textSecondary">{(order.seller as any)?.email}</p>
            </div>
          </div>

          {order.txRef && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-textSecondary">
                Transaction Ref: <span className="font-mono text-gold">{order.txRef}</span>
              </p>
              {order.paymentData && (
                <p className="text-sm text-textSecondary">
                  Payment Status: <span className="font-medium text-green-600">Completed</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <RequireAuth>
      <OrderDetailsContent />
    </RequireAuth>
  );
}
