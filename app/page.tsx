// File structure overview:
// - app/: Main application directory (Next.js App Router)
//   - api/: API routes for file operations
//   - components/: Reusable UI components
//   - lib/: Utility functions
//   - page.tsx: Home page
//   - upload/page.tsx: Upload page
//   - files/[...path]/page.tsx: Dynamic file/directory viewing
// - public/: Public assets
// - server-files/: Where uploaded files will be stored
// - types/: TypeScript type definitions

'use client';

import Breadcrumbs from '@/components/Breadcrumbs';
import CreateDirectoryForm from '@/components/CreateDirectoryForm';
import FileList from '@/components/FileLists';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';
// import { getBreadcrumbs } from '@/lib/file-system';
import { FileInfo } from '@/types';
import { useState, useEffect } from 'react';

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentPath = '';
  // const breadcrumbs = getBreadcrumbs(currentPath);
  
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/files?path=${currentPath}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFiles();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
          <div className="mt-2 mb-6">
            {/* <Breadcrumbs items={breadcrumbs} /> */}
          </div>
          
          <div className="mt-4 mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium mb-2">Upload File</h2>
            <UploadForm currentPath={currentPath} onUploadComplete={fetchFiles} />
            
            <h2 className="text-lg font-medium mb-2 mt-4">Create New Folder</h2>
            <CreateDirectoryForm currentPath={currentPath} onDirectoryCreated={fetchFiles} />
          </div>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading files...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-600">
              <p>{error}</p>
              <button 
                onClick={fetchFiles} 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <FileList files={files} currentPath={currentPath} onRefresh={fetchFiles} />
          )}
        </div>
      </main>
    </div>
  );
}