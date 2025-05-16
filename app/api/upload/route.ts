// app/api/upload/route.ts - For file uploads
import { NextRequest, NextResponse } from 'next/server';
import { FILE_DIRECTORY, initFileSystem } from '@/lib/file-system';
import path from 'path';
import { promises as fsPromises } from 'fs';

interface UploadResult {
  name: string;
  path?: string;
  size?: number;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  // Ensure file directory exists
  await initFileSystem();
  
  try {
    const formData = await request.formData();
    const uploadPath = formData.get('path')?.toString().replaceAll("%20", " ") as string || '';
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(FILE_DIRECTORY, uploadPath);
    await fsPromises.mkdir(uploadDir, { recursive: true });
    
    // Process multiple files
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results: UploadResult[] = [];
    
    // Process each file in parallel
    await Promise.all(files.map(async (file) => {
      try {
        // Convert File to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Handle folder uploads by creating nested directories if needed
        let targetPath = uploadDir;
        
        // If the file has a path relative to the upload location 
        // (happens when uploading folders)
        if (file.webkitRelativePath) {
          const relativeDirPath = path.dirname(file.webkitRelativePath);
          if (relativeDirPath !== '.') {
            targetPath = path.join(uploadDir, relativeDirPath);
            await fsPromises.mkdir(targetPath, { recursive: true });
          }
        }
        
        // Write file to disk
        const filePath = path.join(targetPath, file.name);
        await fsPromises.writeFile(filePath, buffer);
        
        results.push({
          name: file.name,
          path: path.relative(FILE_DIRECTORY, filePath).replace(/\\/g, '/'),
          size: file.size,
          success: true
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        results.push({
          name: file.name,
          success: false,
          error: 'Failed to upload file'
        });
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      results,
      totalUploaded: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Error in file upload handler:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};