import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      contentType
    });

  } catch (error) {
    console.error('Error converting image to base64:', error);
    return NextResponse.json({ error: 'Failed to convert image to base64' }, { status: 500 });
  }
}

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
