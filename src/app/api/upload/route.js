import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle base64 image upload
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      const { base64Image, filename } = body;

      if (!base64Image) {
        return NextResponse.json({ error: 'No base64 image provided' }, { status: 400 });
      }

      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
      }

      // Check if Cloudinary is configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'tripforsoul-admin',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(buffer);
        });

        return NextResponse.json({ 
          success: true, 
          imageUrl: result.secure_url,
          message: 'Image uploaded to Cloudinary successfully'
        });
      } else {
        // Fallback: Save locally (for development)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const ext = filename ? filename.split('.').pop() : 'png';
        const finalFilename = `${timestamp}.${ext}`;
        const filepath = path.join(uploadsDir, finalFilename);

        await writeFile(filepath, buffer);

        return NextResponse.json({ 
          success: true, 
          imageUrl: `/uploads/${finalFilename}`,
          message: 'Image saved locally'
        });
      }
    }

    // Handle multipart/form-data file upload
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'tripforsoul-admin',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return NextResponse.json({ 
        success: true, 
        imageUrl: result.secure_url,
        message: 'Image uploaded to Cloudinary successfully'
      });
    } else {
      // Fallback: Save locally
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const timestamp = Date.now();
      const originalName = file.name.replace(/\s+/g, '-');
      const filename = `${timestamp}-${originalName}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);

      return NextResponse.json({ 
        success: true, 
        imageUrl: `/uploads/${filename}`,
        message: 'Image saved locally'
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 });
  }
}
