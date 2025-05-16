'use client';

import { useParams } from 'next/navigation';
import { FileManager } from '@/components/FileManager';

export default function FilesPage() {
  const params = useParams();
  
  // Extract the current path from the URL parameters
  // This handles both /files and /files/some/path cases
  const pathSegments = params.path ? 
    (Array.isArray(params.path) ? params.path : [params.path]) : 
    [];
  const currentPath = pathSegments.join('/');
  
  return (
    <>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Browse and manage your files and folders
          </p>
        </div>
        <FileManager currentPath={currentPath} />
      </div>
    </>
  );
}