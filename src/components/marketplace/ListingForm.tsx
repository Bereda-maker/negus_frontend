'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUploader, { ExistingImage } from './ImageUploader';
import AIAssistantPanel from './AIAssistantPanel';
import { ETHIOPIAN_CITIES, PRODUCT_CONDITIONS, PRODUCT_CONDITION_LABELS, ProductCondition } from '@/utils/constants';
import { Category } from '@/types';

export interface ListingFormValues {
  title: string;
  description: string;
  category: string;
  price: number | string;
  isNegotiable: boolean;
  condition: string;
  city: string;
}

export interface ListingFormSubmitValues extends ListingFormValues {
  images: File[];
  aiAssisted: boolean;
}

interface ListingFormProps {
  categories?: Category[];
  defaultValues?: Partial<ListingFormValues>;
  existingImages?: ExistingImage[];
  onSubmit: (values: ListingFormSubmitValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function ListingForm({
  categories = [],
  defaultValues,
  existingImages = [],
  onSubmit,
  isSubmitting,
  submitLabel = 'Publish listing',
}: ListingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ListingFormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      isNegotiable: true,
      condition: '',
      city: '',
      ...defaultValues,
    },
  });

  const [files, setFiles] = useState<File[]>([]);
  const [aiApplied, setAiApplied] = useState(false);

  const watched = watch();

  // Only used to feed live values into the AI panel — not for validation.
  const listingSnapshot = {
    title: watched.title,
    description: watched.description,
    category: watched.category,
    condition: watched.condition,
    city: watched.city,
  };

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));
  const conditionOptions = PRODUCT_CONDITIONS.map((c) => ({
    value: c,
    label: PRODUCT_CONDITION_LABELS[c as ProductCondition],
  }));

  const submit = (formData: ListingFormValues) => {
    onSubmit({
      ...formData,
      isNegotiable: Boolean(formData.isNegotiable),
      images: files,
      aiAssisted: aiApplied,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-textPrimary">Photos</h2>
          <ImageUploader files={files} onChange={setFiles} existingImages={existingImages} />
          {files.length === 0 && existingImages.length === 0 && (
            <p className="mt-2 text-xs text-textSecondary">At least one photo is required.</p>
          )}
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-sm font-semibold text-textPrimary">Details</h2>

          <Input
            label="Title"
            placeholder="e.g. iPhone 12, 128GB, unlocked"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 100, message: 'Title cannot exceed 100 characters' },
            })}
          />

          <Textarea
            label="Description"
            rows={5}
            placeholder="Describe the item's condition, features, and why you're selling it…"
            error={errors.description?.message}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' },
              maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' },
            })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select label="Category" options={categoryOptions} error={errors.category?.message} {...field} />
              )}
            />
            <Controller
              name="condition"
              control={control}
              rules={{ required: 'Condition is required' }}
              render={({ field }) => (
                <Select label="Condition" options={conditionOptions} error={errors.condition?.message} {...field} />
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price (ETB)"
              type="number"
              min="0"
              step="1"
              error={errors.price?.message}
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price cannot be negative' },
              })}
            />
            <Controller
              name="city"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <Select label="City" options={[...ETHIOPIAN_CITIES]} error={errors.city?.message} {...field} />
              )}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-textPrimary">
            <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" {...register('isNegotiable')} />
            Price is negotiable
          </label>
        </div>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>

      <div className="space-y-4">
        <AIAssistantPanel
          listing={listingSnapshot}
          onApplyEnhancement={(enhancement) => {
            setValue('title', enhancement.improvedTitle, { shouldValidate: true });
            setValue('description', enhancement.improvedDescription, { shouldValidate: true });
            setAiApplied(true);
          }}
          onApplyPrice={(price) => {
            setValue('price', price, { shouldValidate: true });
          }}
        />
        {aiApplied && (
          <p className="flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI suggestions applied to this listing
          </p>
        )}
      </div>
    </form>
  );
}
