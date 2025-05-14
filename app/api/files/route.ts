// app/api/files/route.ts - For listing files
// app/api/files/route.ts
import { getDirectoryContents, initFileSystem } from '@/lib/file-system';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Ensure file directory exists
  await initFileSystem();
  
  // Get directory path from query
  const { searchParams } = new URL(request.url);
  const dirPath = searchParams.get('path') || '';
  
  try {
    const files = await getDirectoryContents(dirPath);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}