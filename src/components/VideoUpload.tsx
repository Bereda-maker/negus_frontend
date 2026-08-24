'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, Play, Trash2 } from 'lucide-react';

interface ExistingVideo {
  url: string;
  [key: string]: unknown;
}

interface VideoUploadProps {
  onChange: (files: File[]) => void;
  maxCount?: number;
  initialVideos?: ExistingVideo[];
}

export default function VideoUpload({ onChange, maxCount = 3, initialVideos = [] }: VideoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<ExistingVideo[]>(initialVideos);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const total = files.length + existingVideos.length + selected.length;
    if (total > maxCount) {
      alert(`You can upload up to ${maxCount} videos.`);
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    onChange([...files, ...selected]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  const removeExisting = (index: number) => {
    const updated = [...existingVideos];
    updated.splice(index, 1);
    setExistingVideos(updated);
  };

  const totalVideos = files.length + existingVideos.length;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-textSecondary">Product Videos (optional)</label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {existingVideos.map((video, idx) => (
          <div key={`existing-${idx}`} className="relative group aspect-video bg-black rounded-md overflow-hidden">
            <video src={video.url} className="w-full h-full object-cover" muted />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
              <Play className="h-8 w-8 text-white" />
            </div>
            <button
              type="button"
              onClick={() => removeExisting(idx)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {previews.map((url, i) => (
          <div key={`new-${i}`} className="relative group aspect-video bg-black rounded-md overflow-hidden">
            <video src={url} className="w-full h-full object-cover" muted />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {totalVideos < maxCount && (
          <label className="aspect-video border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gold transition group">
            <Upload className="h-8 w-8 text-textTertiary group-hover:text-gold transition" />
            <span className="text-xs text-textSecondary mt-1 group-hover:text-gold transition">Upload Video</span>
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              ref={inputRef}
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-textSecondary">
        {totalVideos} of {maxCount} videos used. Supported formats: MP4, MOV, WebM.
      </p>
    </div>
  );
}
