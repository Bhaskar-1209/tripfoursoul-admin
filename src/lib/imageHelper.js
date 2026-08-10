import fs from 'fs';
import path from 'path';

/**
 * Check if a URL is already a base64 data URL
 */
export const isBase64Image = (url = '') => {
  return typeof url === 'string' && url.startsWith('data:image');
};

/**
 * Check if a URL is external (http/https)
 */
export const isExternalUrl = (url = '') => {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
};

/**
 * Check if a URL is a local path (starts with /uploads/ or /img/ etc.)
 */
export const isLocalPath = (url = '') => {
  return typeof url === 'string' && url.startsWith('/') && !isBase64Image(url);
};

/**
 * Convert a local file path to a base64 data URL
 * @param {string} filePath - Path relative to public directory (e.g., '/uploads/foo.jpg')
 * @returns {string|null} - Base64 data URL or null if file not found
 */
export const localPathToBase64 = (filePath = '') => {
  try {
    if (!filePath || !isLocalPath(filePath)) return null;
    
    // Clean the path
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    
    if (!fs.existsSync(fullPath)) return null;
    
    const buffer = fs.readFileSync(fullPath);
    
    // Detect content type from extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.avif') contentType = 'image/avif';
    
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.warn(`Failed to convert local image to base64: ${filePath}`, error.message);
    return null;
  }
};

/**
 * Process an image URL:
 * - Keep base64 data URLs as-is
 * - Keep external URLs as-is
 * - Convert local paths to base64 data URLs
 * @param {string|null} url - Image URL
 * @returns {string|null} - Processed URL
 */
export const processImageUrl = (url) => {
  if (!url) return '';
  if (isBase64Image(url)) return url;
  if (isExternalUrl(url)) return url;
  if (isLocalPath(url)) {
    const base64 = localPathToBase64(url);
    if (base64) return base64;
  }
  // Return as-is as last resort
  return url;
};

/**
 * Process an array of items and convert image_url fields to base64
 * @param {Array} items - Array of database rows
 * @param {Array<string>} fields - Field names to process (default: ['image_url'])
 * @returns {Array} - Items with processed image URLs
 */
export const processImageFields = (items = [], fields = ['image_url']) => {
  if (!Array.isArray(items)) return items;
  
  return items.map(item => {
    if (!item || typeof item !== 'object') return item;
    
    const processed = { ...item };
    for (const field of fields) {
      if (processed[field]) {
        processed[field] = processImageUrl(processed[field]);
      }
    }
    return processed;
  });
};

/**
 * Convert a File/Blob to base64 data URL (client-side helper)
 * @param {File} file - File object from file input
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};