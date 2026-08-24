import axios, { AxiosError } from 'axios';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'negus-gebeya-videos'; // Unsigned preset configured in Cloudinary
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a video file directly to Cloudinary with retry.
 */
export const uploadVideoToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void,
  retries = 3
): Promise<CloudinaryUploadResult> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Video file is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('resource_type', 'video');

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < retries) {
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        formData,
        {
          // No explicit Content-Type -- same reasoning as api.ts and
          // productService.ts: let axios/the browser set the multipart
          // boundary automatically for FormData.
          timeout: 120000, // 2 minutes
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percent);
            }
          },
        }
      );
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
      };
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt < retries) {
        const delay = attempt * 1000; // 1s, 2s, 3s...
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error('Cloudinary upload error:', lastError);
  const axiosErr = lastError as AxiosError<{ error?: { message?: string } }>;
  const msg =
    axiosErr?.response?.data?.error?.message ||
    (lastError instanceof Error ? lastError.message : undefined) ||
    'Video upload failed.';
  throw new Error(msg);
};

/**
 * Upload multiple videos in parallel with individual progress.
 */
export const uploadMultipleVideos = async (
  files: File[],
  onOverallProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult[]> => {
  const total = files.length;
  let completed = 0;
  const results: CloudinaryUploadResult[] = [];

  for (const file of files) {
    const result = await uploadVideoToCloudinary(file, (percent) => {
      const overall = ((completed + percent / 100) / total) * 100;
      if (onOverallProgress) onOverallProgress(Math.round(overall));
    });
    results.push(result);
    completed++;
    if (onOverallProgress) onOverallProgress(Math.round((completed / total) * 100));
  }
  return results;
};