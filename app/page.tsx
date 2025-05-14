'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FileManager } from '@/components/FileManager';
import { AppLayout } from '@/components/app-layout';

export default function FilesPage() {
  const pathname = usePathname();
  
  // Extract current path from URL: /files/path/to/dir -> path/to/dir
  const currentPath = pathname.startsWith('/files/') 
    ? pathname.substring(7) // Remove '/files/' prefix
    : ''; // Root directory
  
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Browse and manage your files and folders
          </p>
        </div>
        
        <FileManager
          basePath="/files"
          apiEndpoint="/api/files"
          currentPath={currentPath}
        />
      </div>
    </AppLayout>
  );
}