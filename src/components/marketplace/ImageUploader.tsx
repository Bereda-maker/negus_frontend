'use client';

import { useCallback, useRef, useState, ChangeEvent, DragEvent } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const MAX_IMAGES = 8;
const MAX_FILE_MB = 5;

export interface ExistingImage {
  url: string;
  publicId?: string;
  [key: string]: unknown;
}

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  existingImages?: ExistingImage[];
}

/**
 * Controlled uploader for NEW images only (File objects). Existing
 * (already-uploaded) images are shown read-only via `existingImages` —
 * EditListing passes those in separately since they're URLs, not Files,
 * and can only be removed via a future "manage photos" action, not this
 * form (keeps scope to what's actually needed to demo).
 */
export default function ImageUploader({ files, onChange, existingImages = [] }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = files.length + existingImages.length;

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const room = MAX_IMAGES - totalCount;

      if (room <= 0) {
        toast.error(`You can upload up to ${MAX_IMAGES} photos.`);
        return;
      }

      const valid: File[] = [];
      for (const file of incoming) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} isn't an image.`);
          continue;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          toast.error(`${file.name} is over ${MAX_FILE_MB}MB.`);
          continue;
        }
        valid.push(file);
        if (valid.length >= room) break;
      }

      onChange([...files, ...valid]);
    },
    [files, onChange, totalCount]
  );

  const removeAt = (index: number) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
        )}
      >
        <ImagePlus className="h-7 w-7 text-textSecondary" />
        <p className="mt-2 text-sm font-medium text-textPrimary">Drag photos here, or click to browse</p>
        <p className="mt-1 text-xs text-textSecondary">
          Up to {MAX_IMAGES} photos, {MAX_FILE_MB}MB each. First photo is the cover.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {(existingImages.length > 0 || files.length > 0) && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImages.map((img, i) => (
            <div
              key={`existing-${img.publicId || i}`}
              className="relative aspect-square overflow-hidden rounded-button border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Cloudinary URLs, sized in a fixed square grid; next/image adds no real benefit here */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-pill bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Star className="h-2.5 w-2.5 fill-primary" /> Cover
                </span>
              )}
            </div>
          ))}
          {files.map((file, i) => (
            <div
              key={`new-${i}`}
              className="group relative aspect-square overflow-hidden rounded-button border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview of a File the user just picked, not a static asset */}
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              {existingImages.length === 0 && i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-pill bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Star className="h-2.5 w-2.5 fill-primary" /> Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-textPrimary/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
