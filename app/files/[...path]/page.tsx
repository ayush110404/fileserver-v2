// Create a new file at app/files/[...path]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateDirectoryForm from '@/components/CreateDirectoryForm';
// import FileList from '@/components/FileList';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';
import { FileInfo } from '@/types';
import FileList from '@/components/FileLists';

function getBreadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '' }];
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath += `${currentPath ? '/' : ''}${part}`;
    breadcrumbs.push({ name: part, path: currentPath });
  });
  
  return breadcrumbs;
}

export default function DirectoryPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  
  // Extract path from URL parameters
  const pathSegments = Array.isArray(params.path) ? params.path : [params.path];
  const currentPath = pathSegments.join('/');
  
  // Generate breadcrumbs for navigation
  const breadcrumbs = getBreadcrumbs(currentPath);
  
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
      
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
  
  // Navigate to a directory path
  const navigateToPath = (path: string) => {
    if (path === '') {
      router.push('/');
    } else {
      router.push(`/files/${path}`);
    }
  };
  
  useEffect(() => {
    fetchFiles();
  }, [currentPath]); // Re-fetch when path changes
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
          </div>
          
          {/* Breadcrumbs navigation */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <button
                    onClick={() => navigateToPath(crumb.path)}
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-700'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          
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
            <FileList 
              files={files} 
              currentPath={currentPath} 
              onRefresh={fetchFiles} 
            />
          )}
        </div>
      </main>
    </div>
  );
}