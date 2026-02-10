/**
 * File Upload Service
 *
 * Handles uploading files with:
 * - File type validation (PNG, JPG, JPEG, SVG only)
 * - File size validation (configurable max)
 * - Image optimization/resizing via canvas
 * - Unique filename generation (timestamp + random suffix)
 * - localStorage persistence (simulates /public/uploads/)
 * - Metadata tracking
 * - Graceful error handling
 */

// ============================================
// TYPES
// ============================================

export interface FileValidationResult {
  valid: boolean;
  error: string | null;
}

export interface UploadMetadata {
  filename: string;
  path: string;
  type: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  mimeType: string;
  uploadedAt: string;
}

export type UploadType = 'hero' | 'logo-light' | 'logo-dark' | 'logo-platform';

// ============================================
// CONFIGURATION
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;  // 2MB for logos
const MAX_HERO_SIZE = 5 * 1024 * 1024;  // 5MB for hero images
const MAX_LOGO_WIDTH = 200;
const MAX_HERO_WIDTH = 1920;
const JPEG_QUALITY = 0.9;

// ============================================
// VALIDATION
// ============================================

export const validateFile = (file: File, type: UploadType = 'hero'): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type "${file.type || ext}". Accepted formats: PNG, JPG, JPEG, SVG.`
      };
    }
  }

  const maxSize = type === 'hero' ? MAX_HERO_SIZE : MAX_LOGO_SIZE;
  const maxLabel = type === 'hero' ? '5MB' : '2MB';
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (${formatFileSize(file.size)}). Maximum size for ${type === 'hero' ? 'hero images' : 'logos'}: ${maxLabel}.`
    };
  }

  return { valid: true, error: null };
};

// ============================================
// IMAGE OPTIMIZATION
// ============================================

const optimizeImage = (file: File | Blob, maxWidth: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outputType === 'image/jpeg' ? JPEG_QUALITY : undefined;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image optimization failed — canvas.toBlob returned null.'));
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not decode image. The file may be corrupted.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

// ============================================
// UPLOAD
// ============================================

export const uploadFile = async (file: File, type: UploadType): Promise<string> => {
  // 1. Validate
  const validation = validateFile(file, type);
  if (!validation.valid) {
    throw new Error(validation.error!);
  }

  // 2. Optimize
  const maxWidth = type === 'hero' ? MAX_HERO_WIDTH : MAX_LOGO_WIDTH;
  let optimizedBlob: Blob;
  try {
    optimizedBlob = await optimizeImage(file, maxWidth);
  } catch (err) {
    console.warn('Image optimization skipped:', (err as Error).message);
    optimizedBlob = file;
  }

  // 3. Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filename = `${type}-${timestamp}-${randomSuffix}.${extension}`;
  const publicPath = `/uploads/${filename}`;

  // 4. Convert to data URL and persist
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read optimized image.'));
    reader.readAsDataURL(optimizedBlob);
  });

  try {
    localStorage.setItem(`busbuddy_upload_${filename}`, dataUrl);
  } catch {
    cleanupOldUploads(type);
    try {
      localStorage.setItem(`busbuddy_upload_${filename}`, dataUrl);
    } catch {
      throw new Error('Storage is full. Please remove some existing uploads and try again.');
    }
  }

  // 5. Store metadata
  const metadata: UploadMetadata = {
    filename,
    path: publicPath,
    type,
    originalName: file.name,
    originalSize: file.size,
    optimizedSize: optimizedBlob.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString()
  };
  localStorage.setItem(`busbuddy_upload_meta_${filename}`, JSON.stringify(metadata));

  return publicPath;
};

// ============================================
// RETRIEVAL
// ============================================

export const getUploadedFileUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const filename = path.split('/').pop();
  const storedData = localStorage.getItem(`busbuddy_upload_${filename}`);
  if (storedData) return storedData;

  return path;
};

export const getUploadedFileMetadata = (path: string | null | undefined): UploadMetadata | null => {
  if (!path) return null;
  const filename = path.split('/').pop();
  const raw = localStorage.getItem(`busbuddy_upload_meta_${filename}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UploadMetadata;
  } catch {
    return null;
  }
};

// ============================================
// DELETION / RESET
// ============================================

export const deleteUploadedFile = (path: string | null | undefined): boolean => {
  if (!path) return false;
  const filename = path.split('/').pop();
  localStorage.removeItem(`busbuddy_upload_${filename}`);
  localStorage.removeItem(`busbuddy_upload_meta_${filename}`);
  return true;
};

const cleanupOldUploads = (type: string): void => {
  const prefix = `busbuddy_upload_${type}-`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && !key.includes('_meta_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.sort();
  keysToRemove.forEach((k) => {
    localStorage.removeItem(k);
    localStorage.removeItem(k.replace('busbuddy_upload_', 'busbuddy_upload_meta_'));
  });
};

// ============================================
// UTILITIES
// ============================================

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const isUploadedFile = (path: string | null | undefined): boolean => {
  return Boolean(path && path.startsWith('/uploads/'));
};
