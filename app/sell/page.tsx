'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import productService, { ProductPayload } from '@/services/productService';
import categoryService from '@/services/categoryService';
import { uploadVideoToCloudinary, CloudinaryUploadResult } from '@/services/cloudinaryService';
import ListingForm, { ListingFormSubmitValues } from '@/components/marketplace/ListingForm';
import VideoUpload from '@/components/VideoUpload';
import RequireAuth from '@/components/common/RequireAuth';
import { Category } from '@/types';
import '@/i18n';

function CreateListingContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideos, setIsUploadingVideos] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data));
  }, []);

  const handleSubmit = async (formData: ListingFormSubmitValues) => {
    if (!formData.images || formData.images.length === 0) {
      toast.error(t('createListing.toasts.noImages'));
      return;
    }

    const payload: ProductPayload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      condition: formData.condition,
      city: formData.city,
      isNegotiable: formData.isNegotiable,
      images: formData.images,
    };

    if (videoFiles.length > 0) {
      setIsUploadingVideos(true);
      const uploadedVideos: CloudinaryUploadResult[] = [];

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        try {
          const result = await uploadVideoToCloudinary(file, (percent) => {
            setUploadProgress(Math.round((i * 100 + percent) / videoFiles.length));
          });
          uploadedVideos.push(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : t('createListing.toasts.uploadFailed');
          toast.error(t('createListing.toasts.videoUploadFailed', { number: i + 1, message }));
          setIsUploadingVideos(false);
          return;
        }
      }

      payload.videos = uploadedVideos;
      setIsUploadingVideos(false);
    }

    setIsSubmitting(true);
    try {
      const res = await productService.createProduct(payload);
      toast.success(t('createListing.toasts.published'));
      router.push(`/product/${(res.data as any).product?._id ?? res.data._id}`);
    } catch (error) {
      console.error('CreateListing error:', error);
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || t('createListing.toasts.failed'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const isUploading = isSubmitting || isUploadingVideos;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-textPrimary">{t('createListing.title')}</h1>
      <p className="mb-6 text-sm text-textSecondary">{t('createListing.subtitle')}</p>

      {/* Listing Form (includes the publish button) */}
      <ListingForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={t('createListing.publishButton')}
      />

      {/* 🆕 Video upload progress – now shown AFTER the publish button */}
      {isUploadingVideos && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            {t('createListing.uploadingVideos', { progress: uploadProgress })}
          </p>
          <div className="w-full h-2 bg-blue-200 rounded-full mt-1">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Video upload section */}
      <div className="mt-8 border-t border-border pt-8">
        <VideoUpload onChange={setVideoFiles} maxCount={3} />
        {isUploading && (
          <p className="mt-2 text-xs text-textSecondary">{t('createListing.waitForUpload')}</p>
        )}
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <RequireAuth>
      <CreateListingContent />
    </RequireAuth>
  );
}
