'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Star, Calendar, Package, ShieldCheck, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import EmptyState from '@/components/ui/EmptyState';
import ProductGrid from '@/components/marketplace/ProductGrid';
import TrustBadge from '@/components/marketplace/TrustBadge';
import ChatBox from '@/components/chat/ChatBox';
import { timeAgo } from '@/utils/formatter';
import { Seller, Product } from '@/types';
import '@/i18n';

export default function SellerProfilePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, isAuthenticated } = useAuth();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    userService
      .getUser(id)
      .then((res) => {
        const { seller, listings } = res.data.data as unknown as { seller: Seller; listings: Product[] };
        setSeller(seller);
        setListings(listings || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <PageLoader />;

  if (notFound || !seller) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title={t('sellerProfile.emptyState.title')}
          description={t('sellerProfile.emptyState.description')}
        />
      </div>
    );
  }

  const isOwnProfile = isAuthenticated && user?.id === seller._id;

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Seller header card */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar src={seller.avatar?.url} name={seller.name} size="xl" className="w-24 h-24 md:w-32 md:h-32" />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">{seller.name}</h1>
              <TrustBadge isVerified={seller.isVerifiedSeller} />
              {isOwnProfile && (
                <Badge variant="primary" className="ml-2">
                  {t('sellerProfile.youBadge')}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-textSecondary">
              {seller.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {seller.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {t('sellerProfile.joined', { time: timeAgo(seller.createdAt) })}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" /> {t('sellerProfile.salesCount', { count: seller.completedSalesCount || 0 })}
              </span>
            </div>
            {seller.bio && (
              <p className="mt-3 text-textSecondary text-sm max-w-lg mx-auto md:mx-0">{seller.bio}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-1 text-gold">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold text-primary">
                  {seller.avgRating ? seller.avgRating.toFixed(1) : t('sellerProfile.ratingNew')}
                </span>
                <span className="text-textSecondary text-sm">
                  {t('sellerProfile.reviewCount', { count: seller.reviewCount || 0 })}
                </span>
              </div>
              {seller.trustScore !== undefined && (
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-5 w-5 text-gold" />
                  <span className="text-sm font-medium text-primary">
                    {t('sellerProfile.trustScore', { score: seller.trustScore })}
                  </span>
                </div>
              )}
            </div>
            {!isOwnProfile && (
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href={`/search?seller=${seller._id}`}
                  className="text-sm bg-gold text-white px-4 py-2 rounded-full hover:bg-gold-dark transition"
                >
                  {t('sellerProfile.viewAllListings')}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className="border-gold text-gold hover:bg-gold hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {showChat ? t('sellerProfile.closeChat') : t('sellerProfile.chat')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 text-center border border-border shadow-sm">
            <div className="text-2xl font-bold text-primary">{seller.completedSalesCount || 0}</div>
            <div className="text-sm text-textSecondary">{t('sellerProfile.stats.completedSales')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-border shadow-sm">
            <div className="text-2xl font-bold text-primary">{seller.reviewCount || 0}</div>
            <div className="text-sm text-textSecondary">{t('sellerProfile.stats.reviews')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-border shadow-sm">
            <div className="text-2xl font-bold text-primary">
              {seller.avgRating ? seller.avgRating.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-textSecondary">{t('sellerProfile.stats.avgRating')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-border shadow-sm">
            <div className="text-2xl font-bold text-primary">
              {seller.trustScore !== undefined ? seller.trustScore : '—'}
            </div>
            <div className="text-sm text-textSecondary">{t('sellerProfile.stats.trustScore')}</div>
          </div>
        </div>

        {/* Chat box */}
        {showChat && !isOwnProfile && (
          <div className="mt-6">
            <ChatBox userId={seller._id} productId={null} onClose={() => setShowChat(false)} />
          </div>
        )}

        {/* Listings section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-gold" />
            {t('sellerProfile.listingsTitle', { name: seller.name })}
          </h2>
          {listings.length > 0 ? (
            <ProductGrid products={listings} />
          ) : (
            <div className="text-center py-10 text-textSecondary">
              {t('sellerProfile.noListings')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}