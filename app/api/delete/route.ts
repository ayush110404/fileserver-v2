// app/api/delete/route.ts - For deleting files and directories
// app/api/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteFileOrDirectory, initFileSystem } from '@/lib/file-system';

export async function DELETE(request: NextRequest) {
  // Ensure file directory exists
  await initFileSystem();
  
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    await deleteFileOrDirectory(path);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}