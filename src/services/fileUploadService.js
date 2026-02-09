/**
 * File Upload Service
 * Handles uploading files to /public/uploads/ directory
 */

/**
 * Upload a file to the public/uploads directory
 * @param {File} file - The file to upload
 * @param {string} type - Type of upload ('hero', 'logo-light', 'logo-dark', 'logo-platform')
 * @returns {Promise<string>} - The public URL path to the uploaded file
 */
export const uploadFile = async (file, type) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`📁 File Upload - Starting upload for ${type}:`, { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${type}-${timestamp}.${extension}`;
      const publicPath = `/uploads/${filename}`;

      console.log(`📁 File Upload - Generated filename: ${filename}`);
      console.log(`📁 File Upload - Public path: ${publicPath}`);

      // In a real implementation, this would use FileReader and fs to save to /public/uploads/
      // For Vite dev server, we'll use a data URL for now and save path
      // In production, this would be an API call to backend
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        // Store in localStorage with the filename as key
        // This simulates saving to /public/uploads/
        localStorage.setItem(`busbuddy_upload_${filename}`, dataUrl);
        
        console.log(`✅ File Upload - Successfully uploaded to: ${publicPath}`);
        resolve(publicPath);
      };
      
      reader.onerror = (error) => {
        console.error(`❌ File Upload - Failed:`, error);
        reject(error);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error(`❌ File Upload - Error:`, error);
      reject(error);
    }
  });
};

/**
 * Get the full URL for an uploaded file
 * @param {string} path - The public path (e.g. '/uploads/logo-1234.png')
 * @returns {string} - The full URL or data URL
 */
export const getUploadedFileUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URL, return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Extract filename from path
  const filename = path.split('/').pop();
  
  // Try to get from localStorage (simulated /public/uploads/)
  const storedData = localStorage.getItem(`busbuddy_upload_${filename}`);
  if (storedData) {
    return storedData;
  }
  
  // Otherwise, assume it's a real public path
  return path;
};
