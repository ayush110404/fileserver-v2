import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileInfo } from '@/types';
import { Card } from '@/components/ui/card';
import { formatFileSize, formatDate, getBreadcrumbs } from '@/utils/file-utils';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { FileActions } from '@/components/FileActions';
import { FileList } from '@/components/FileLists';
import { FileGrid } from '@/components/FileGrid';
import { DeleteDialog } from '@/components/DeleteDialog';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface FileManagerProps {
  currentPath: string;
}

export function FileManager({ currentPath }: FileManagerProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const router = useRouter();
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
      
      // Sort files: directories first, then by name alphabetically
      const sortedFiles = data.files.sort((a: FileInfo, b: FileInfo) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setFiles(sortedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to a directory path
  const navigateToPath = (path: string) => {
    router.push(path === '' ? '/files' : `/files/${path}`);
  };
  
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    fetchFiles();
  };
  
  const createDirectory = async (name: string) => {
    const response = await fetch('/api/directory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: currentPath,
        name: name,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create directory');
    }
    
    fetchFiles();
  };
  
  const handleDelete = async (file: FileInfo) => {
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
      
      fetchFiles();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setDeleteInProgress(null);
      setShowDeleteDialog(false);
    }
  };
  
  const openDeleteDialog = (file: FileInfo) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };
  
  useEffect(() => {
    fetchFiles();
  }, [currentPath]); // Re-fetch when path changes
  
  return (
    <>
      {/* Breadcrumb navigation */}
      <BreadcrumbNav 
        breadcrumbs={breadcrumbs} 
        onNavigate={navigateToPath}
      />
      
      {/* Action buttons */}
      <FileActions 
        onRefresh={fetchFiles}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateFolder={createDirectory}
        onUploadFile={handleFileUpload}
      />
      
      <Card className="shadow-sm">
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchFiles} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <FileList 
            files={files}
            loading={loading}
            onDirectoryClick={navigateToPath}
            onDeleteClick={openDeleteDialog}
            deleteInProgress={deleteInProgress}
          />
        ) : (
          <FileGrid 
            files={files}
            loading={loading}
            onDirectoryClick={navigateToPath}
            onDeleteClick={openDeleteDialog}
            deleteInProgress={deleteInProgress}
          />
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        fileToDelete={fileToDelete}
        onDelete={handleDelete}
        deleteInProgress={!!deleteInProgress}
      />
    </>
  );
}
