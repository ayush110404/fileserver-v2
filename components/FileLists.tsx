'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileInfo } from '@/types';

// Utility function to format file sizes
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface FileListProps {
  files: FileInfo[];
  currentPath: string;
  onRefresh: () => void;
}

export default function FileList({ files, currentPath, onRefresh }: FileListProps) {
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const router = useRouter();
  
  const handleDelete = async (file: FileInfo) => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      try {
        setDeleteInProgress(file.path);
        const response = await fetch('/api/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: file.path }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete');
        }
        
        onRefresh();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      } finally {
        setDeleteInProgress(null);
      }
    }
  };
  
  const handleDirectoryClick = (path: string) => {
    // Navigate to the directory page
    router.push(`/files/${path}`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Modified
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.path} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {file.isDirectory ? (
                  <button 
                    onClick={() => handleDirectoryClick(file.path)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    {file.name}
                  </button>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {file.name}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.isDirectory ? '—' : formatFileSize(file.size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.modifiedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {file.isDirectory ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={deleteInProgress === file.path}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteInProgress === file.path ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <a
                      href={`/api/download/${encodeURIComponent(file.path)}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={deleteInProgress === file.path}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteInProgress === file.path ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                This directory is empty
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}