'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import productService, { ProductPayload } from '@/services/productService';
import categoryService from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';
import ListingForm, { ListingFormSubmitValues } from '@/components/marketplace/ListingForm';
import { ExistingImage } from '@/components/marketplace/ImageUploader';
import VideoUpload from '@/components/VideoUpload';
import PageLoader from '@/components/common/PageLoader';
import RequireAuth from '@/components/common/RequireAuth';
import EmptyState from '@/components/ui/EmptyState';
import { uploadMultipleVideos, CloudinaryUploadResult } from '@/services/cloudinaryService';
import { Category, Product } from '@/types';
import '@/i18n';

function EditListingContent() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<{ url: string; publicId?: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    productService
      .getProduct(id)
      .then((res) => {
        const p = (res.data as any).product ?? res.data;

        // Determine owner ID – supports both populated object and plain string
        const ownerId = p.seller?._id || p.seller;
        // Get current user ID – supports both id and _id
        const currentUserId = (user as any).id || (user as any)._id;

        // Compare using toString() to avoid type mismatches
        if (ownerId && currentUserId && ownerId.toString() !== currentUserId.toString()) {
          setForbidden(true);
          return;
        }

        setProduct(p);
        setExistingVideos(p.videos || []);
      })
      .catch(() => setForbidden(true))
      .finally(() => setIsLoading(false));
  }, [id, user]);

  const handleSubmit = async (formData: ListingFormSubmitValues) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let newVideos: CloudinaryUploadResult[] = [];
      if (videoFiles && videoFiles.length > 0) {
        toast.loading(t('editListing.toasts.uploadingVideos'), { id: 'video-upload' });
        newVideos = await uploadMultipleVideos(videoFiles, (progress) => {
          setUploadProgress(progress);
        });
        toast.success(t('editListing.toasts.videosUploaded'), { id: 'video-upload' });
      }

      const payload: ProductPayload = {
        ...formData,
        videos: newVideos,
      };

      const originalPublicIds = (product?.videos || []).map((v) => v.publicId);
      const currentPublicIds = existingVideos.map((v) => v.publicId);
      const toDelete = originalPublicIds.filter((pid) => pid && !currentPublicIds.includes(pid));
      if (toDelete.length) {
        payload.deleteVideos = JSON.stringify(toDelete);
      }

      await productService.updateProduct(id, payload);
      toast.success(t('editListing.toasts.updateSuccess'));
      router.push(`/product/${id}`);
    } catch (err) {
      console.error('EditListing error:', err);
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || t('editListing.toasts.updateFailed'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) return <PageLoader />;

  if (forbidden || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title={forbidden ? t('editListing.emptyState.forbiddenTitle') : t('editListing.emptyState.notFoundTitle')}
          description={
            forbidden
              ? t('editListing.emptyState.forbiddenDescription')
              : t('editListing.emptyState.notFoundDescription')
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-textPrimary">{t('editListing.title')}</h1>
      <p className="mb-6 text-sm text-textSecondary">{t('editListing.subtitle')}</p>

      <ListingForm
        categories={categories}
        defaultValues={{
          title: product.title,
          description: product.description,
          category: typeof product.category === 'string' ? product.category : product.category?._id || '',
          price: product.price,
          isNegotiable: product.isNegotiable,
          condition: product.condition,
          city: product.city,
        }}
        existingImages={(product.images || []) as ExistingImage[]}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={t('editListing.saveChanges')}
      />

      <div className="mt-8 border-t border-border pt-8">
        <VideoUpload onChange={setVideoFiles} maxCount={3} initialVideos={existingVideos} />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-textSecondary mt-1">
              {t('editListing.uploadProgress', { progress: uploadProgress })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <RequireAuth>
      <EditListingContent />
    </RequireAuth>
  );
}