'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import favoriteService from '@/services/favoriteService';
import RequireAuth from '@/components/common/RequireAuth';
import { Product } from '@/types';
import '@/i18n';

interface FavoriteEntry {
  _id: string;
  product: Product;
}

function FavoritesContent() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getMyFavorites();
      setFavorites(res.data as unknown as FavoriteEntry[]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error(t('favorites.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await favoriteService.removeFavorite(productId);
      toast.success(t('favorites.toasts.removed'));
      setFavorites((prev) => prev.filter((fav) => fav.product._id !== productId));
    } catch (error) {
      console.error('Remove favorite error:', error);
      toast.error(t('favorites.errors.removeFailed'));
    }
  };

  // Helper to get translated status
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: t('favorites.statuses.active'),
      sold: t('favorites.statuses.sold'),
      pending: t('favorites.statuses.pending'),
      // fallback to original if not found
    };
    return statusMap[status] || status;
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
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-primary">{t('favorites.title')}</h1>
          <p className="text-textSecondary mt-1">{t('favorites.subtitle')}</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card border border-border p-12 text-center">
            <p className="text-textSecondary text-lg">{t('favorites.empty')}</p>
            <Link href="/" className="mt-4 inline-block text-gold hover:underline font-medium">
              {t('favorites.browseLink')} →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const product = fav.product;
              return (
                <div
                  key={fav._id}
                  className="bg-surface rounded-card shadow-card border border-border overflow-hidden hover:shadow-cardHover transition"
                >
                  <div className="bg-border">
                    {product.images && product.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt={product.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-textTertiary bg-cream">
                        {t('favorites.noImage')}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/product/${product._id}`}>
                      <h2 className="text-lg font-semibold text-primary hover:text-gold transition line-clamp-1">
                        {product.title}
                      </h2>
                    </Link>
                    <div className="text-sm text-textSecondary mt-1">
                      {product.city} • {product.price} ETB
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-pill ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                      <span className="text-xs text-textTertiary">
                        {(product.viewCount as number) || 0} {t('favorites.views')}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/product/${product._id}`}
                        className="flex-1 text-center bg-primary text-white px-3 py-1.5 rounded-button hover:bg-primary-light transition text-sm font-medium"
                      >
                        {t('favorites.viewButton')}
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(product._id)}
                        className="flex-1 text-center text-danger border border-danger px-3 py-1.5 rounded-button hover:bg-danger hover:text-white transition text-sm font-medium"
                      >
                        {t('favorites.removeButton')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}