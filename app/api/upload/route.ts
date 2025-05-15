// app/api/upload/route.ts - For file uploads
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FILE_DIRECTORY, initFileSystem } from '@/lib/file-system';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(request: NextRequest) {
  // Ensure file directory exists
  await initFileSystem();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadPath = formData.get('path')?.toString().replaceAll("%20"," ") as string || '';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(FILE_DIRECTORY, uploadPath);
    await fsPromises.mkdir(uploadDir, { recursive: true });
    
    // Write file to disk
    const filePath = path.join(uploadDir, file.name);
    await fsPromises.writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, fileName: file.name });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
