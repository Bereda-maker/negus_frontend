'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  Package,
  Flag,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import RequireAdmin from '@/components/common/RequireAdmin';
import PageLoader from '@/components/common/PageLoader';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import '@/i18n'; // ensure i18n initialised

// ============================================================
// TYPES (unchanged)
// ============================================================

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  totalReports: number;
}

interface Report {
  _id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reporter?: { name: string };
  listing?: { _id: string; title: string };
  createdAt: string;
}

interface Verification {
  _id: string;
  name: string;
  email: string;
  verification?: {
    document?: { url: string };
    documentType?: string;
    status: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
}

interface Withdrawal {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  seller?: { name: string };
  bankAccount?: { accountName: string; accountNumber: string };
  createdAt: string;
}

interface Revenue {
  totalPaid: number;
  commission: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  status: string;
  category?: { name: string };
  seller?: { name: string };
  images?: { url: string }[];
  createdAt: string;
}

interface Order {
  _id: string;
  amount: number;
  status: string;
  product?: { _id: string; title: string; images?: { url: string }[] };
  buyer?: { name: string };
  seller?: { name: string };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

type Tab = 'dashboard' | 'products' | 'orders' | 'reports' | 'verifications' | 'withdrawals' | 'blogs';

// ============================================================
// COMPONENT
// ============================================================

function AdminDashboardContent() {
  const { t } = useTranslation();

  // ---- State (unchanged) ----
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalReports: 0,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [revenue, setRevenue] = useState<Revenue>({ totalPaid: 0, commission: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [updating, setUpdating] = useState<string | null>(null);

  // ---- Products ----
  const [products, setProducts] = useState<Product[]>([]);
  const [productPagination, setProductPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [productFilters, setProductFilters] = useState<{ status: string; search: string }>({
    status: '',
    search: '',
  });
  const [productLoading, setProductLoading] = useState<boolean>(false);

  // ---- Orders ----
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPagination, setOrderPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [orderFilters, setOrderFilters] = useState<{ status: string; search: string }>({
    status: '',
    search: '',
  });
  const [orderLoading, setOrderLoading] = useState<boolean>(false);

  // ---- Blog form ----
  const [showBlogForm, setShowBlogForm] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogForm, setBlogForm] = useState<{
    title: string;
    body: string;
    excerpt: string;
    coverImage: string;
    tags: string;
  }>({
    title: '',
    body: '',
    excerpt: '',
    coverImage: '',
    tags: '',
  });
  const [isBlogSubmitting, setIsBlogSubmitting] = useState<boolean>(false);

  // ---- Effects (unchanged) ----
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, productFilters, productPagination.page, orderFilters, orderPagination.page]);

  // ---- Data fetching (unchanged) ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, verificationsRes, blogsRes, revenueRes, withdrawalsRes] =
        await Promise.all([
          api.get('/admin/stats'),
          api.get('/reports/admin'),
          api.get('/users/admin/verifications/pending'),
          api.get('/blog'),
          api.get('/orders/admin/revenue'),
          api.get('/orders/admin/withdrawals'),
        ]);
      setStats(statsRes.data.data);
      setReports(reportsRes.data.data);
      setVerifications(verificationsRes.data.data);
      setBlogs(blogsRes.data.data || []);
      setRevenue(revenueRes.data);
      setWithdrawals(withdrawalsRes.data.data);
    } catch {
      toast.error(t('admin.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams();
      if (productFilters.status) params.append('status', productFilters.status);
      if (productFilters.search) params.append('search', productFilters.search);
      const page = productPagination.page;
      const limit = productPagination.limit;
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await api.get(`/products/admin/all?${params.toString()}`);
      setProducts(res.data.data);
      setProductPagination(res.data.pagination || { page: 1, limit: 20, total: 0 });
    } catch {
      toast.error(t('admin.errors.productsLoadFailed'));
    } finally {
      setProductLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrderLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderFilters.status) params.append('status', orderFilters.status);
      if (orderFilters.search) params.append('search', orderFilters.search);
      const page = orderPagination.page;
      const limit = orderPagination.limit;
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(res.data.data);
      setOrderPagination(res.data.pagination || { page: 1, limit: 20, total: 0 });
    } catch {
      toast.error(t('admin.errors.ordersLoadFailed'));
    } finally {
      setOrderLoading(false);
    }
  };

  // ---- Handlers (unchanged logic, but use t for toast messages) ----
  const handleProductStatusChange = async (productId: string, newStatus: string) => {
    if (!window.confirm(t('admin.products.confirmStatusChange', { status: newStatus }))) return;
    setUpdating(productId);
    try {
      await api.patch(`/products/admin/${productId}/status`, { status: newStatus });
      toast.success(t('admin.products.statusUpdated'));
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : t('admin.errors.statusUpdateFailed');
      toast.error(message);
    } finally {
      setUpdating(null);
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    if (!window.confirm(t('admin.orders.confirmStatusChange', { status: newStatus }))) return;
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t('admin.orders.statusUpdated'));
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : t('admin.errors.statusUpdateFailed');
      toast.error(message);
    } finally {
      setUpdating(null);
    }
  };

  const handleReportAction = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setUpdating(reportId);
    try {
      await api.patch(`/reports/admin/${reportId}`, { status });
      toast.success(t(`admin.reports.${status}Success`));
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch {
      toast.error(t('admin.errors.actionFailed'));
    } finally {
      setUpdating(null);
    }
  };

  const handleVerification = async (userId: string, approve: boolean) => {
    setUpdating(userId);
    try {
      await api.patch(`/users/admin/verifications/${userId}`, { approve });
      toast.success(approve ? t('admin.verifications.approveSuccess') : t('admin.verifications.rejectSuccess'));
      setVerifications((prev) => prev.filter((v) => v._id !== userId));
    } catch {
      toast.error(t('admin.errors.actionFailed'));
    } finally {
      setUpdating(null);
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    setUpdating(withdrawalId);
    try {
      await api.patch(`/orders/admin/withdrawals/${withdrawalId}`, { status });
      toast.success(t(`admin.withdrawals.${status}Success`));
      setWithdrawals((prev) => prev.filter((w) => w._id !== withdrawalId));
    } catch {
      toast.error(t('admin.errors.actionFailed'));
    } finally {
      setUpdating(null);
    }
  };

  // ---- Blog handlers ----
  const resetBlogForm = () => {
    setBlogForm({ title: '', body: '', excerpt: '', coverImage: '', tags: '' });
    setEditingBlog(null);
    setShowBlogForm(false);
  };

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsBlogSubmitting(true);
    try {
      const payload = {
        ...blogForm,
        tags: blogForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editingBlog) {
        await api.patch(`/blog/${editingBlog._id}`, payload);
        toast.success(t('admin.blogs.updateSuccess'));
      } else {
        await api.post('/blog', payload);
        toast.success(t('admin.blogs.createSuccess'));
      }
      const res = await api.get('/blog');
      setBlogs(res.data.data || []);
      resetBlogForm();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : t('admin.errors.blogSaveFailed');
      toast.error(message);
    } finally {
      setIsBlogSubmitting(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      body: blog.body,
      excerpt: blog.excerpt || '',
      coverImage: blog.coverImage || '',
      tags: blog.tags ? blog.tags.join(', ') : '',
    });
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm(t('admin.blogs.confirmDelete'))) return;
    setUpdating(blogId);
    try {
      await api.delete(`/blog/${blogId}`);
      toast.success(t('admin.blogs.deleteSuccess'));
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch {
      toast.error(t('admin.errors.deleteFailed'));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <PageLoader />;

  // ---- Translation helpers for statuses ----
  const productStatusOptions = [
    { value: 'active', label: t('admin.products.statuses.active') },
    { value: 'sold', label: t('admin.products.statuses.sold') },
    { value: 'pending', label: t('admin.products.statuses.pending') },
    { value: 'inactive', label: t('admin.products.statuses.inactive') },
    { value: 'removed', label: t('admin.products.statuses.removed') },
    { value: 'draft', label: t('admin.products.statuses.draft') },
  ];

  const orderStatusOptions = [
    { value: 'pending', label: t('admin.orders.statuses.pending') },
    { value: 'paid', label: t('admin.orders.statuses.paid') },
    { value: 'shipped', label: t('admin.orders.statuses.shipped') },
    { value: 'delivered', label: t('admin.orders.statuses.delivered') },
    { value: 'completed', label: t('admin.orders.statuses.completed') },
    { value: 'cancelled', label: t('admin.orders.statuses.cancelled') },
    { value: 'failed', label: t('admin.orders.statuses.failed') },
    { value: 'refunded', label: t('admin.orders.statuses.refunded') },
  ];

  const getStatusBadgeClass = (status: string, type: 'product' | 'order') => {
    const base = 'inline-block px-2 py-1 text-xs rounded-full';
    const map = {
      product: {
        active: 'bg-green-100 text-green-800',
        sold: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-red-100 text-red-800',
        removed: 'bg-red-200 text-red-800',
        draft: 'bg-blue-100 text-blue-800',
      },
      order: {
        completed: 'bg-green-100 text-green-800',
        paid: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800',
        shipped: 'bg-blue-100 text-blue-800',
        delivered: 'bg-blue-100 text-blue-800',
      },
    };
    const classes = type === 'product' ? map.product : map.order;
    return `${base} ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`;
  };

  const statCards = [
    { label: t('admin.stats.activeUsers'), value: stats.totalUsers || 0, icon: Users, color: 'bg-primary' },
    { label: t('admin.stats.listings'), value: stats.totalListings || 0, icon: Package, color: 'bg-gold' },
    { label: t('admin.stats.pendingReports'), value: stats.totalReports || 0, icon: Flag, color: 'bg-red-500' },
    { label: t('admin.stats.commission'), value: revenue.commission || 0, icon: DollarSign, color: 'bg-blue-600' },
  ];

  const productPage = productPagination.page;
  const productLimit = productPagination.limit;
  const productTotal = productPagination.total;
  const orderPage = orderPagination.page;
  const orderLimit = orderPagination.limit;
  const orderTotal = orderPagination.total;

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-playfair font-bold text-primary mb-8">{t('admin.title')}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-card shadow-card border border-border p-5 flex items-center gap-4"
            >
              <div className={`${card.color} rounded-full p-3 text-white`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{card.value}</div>
                <div className="text-xs text-textSecondary">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: t('admin.tabs.overview') },
            { id: 'products', label: `${t('admin.tabs.products')} (${stats.totalListings || 0})` },
            { id: 'orders', label: `${t('admin.tabs.orders')} (${stats.totalOrders || 0})` },
            { id: 'reports', label: `${t('admin.tabs.reports')} (${reports.length})` },
            { id: 'verifications', label: `${t('admin.tabs.verifications')} (${verifications.length})` },
            { id: 'withdrawals', label: `${t('admin.tabs.withdrawals')} (${withdrawals.filter((w) => w.status === 'pending').length})` },
            { id: 'blogs', label: `${t('admin.tabs.blogs')} (${blogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold text-white shadow-md'
                  : 'text-textSecondary hover:bg-warm-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <h2 className="text-lg font-bold text-primary mb-4">{t('admin.overview.title')}</h2>
            <p className="text-textSecondary">{t('admin.overview.welcome')}</p>
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-primary">{t('admin.products.title')}</h2>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder={t('admin.products.searchPlaceholder')}
                  value={productFilters.search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setProductFilters({ ...productFilters, search: e.target.value })
                  }
                  className="px-3 py-1 text-sm border border-border rounded-lg focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none"
                />
                <select
                  value={productFilters.status}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setProductFilters({ ...productFilters, status: e.target.value })
                  }
                  className="px-3 py-1 text-sm border border-border rounded-lg focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none"
                >
                  <option value="">{t('admin.products.statusAll')}</option>
                  {productStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProducts()}
                  className="border-gold text-gold hover:bg-gold hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> {t('admin.products.refresh')}
                </Button>
              </div>
            </div>
            {productLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              </div>
            ) : products.length === 0 ? (
              <EmptyState title={t('admin.products.noProducts')} description={t('admin.products.noProductsDesc')} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-warm-bg text-textSecondary">
                      <tr>
                        <th className="px-4 py-2 text-left">{t('admin.products.table.product')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.products.table.seller')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.products.table.price')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.products.table.status')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.products.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const statusLabel = productStatusOptions.find(o => o.value === product.status)?.label || product.status;
                        return (
                          <tr key={product._id} className="border-t border-border hover:bg-warm-bg/50 transition">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={product.images?.[0]?.url || '/placeholder.jpg'}
                                  alt={product.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium text-primary truncate max-w-[150px]">
                                    {product.title}
                                  </p>
                                  <p className="text-xs text-textSecondary">
                                    {product.category?.name || t('admin.products.uncategorized')}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2">{product.seller?.name || t('admin.products.unknown')}</td>
                            <td className="px-4 py-2">{product.price}</td>
                            <td className="px-4 py-2">
                              <span className={getStatusBadgeClass(product.status, 'product')}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={product.status}
                                onChange={(e) =>
                                  handleProductStatusChange(product._id, e.target.value)
                                }
                                disabled={updating === product._id}
                                className="text-xs border border-border rounded-lg px-2 py-1 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none disabled:opacity-50"
                              >
                                {productStatusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {updating === product._id && (
                                <span className="ml-2 text-xs text-textSecondary">{t('admin.products.updating')}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {productTotal > productLimit && (
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
                    <span className="text-sm text-textSecondary">
                      {t('admin.products.pagination.showing', {
                        start: (productPage - 1) * productLimit + 1,
                        end: Math.min(productPage * productLimit, productTotal),
                        total: productTotal,
                      })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setProductPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                        disabled={productPage <= 1}
                        className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-warm-bg transition"
                      >
                        {t('admin.products.pagination.prev')}
                      </button>
                      <button
                        onClick={() =>
                          setProductPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                        disabled={productPage >= Math.ceil(productTotal / productLimit)}
                        className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-warm-bg transition"
                      >
                        {t('admin.products.pagination.next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-primary">{t('admin.orders.title')}</h2>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder={t('admin.orders.searchPlaceholder')}
                  value={orderFilters.search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOrderFilters({ ...orderFilters, search: e.target.value })
                  }
                  className="px-3 py-1 text-sm border border-border rounded-lg focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none w-48"
                />
                <select
                  value={orderFilters.status}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setOrderFilters({ ...orderFilters, status: e.target.value })
                  }
                  className="px-3 py-1 text-sm border border-border rounded-lg focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none"
                >
                  <option value="">{t('admin.orders.statusAll')}</option>
                  {orderStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders()}
                  className="border-gold text-gold hover:bg-gold hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> {t('admin.orders.refresh')}
                </Button>
              </div>
            </div>
            {orderLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState title={t('admin.orders.noOrders')} description={t('admin.orders.noOrdersDesc')} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-warm-bg text-textSecondary">
                      <tr>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.orderId')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.product')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.buyer')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.seller')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.amount')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.status')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.date')}</th>
                        <th className="px-4 py-2 text-left">{t('admin.orders.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusLabel = orderStatusOptions.find(o => o.value === order.status)?.label || order.status;
                        return (
                          <tr key={order._id} className="border-t border-border hover:bg-warm-bg/50 transition">
                            <td className="px-4 py-2 font-mono text-xs">#{order._id.slice(-8)}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={order.product?.images?.[0]?.url || '/placeholder.jpg'}
                                  alt={order.product?.title}
                                  className="w-8 h-8 object-cover rounded"
                                />
                                <span className="truncate max-w-[100px]">
                                  {order.product?.title || t('admin.orders.na')}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2">{order.buyer?.name || t('admin.orders.unknown')}</td>
                            <td className="px-4 py-2">{order.seller?.name || t('admin.orders.unknown')}</td>
                            <td className="px-4 py-2 font-bold">{order.amount}</td>
                            <td className="px-4 py-2">
                              <span className={getStatusBadgeClass(order.status, 'order')}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-textSecondary">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(order._id, e.target.value)
                                }
                                disabled={updating === order._id}
                                className="text-xs border border-border rounded-lg px-2 py-1 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none disabled:opacity-50"
                              >
                                {orderStatusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {updating === order._id && (
                                <span className="ml-2 text-xs text-textSecondary">{t('admin.orders.updating')}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {orderTotal > orderLimit && (
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
                    <span className="text-sm text-textSecondary">
                      {t('admin.orders.pagination.showing', {
                        start: (orderPage - 1) * orderLimit + 1,
                        end: Math.min(orderPage * orderLimit, orderTotal),
                        total: orderTotal,
                      })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setOrderPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                        disabled={orderPage <= 1}
                        className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-warm-bg transition"
                      >
                        {t('admin.orders.pagination.prev')}
                      </button>
                      <button
                        onClick={() =>
                          setOrderPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                        disabled={orderPage >= Math.ceil(orderTotal / orderLimit)}
                        className="px-3 py-1 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-warm-bg transition"
                      >
                        {t('admin.orders.pagination.next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== REPORTS ===== */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <h2 className="text-lg font-bold text-primary mb-4">{t('admin.reports.title')}</h2>
            {reports.length === 0 ? (
              <EmptyState title={t('admin.reports.noReports')} description={t('admin.reports.noReportsDesc')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm-bg text-textSecondary">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('admin.reports.table.reporter')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.reports.table.listing')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.reports.table.reason')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.reports.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-t border-border">
                        <td className="px-4 py-2">{report.reporter?.name || t('admin.reports.unknown')}</td>
                        <td className="px-4 py-2">{report.listing?.title || t('admin.reports.deletedListing')}</td>
                        <td className="px-4 py-2">{report.reason}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleReportAction(report._id, 'resolved')}
                            isLoading={updating === report._id}
                          >
                            {t('admin.reports.resolve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report._id, 'dismissed')}
                            isLoading={updating === report._id}
                          >
                            {t('admin.reports.dismiss')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== VERIFICATIONS ===== */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <h2 className="text-lg font-bold text-primary mb-4">{t('admin.verifications.title')}</h2>
            {verifications.length === 0 ? (
              <EmptyState title={t('admin.verifications.noRequests')} description={t('admin.verifications.noRequestsDesc')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm-bg text-textSecondary">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('admin.verifications.table.name')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.verifications.table.email')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.verifications.table.document')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.verifications.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((user) => {
                      const docUrl = user.verification?.document?.url;
                      const docType = user.verification?.documentType || '';
                      const isImage = docUrl && /\.(jpeg|jpg|png|webp)$/i.test(docUrl);
                      return (
                        <tr key={user._id} className="border-t border-border">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">
                            {docUrl ? (
                              <div className="flex items-center gap-2">
                                {isImage ? (
                                  <img
                                    src={docUrl}
                                    alt={t('admin.verifications.documentAlt')}
                                    className="w-12 h-12 object-cover rounded border border-border"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-gold text-sm">📄 {docType || t('admin.verifications.documentLabel')}</span>
                                )}
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gold hover:underline text-xs"
                                >
                                  {t('admin.verifications.open')}
                                </a>
                              </div>
                            ) : (
                              <span className="text-textSecondary text-xs">{t('admin.verifications.noDocument')}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleVerification(user._id, true)}
                              isLoading={updating === user._id}
                            >
                              {t('admin.verifications.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleVerification(user._id, false)}
                              isLoading={updating === user._id}
                            >
                              {t('admin.verifications.reject')}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== WITHDRAWALS ===== */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <h2 className="text-lg font-bold text-primary mb-4">{t('admin.withdrawals.title')}</h2>
            {withdrawals.length === 0 ? (
              <EmptyState title={t('admin.withdrawals.noRequests')} description={t('admin.withdrawals.noRequestsDesc')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm-bg text-textSecondary">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('admin.withdrawals.table.seller')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.withdrawals.table.amount')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.withdrawals.table.bankAccount')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.withdrawals.table.status')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.withdrawals.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => {
                      const statusLabel = t(`admin.withdrawals.statuses.${w.status}`);
                      return (
                        <tr key={w._id} className="border-t border-border">
                          <td className="px-4 py-2">{w.seller?.name || t('admin.withdrawals.unknown')}</td>
                          <td className="px-4 py-2 font-bold">{w.amount}</td>
                          <td className="px-4 py-2">
                            {w.bankAccount?.accountName} <br />
                            <span className="text-xs text-textSecondary">
                              {w.bankAccount?.accountNumber}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`capitalize inline-block px-2 py-1 text-xs rounded-full ${
                                w.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : w.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            {w.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleWithdrawalAction(w._id, 'approved')}
                                  isLoading={updating === w._id}
                                >
                                  {t('admin.withdrawals.approve')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleWithdrawalAction(w._id, 'rejected')}
                                  isLoading={updating === w._id}
                                >
                                  {t('admin.withdrawals.reject')}
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== BLOGS ===== */}
        {activeTab === 'blogs' && (
          <div className="bg-white rounded-card shadow-card border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary">{t('admin.blogs.title')}</h2>
              <Button
                onClick={() => {
                  resetBlogForm();
                  setShowBlogForm(true);
                }}
                className="bg-gold hover:bg-gold-dark text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> {t('admin.blogs.newPost')}
              </Button>
            </div>

            {showBlogForm && (
              <div className="mb-6 p-4 bg-warm-bg rounded-card border border-border">
                <h3 className="font-semibold text-primary mb-3">
                  {editingBlog ? t('admin.blogs.editPost') : t('admin.blogs.createPost')}
                </h3>
                <form onSubmit={handleBlogSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('admin.blogs.titlePlaceholder')}
                    value={blogForm.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBlogForm({ ...blogForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                    required
                  />
                  <textarea
                    placeholder={t('admin.blogs.bodyPlaceholder')}
                    value={blogForm.body}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setBlogForm({ ...blogForm, body: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder={t('admin.blogs.excerptPlaceholder')}
                    value={blogForm.excerpt}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBlogForm({ ...blogForm, excerpt: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder={t('admin.blogs.coverImagePlaceholder')}
                    value={blogForm.coverImage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBlogForm({ ...blogForm, coverImage: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder={t('admin.blogs.tagsPlaceholder')}
                    value={blogForm.tags}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBlogForm({ ...blogForm, tags: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      isLoading={isBlogSubmitting}
                      className="bg-gold hover:bg-gold-dark text-white"
                    >
                      {editingBlog ? t('admin.blogs.update') : t('admin.blogs.publish')}
                    </Button>
                    <Button variant="outline" onClick={resetBlogForm}>
                      {t('admin.blogs.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {blogs.length === 0 ? (
              <EmptyState title={t('admin.blogs.noBlogs')} description={t('admin.blogs.noBlogsDesc')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm-bg text-textSecondary">
                    <tr>
                      <th className="px-4 py-2 text-left">{t('admin.blogs.table.title')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.blogs.table.slug')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.blogs.table.tags')}</th>
                      <th className="px-4 py-2 text-left">{t('admin.blogs.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="border-t border-border">
                        <td className="px-4 py-2 font-medium">{blog.title}</td>
                        <td className="px-4 py-2 text-textSecondary">{blog.slug}</td>
                        <td className="px-4 py-2 text-textSecondary">
                          {blog.tags?.join(', ') || '-'}
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBlog(blog)}>
                            <Edit className="h-3.5 w-3.5 mr-1" /> {t('admin.blogs.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteBlog(blog._id)}
                            isLoading={updating === blog._id}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> {t('admin.blogs.delete')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE EXPORT
// ============================================================

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <AdminDashboardContent />
    </RequireAdmin>
  );
}