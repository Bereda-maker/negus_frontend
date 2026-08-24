'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import productService from '@/services/productService';
import RequireAuth from '@/components/common/RequireAuth';
import { Product, Pagination } from '@/types';
import '@/i18n';

function MyListingsContent() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });

  // Translated status options
  const statusOptions = [
    { value: 'all', label: t('myListings.filterOptions.all') },
    { value: 'active', label: t('myListings.filterOptions.active') },
    { value: 'sold', label: t('myListings.filterOptions.sold') },
    { value: 'inactive', label: t('myListings.filterOptions.inactive') },
  ];

  // Helper to translate status badge
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: t('myListings.statuses.active'),
      sold: t('myListings.statuses.sold'),
      inactive: t('myListings.statuses.inactive'),
      // fallback
    };
    return map[status] || status;
  };

  const fetchListings = async (status = statusFilter, page = 1) => {
    try {
      setLoading(true);
      const res = await productService.getMyListings({
        page,
        limit: 12,
        status: status !== 'all' ? status : undefined,
      });
      setListings(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error('Fetch error:', error);
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || t('myListings.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchListings(status, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchListings(statusFilter, newPage);
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(t('myListings.confirmDelete', { title }))) return;
    try {
      await productService.deleteProduct(id);
      toast.success(t('myListings.toasts.deleteSuccess'));
      fetchListings(statusFilter, pagination.page);
    } catch (error) {
      console.error('Delete error:', error);
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || t('myListings.errors.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">{t('myListings.title')}</h1>
            <p className="text-textSecondary mt-1">{t('myListings.subtitle')}</p>
          </div>
          <Link href="/sell" className="bg-primary text-white px-6 py-3 rounded-button hover:bg-primary-light transition">
            {t('myListings.sellNew')}
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-pill transition ${
                statusFilter === option.value ? 'bg-primary text-white' : 'bg-transparent text-textSecondary hover:bg-cream'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {listings.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center">
            <p className="text-textSecondary text-lg">{t('myListings.empty.title')}</p>
            <Link href="/sell" className="mt-4 inline-block text-gold hover:underline font-medium">
              {t('myListings.empty.cta')} →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-surface rounded-card shadow-card border border-border overflow-hidden hover:shadow-cardHover transition"
                >
                  <div className="bg-border">
                    {listing.images && listing.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.images[0].url} alt={listing.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-textTertiary bg-cream">
                        {t('myListings.noImage')}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/product/${listing._id}`}>
                      <h2 className="text-lg font-semibold text-primary hover:text-gold transition line-clamp-1">{listing.title}</h2>
                    </Link>
                    <div className="text-sm text-textSecondary mt-1">
                      {listing.city} • {listing.price} ETB
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-pill ${
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : listing.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getStatusLabel(listing.status)}
                      </span>
                      <span className="text-xs text-textTertiary">
                        {(listing.viewCount as number) || 0} {t('myListings.views')}
                      </span>
                      <span className="text-xs text-textTertiary">
                        {(listing.favoritesCount as number) || 0} {t('myListings.favorites')}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/listing/${listing._id}/edit`}
                        className="flex-1 text-center text-gold border border-gold px-3 py-1.5 rounded-button hover:bg-gold hover:text-white transition text-sm font-medium"
                      >
                        {t('myListings.editButton')}
                      </Link>
                      <button
                        onClick={() => handleDelete(listing._id, listing.title)}
                        className="flex-1 text-center text-danger border border-danger px-3 py-1.5 rounded-button hover:bg-danger hover:text-white transition text-sm font-medium"
                      >
                        {t('myListings.deleteButton')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-button border border-border transition ${
                    pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cream'
                  }`}
                >
                  {t('myListings.pagination.prev')}
                </button>
                <span className="text-sm text-textSecondary">
                  {t('myListings.pagination.pageOf', { current: pagination.page, total: pagination.totalPages })}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-button border border-border transition ${
                    pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cream'
                  }`}
                >
                  {t('myListings.pagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsContent />
    </RequireAuth>
  );
}