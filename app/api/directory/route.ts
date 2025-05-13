// app/api/directory/route.ts - For creating directories
// app/api/directory/route.ts
import { createDirectory, initFileSystem } from '@/lib/file-system';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Ensure file directory exists
  await initFileSystem();
  
  try {
    const { path, name } = await request.json();
    const dirPath = path ? `${path}/${name}` : name;
    
    await createDirectory(dirPath);
    
    return NextResponse.json({ success: true, path: dirPath });
  } catch (error) {
    console.error('Error creating directory:', error);
    return NextResponse.json({ error: 'Failed to create directory' }, { status: 500 });
  }
}


