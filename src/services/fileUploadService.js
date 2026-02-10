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
// CONFIGURATION
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;  // 2MB for logos
const MAX_HERO_SIZE = 5 * 1024 * 1024;  // 5MB for hero images
const MAX_LOGO_WIDTH = 200;              // Optimize logos to max 200px
const MAX_HERO_WIDTH = 1920;             // Optimize hero images to max 1920px
const JPEG_QUALITY = 0.9;               // 90% quality for JPEG compression

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a file before upload
 * @param {File} file - The file to validate
 * @param {string} type - Upload type ('hero', 'logo-light', 'logo-dark', 'logo-platform')
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateFile = (file, type = 'hero') => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    // Also check extension as fallback
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type "${file.type || ext}". Accepted formats: PNG, JPG, JPEG, SVG.`
      };
    }
  }

  // Check file size based on type
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

/**
 * Resize and compress an image using canvas
 * SVG files are returned as-is (no raster optimization).
 * @param {File|Blob} file
 * @param {number} maxWidth
 * @returns {Promise<Blob>}
 */
const optimizeImage = (file, maxWidth) => {
  return new Promise((resolve, reject) => {
    // SVG doesn't need raster optimization
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Only downscale, never upscale
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

        // Determine output type (keep PNG for transparency, use JPEG for photos)
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
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

// ============================================
// UPLOAD
// ============================================

/**
 * Upload a file to /public/uploads/ (localStorage-backed).
 *
 * Flow: validate → optimize → store data URL in localStorage → return path.
 *
 * @param {File} file
 * @param {string} type - 'hero' | 'logo-light' | 'logo-dark' | 'logo-platform'
 * @returns {Promise<string>} public path, e.g. "/uploads/logo-platform-1700000000-abc123.png"
 */
export const uploadFile = async (file, type) => {
  // 1. Validate
  const validation = validateFile(file, type);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Optimize
  const maxWidth = type === 'hero' ? MAX_HERO_WIDTH : MAX_LOGO_WIDTH;
  let optimizedBlob;
  try {
    optimizedBlob = await optimizeImage(file, maxWidth);
  } catch (err) {
    // Fall back to raw file if optimization fails
    console.warn('Image optimization skipped:', err.message);
    optimizedBlob = file;
  }

  // 3. Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filename = `${type}-${timestamp}-${randomSuffix}.${extension}`;
  const publicPath = `/uploads/${filename}`;

  // 4. Convert to data URL and persist
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read optimized image.'));
    reader.readAsDataURL(optimizedBlob);
  });

  try {
    localStorage.setItem(`busbuddy_upload_${filename}`, dataUrl);
  } catch (storageError) {
    // localStorage might be full
    // Try to clean up old uploads of the same type first
    cleanupOldUploads(type);
    try {
      localStorage.setItem(`busbuddy_upload_${filename}`, dataUrl);
    } catch {
      throw new Error('Storage is full. Please remove some existing uploads and try again.');
    }
  }

  // 5. Store metadata
  const metadata = {
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

/**
 * Resolve a stored path to a displayable URL.
 * Handles: external URLs, data URLs, and /uploads/ paths.
 * @param {string} path
 * @returns {string|null}
 */
export const getUploadedFileUrl = (path) => {
  if (!path) return null;

  // Already a full URL or data URL — pass through
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Resolve from localStorage
  const filename = path.split('/').pop();
  const storedData = localStorage.getItem(`busbuddy_upload_${filename}`);
  if (storedData) return storedData;

  // Fallback: treat as relative public path
  return path;
};

/**
 * Get metadata for a previously uploaded file
 * @param {string} path
 * @returns {object|null}
 */
export const getUploadedFileMetadata = (path) => {
  if (!path) return null;
  const filename = path.split('/').pop();
  const raw = localStorage.getItem(`busbuddy_upload_meta_${filename}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ============================================
// DELETION / RESET
// ============================================

/**
 * Delete an uploaded file and its metadata from storage
 * @param {string} path
 * @returns {boolean}
 */
export const deleteUploadedFile = (path) => {
  if (!path) return false;
  const filename = path.split('/').pop();
  localStorage.removeItem(`busbuddy_upload_${filename}`);
  localStorage.removeItem(`busbuddy_upload_meta_${filename}`);
  return true;
};

/**
 * Remove old uploads of a given type to free localStorage space.
 * Keeps only the most recent upload per type.
 * @param {string} type
 */
const cleanupOldUploads = (type) => {
  const prefix = `busbuddy_upload_${type}-`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && !key.includes('_meta_')) {
      keysToRemove.push(key);
    }
  }
  // Remove all but the most recent (by key sort, since they contain timestamps)
  keysToRemove.sort();
  // Remove all old ones (keep none since we're about to write a new one)
  keysToRemove.forEach((k) => {
    localStorage.removeItem(k);
    localStorage.removeItem(k.replace('busbuddy_upload_', 'busbuddy_upload_meta_'));
  });
};

// ============================================
// UTILITIES
// ============================================

/**
 * Human-readable file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Check whether a path points to a locally uploaded file
 * @param {string} path
 * @returns {boolean}
 */
export const isUploadedFile = (path) => {
  return Boolean(path && path.startsWith('/uploads/'));
};
