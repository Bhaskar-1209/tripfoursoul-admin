import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const imagePath = searchParams.get('path');

    if (!imageUrl && !imagePath) {
      return NextResponse.json({ error: 'Image URL or path is required' }, { status: 400 });
    }

    let imageBuffer;
    let contentType = 'image/jpeg';

    // Fetch from URL (Cloudinary or external)
    if (imageUrl) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);

      // Detect content type from URL
      if (imageUrl.endsWith('.png')) contentType = 'image/png';
      else if (imageUrl.endsWith('.gif')) contentType = 'image/gif';
      else if (imageUrl.endsWith('.webp')) contentType = 'image/webp';
    }
    // Read from local path
    else if (imagePath) {
      const fs = await import('fs');
      const path = await import('path');

      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const fullPath = path.join(process.cwd(), 'public', cleanPath);

      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      imageBuffer = fs.readFileSync(fullPath);

      // Detect content type from extension
      const ext = path.extname(fullPath).toLowerCase();
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
    }

    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      base64Image: dataUrl,
      contentType,
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return NextResponse.json({ error: 'Failed to convert image to base64' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const reqContentType = request.headers.get('content-type') || '';

    // ==================== Handle JSON body (base64 data URL) ====================
    if (reqContentType.includes('application/json')) {
      const body = await request.json();
      const { base64Image } = body;

      if (!base64Image) {
        return NextResponse.json({ error: 'No base64 image provided' }, { status: 400 });
      }

      // Convert data URL to buffer for validation
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
      }

      // If Cloudinary is configured, upload there and return URL
      if (isCloudinaryConfigured()) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'tripforsoul-admin', resource_type: 'auto' },
              (error, result) => (error ? reject(error) : resolve(result))
            ).end(buffer);
          });

          return NextResponse.json({
            success: true,
            imageUrl: result.secure_url,
            base64Image,
            message: 'Image uploaded to Cloudinary successfully',
          });
        } catch (cloudinaryError) {
          console.warn('Cloudinary upload failed, using base64:', cloudinaryError.message);
        }
      }

      // Return the base64 data URL directly (stored in DB, works on Vercel)
      return NextResponse.json({
        success: true,
        imageUrl: base64Image, // data URL, ready to store in DB
        base64Image,
        message: 'Image converted to base64 successfully',
      });
    }

    // ==================== Handle multipart/form-data file upload ====================
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    // Convert file to buffer and base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // If Cloudinary is configured, upload there and return URL
    if (isCloudinaryConfigured()) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'tripforsoul-admin', resource_type: 'auto' },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(buffer);
        });

        return NextResponse.json({
          success: true,
          imageUrl: result.secure_url,
          base64Image,
          message: 'Image uploaded to Cloudinary successfully',
        });
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, using base64:', cloudinaryError.message);
      }
    }

    // Return base64 data URL directly - no filesystem write needed (Vercel-compatible)
    return NextResponse.json({
      success: true,
      imageUrl: base64Image, // data URL, ready to store in DB
      base64Image,
      message: 'Image converted to base64 successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 });
  }
}