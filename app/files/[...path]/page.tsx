'use client';

import { useParams } from 'next/navigation';
import { FileManager } from '@/components/FileManager';
import { AppLayout } from '@/components/app-layout';

export default function FilesPage() {
  const params = useParams();
  
  // Extract the current path from the URL parameters
  // This handles both /files and /files/some/path cases
  const pathSegments = params.path ? 
    (Array.isArray(params.path) ? params.path : [params.path]) : 
    [];
  const currentPath = pathSegments.join('/');
  
  return (
      <div className="space-y-4">
        <FileManager currentPath={currentPath} />
      </div>
  );
}