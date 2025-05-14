// app/api/download/[...path]/route.ts - For file downloads
// app/api/download/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FILE_DIRECTORY, initFileSystem } from '@/lib/file-system';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Ensure file directory exists
  await initFileSystem();
  
  try {
    const filePath = params.path.join('/');
    const fullPath = path.join(FILE_DIRECTORY, filePath);
    
    // Check if file exists
    const stats = await fs.promises.stat(fullPath);
    
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }
    
    // Read file and stream it
    const fileBuffer = await fs.promises.readFile(fullPath);
    
    // Set content-disposition header to prompt download
    const fileName = path.basename(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/octet-stream'
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}

