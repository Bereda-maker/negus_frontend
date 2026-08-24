'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  ShoppingBag,
  Star,
} from 'lucide-react';
import productService from '@/services/productService';
import favoriteService from '@/services/favoriteService';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, timeAgo } from '@/utils/formatter';
import { PRODUCT_CONDITION_LABELS, ProductCondition } from '@/utils/constants';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import EmptyState from '@/components/ui/EmptyState';
import ProductGrid from '@/components/marketplace/ProductGrid';
import TrustBadge from '@/components/marketplace/TrustBadge';
import ReportListingModal from '@/components/marketplace/ReportListingModal';
import StarRating from '@/components/ui/StarRating';
import api from '@/services/api';
import { Product, Review } from '@/types';
import '@/i18n';

export default function ProductDetailsContent() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');

  const [product, setProduct] = useState<Product | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [isContacting, setIsContacting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // --- helpers for translated labels ---
  const getConditionLabel = (condition: string) => {
    const map: Record<string, string> = {
      new: t('productDetails.conditions.new'),
      likeNew: t('productDetails.conditions.likeNew'),
      used: t('productDetails.conditions.used'),
      damaged: t('productDetails.conditions.damaged'),
    };
    return map[condition] || condition;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: t('productDetails.statuses.active'),
      sold: t('productDetails.statuses.sold'),
      pending: t('productDetails.statuses.pending'),
      inactive: t('productDetails.statuses.inactive'),
      removed: t('productDetails.statuses.removed'),
      draft: t('productDetails.statuses.draft'),
    };
    return map[status] || status;
  };

  // --- effects (unchanged, except toast messages translated) ---
  useEffect(() => {
    if (txRef && !paymentVerified) {
      api
        .get(`/orders/verify-payment?tx_ref=${txRef}`)
        .then((res) => {
          if (res.data.success) {
            const order = res.data.data;
            if (order.status === 'paid' || order.status === 'completed') {
              toast.success(t('productDetails.toasts.paymentConfirmed'));
              setPaymentVerified(true);
              router.push(`/orders/${order._id}`);
            } else {
              toast(order.message || t('productDetails.toasts.paymentNotVerified'));
            }
          }
        })
        .catch(() => toast.error(t('productDetails.toasts.paymentVerificationFailed')));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txRef, paymentVerified]);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setRevealedPhone(null);

    const fetchData = async () => {
      try {
        const [productRes, similarRes, reviewsRes] = await Promise.all([
          productService.getProduct(id),
          productService.getSimilarProducts(id),
          api
            .get(`/products/${id}/reviews`)
            .catch(() => ({ data: { data: { reviews: [], averageRating: 0, totalReviews: 0 } } })),
        ]);

        const p = (productRes.data as any).product ?? productRes.data;
        setProduct(p);
        setIsFavorited((productRes.data as any).isFavorited || false);
        setSimilar(similarRes.data || []);

        const reviewsData = reviewsRes.data?.data || { reviews: [], averageRating: 0, totalReviews: 0 };
        const reviewsArray: Review[] = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
        setReviews(reviewsArray);
        setAverageRating(reviewsData.averageRating || 0);
        setTotalReviews(reviewsData.totalReviews || 0);

        if (isAuthenticated && user && reviewsArray.length > 0) {
          const myReview = reviewsArray.find((r) => r.buyer?._id === user.id);
          if (myReview) {
            setUserReview(myReview);
            setRatingInput(myReview.rating);
            setCommentInput(myReview.comment || '');
            setShowReviewForm(false);
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, user]);

  // --- handlers (toasts translated) ---
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      next ? await favoriteService.addFavorite(id) : await favoriteService.removeFavorite(id);
    } catch {
      setIsFavorited(!next);
    }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    setIsContacting(true);
    try {
      const res = await productService.contactSeller(id) as any;
      const seller = res.data.seller;
      setRevealedPhone(seller?.phone || null);
      if (!seller?.phone) {
        toast.success(t('productDetails.toasts.sellerNotifiedNoPhone'));
      } else {
        toast.success(t('productDetails.toasts.contactRevealed'));
      }
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('productDetails.toasts.contactFailed'));
    } finally {
      setIsContacting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('productDetails.confirmDelete'))) return;
    try {
      await productService.deleteProduct(id);
      toast.success(t('productDetails.toasts.deleteSuccess'));
      router.push('/my-listings');
    } catch {
      toast.error(t('productDetails.toasts.deleteFailed'));
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    if (product?.status === 'sold') {
      toast.error(t('productDetails.toasts.alreadySold'));
      return;
    }
    setIsBuying(true);
    try {
      const response = await api.post('/payments/initialize', { productId: id });
      const { checkoutUrl } = response.data.data;
      window.location.href = checkoutUrl;
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('productDetails.toasts.paymentInitFailed'));
      setIsBuying(false);
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    if (ratingInput === 0) {
      toast.error(t('productDetails.toasts.ratingRequired'));
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, { rating: ratingInput, comment: commentInput.trim() });
      const newReview: Review = res.data.data;
      setReviews((prev) => [newReview, ...prev]);
      const newTotal = totalReviews + 1;
      const newAvg = (averageRating * totalReviews + ratingInput) / newTotal;
      setAverageRating(newAvg);
      setTotalReviews(newTotal);
      setUserReview(newReview);
      setShowReviewForm(false);
      toast.success(t('productDetails.toasts.reviewSubmitSuccess'));
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('productDetails.toasts.reviewSubmitFailed'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!userReview) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.patch(`/reviews/${userReview._id}`, { rating: ratingInput, comment: commentInput.trim() });
      const updated: Review = res.data.data;
      const updatedReviews = reviews.map((r) => (r._id === updated._id ? updated : r));
      setReviews(updatedReviews);
      setUserReview(updated);
      const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      setAverageRating(avg);
      setShowReviewForm(false);
      toast.success(t('productDetails.toasts.reviewUpdateSuccess'));
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('productDetails.toasts.reviewUpdateFailed'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelEdit = () => {
    setShowReviewForm(false);
    if (userReview) {
      setRatingInput(userReview.rating);
      setCommentInput(userReview.comment || '');
    } else {
      setRatingInput(0);
      setCommentInput('');
    }
  };

  if (isLoading) return <PageLoader />;

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title={t('productDetails.emptyState.title')} description={t('productDetails.emptyState.description')} />
      </div>
    );
  }

  const sellerId = product.seller?._id;
  const isOwner = isAuthenticated && user?.id === sellerId;
  const categoryName = typeof product.category === 'object' ? product.category?.name : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-card border border-border bg-border/30">
            {product.images?.[activeImage]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[activeImage].url} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-textSecondary">{t('productDetails.noImage')}</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.publicId as string || i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-button border-2 transition-colors ${
                    i === activeImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-textPrimary">{product.title}</h1>
                {product.status === 'sold' && <Badge variant="neutral">{t('productDetails.statuses.sold')}</Badge>}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-gold">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold text-primary">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-textSecondary">
                    {t('productDetails.reviewCount', { count: totalReviews })}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-3xl font-extrabold text-primary">{formatCurrency(product.price)}</p>
              {product.isNegotiable && <p className="mt-0.5 text-sm text-textSecondary">{t('productDetails.negotiable')}</p>}
            </div>

            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorited ? t('productDetails.removeFavorite') : t('productDetails.addFavorite')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-textSecondary transition-colors hover:text-danger"
            >
              <Heart className={isFavorited ? 'h-5 w-5 fill-danger text-danger' : 'h-5 w-5'} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-textSecondary">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {product.city}
            </span>
            <span>·</span>
            <span>{getConditionLabel(product.condition)}</span>
            <span>·</span>
            <span>{timeAgo(product.createdAt)}</span>
            {categoryName && (
              <>
                <span>·</span>
                <Badge variant="primary">{categoryName}</Badge>
              </>
            )}
          </div>

          {/* Seller card */}
          <Link
            href={`/seller/${sellerId}`}
            className="card mt-6 flex items-center gap-3 p-4 transition-colors hover:border-primary/40"
          >
            <Avatar src={product.seller?.avatar?.url} name={product.seller?.name} size="lg" />
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-semibold text-textPrimary">
                {product.seller?.name || t('productDetails.unknownSeller')}
                <TrustBadge isVerified={product.seller?.isVerifiedSeller} />
              </p>
              <p className="text-sm text-textSecondary">
                {product.seller?.avgRating && product.seller.avgRating > 0
                  ? t('productDetails.sellerRating', {
                      rating: product.seller.avgRating.toFixed(1),
                      count: product.seller.reviewCount,
                    })
                  : t('productDetails.sellerNoReviews')}
              </p>
            </div>
          </Link>

          {/* Actions */}
          {isOwner ? (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/listing/${id}/edit`)}>
                <Pencil className="h-4 w-4" /> {t('productDetails.editButton')}
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> {t('productDetails.deleteButton')}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {isAuthenticated ? (
                product.status !== 'sold' && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    isLoading={isBuying}
                    onClick={handleBuyNow}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" /> {t('productDetails.buyNow')}
                  </Button>
                )
              ) : (
                <Button
                  className="w-full bg-gold hover:bg-gold-dark text-white"
                  onClick={() => router.push(`/login?from=${encodeURIComponent(`/product/${id}`)}`)}
                >
                  {t('productDetails.loginToBuy')}
                </Button>
              )}
              <Button className="w-full" variant="outline" isLoading={isContacting} onClick={handleContactSeller}>
                <MessageCircle className="h-4 w-4 mr-2" /> {t('productDetails.contactSeller')}
              </Button>
              {revealedPhone && (
                <p className="flex items-center gap-2 rounded-button border border-border bg-background px-3.5 py-2.5 text-sm text-textPrimary">
                  <Phone className="h-4 w-4 text-primary" /> {revealedPhone}
                  {product.seller?.isPhoneVerified && <ShieldCheck className="ml-auto h-4 w-4 text-success" />}
                </p>
              )}
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-textSecondary hover:text-danger"
              >
                <Flag className="h-3.5 w-3.5" /> {t('productDetails.reportButton')}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-textPrimary">{t('productDetails.descriptionLabel')}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-textSecondary">{product.description}</p>
          </div>
        </div>
      </div>

      {/* ===== REVIEW SECTION ===== */}
      <section className="mt-12 border-t border-border pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary">{t('productDetails.reviewsTitle')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-gold">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold text-primary">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-textSecondary text-sm">
                {t('productDetails.reviewCount', { count: totalReviews })}
              </span>
            </div>
          </div>
          {isAuthenticated && !isOwner && !userReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReviewForm(true);
                setRatingInput(0);
                setCommentInput('');
              }}
            >
              {t('productDetails.writeReview')}
            </Button>
          )}
          {userReview && !showReviewForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReviewForm(true);
                setRatingInput(userReview.rating);
                setCommentInput(userReview.comment || '');
              }}
            >
              {t('productDetails.editReview')}
            </Button>
          )}
        </div>

        {showReviewForm && isAuthenticated && !isOwner && (
          <div className="bg-warm-bg rounded-xl p-5 mb-6 border border-border">
            <h3 className="font-semibold text-primary mb-3">
              {userReview ? t('productDetails.editReviewTitle') : t('productDetails.writeReviewTitle')}
            </h3>
            <form onSubmit={userReview ? handleUpdateReview : handleSubmitReview}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-textSecondary mb-1">{t('productDetails.ratingLabel')}</label>
                <StarRating rating={ratingInput} onRatingChange={setRatingInput} readonly={false} size={28} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-textSecondary mb-1">{t('productDetails.commentLabel')}</label>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 transition outline-none"
                  placeholder={t('productDetails.commentPlaceholder')}
                  maxLength={1000}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmittingReview} size="sm">
                  {userReview ? t('productDetails.updateReviewButton') : t('productDetails.submitReviewButton')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit} type="button">
                  {t('productDetails.cancelButton')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-5 last:border-0">
                <div className="flex items-start gap-3">
                  <Avatar src={review.buyer?.avatar?.url} name={review.buyer?.name} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary">{review.buyer?.name || t('productDetails.anonymous')}</span>
                      <span className="text-xs text-textSecondary">· {timeAgo(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gold mt-1">
                      <StarRating rating={review.rating} readonly size={16} />
                    </div>
                    {review.comment && <p className="mt-1 text-textSecondary text-sm">{review.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-textSecondary text-center py-6">{t('productDetails.noReviews')}</p>
        )}
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">{t('productDetails.similarListings')}</h2>
          <ProductGrid products={similar} />
        </section>
      )}

      {isReportOpen && <ReportListingModal productId={id} onClose={() => setIsReportOpen(false)} />}
    </div>
  );
}