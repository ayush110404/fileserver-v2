import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileInfo } from '@/types';
import { Card } from '@/components/ui/card';
import { getBreadcrumbs } from '@/utils/file-utils';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { FileActions } from '@/components/FileActions';
import { FileList } from '@/components/FileLists';
import { FileGrid } from '@/components/FileGrid';
import { DeleteDialog } from '@/components/DeleteDialog';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface FileManagerProps {
  basePath?: string;
  apiEndpoint?: string;
  currentPath: string;
  onPathChange?: (path: string) => void;
}

export function FileManager({ 
  basePath = '/files', 
  apiEndpoint = '/api/files',
  currentPath,
  onPathChange
}: FileManagerProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const   [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const router = useRouter();
  
  const breadcrumbs = getBreadcrumbs(currentPath);
  
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiEndpoint}?path=${encodeURIComponent(currentPath)}`);
      
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
  
  // Navigate to a directory
  const navigateToPath = (path: string) => {
    if (onPathChange) {
      onPathChange(path);
      console.log('Path changed:', path);
    } else {
      router.push(path === '/' ? "/" : `${basePath}/${path}`);

    }
  };
  
  const handleUploadFiles = async (files: File[]) => {
    try {
      const formData = new FormData();
      formData.append('path', currentPath);
      
      // Append multiple files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload files');
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      toast("Upload Complete",{
        description: `Successfully uploaded ${result.totalUploaded} files${
          result.totalFailed ? ` (${result.totalFailed} failed)` : ''
        }`,
      });
      
      // Refresh file list
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast("Error uploading files", {
        description: 'Failed to upload files. Please try again.',
      });
      throw error;
    }
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
  
  const handleDirectoryClick = (path: string) => {
    navigateToPath(path);
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
        onUploadFile={handleUploadFiles}
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
            onDirectoryClick={handleDirectoryClick}
            onDeleteClick={openDeleteDialog}
            deleteInProgress={deleteInProgress}
          />
        ) : (
          <FileGrid 
            files={files}
            loading={loading}
            onDirectoryClick={handleDirectoryClick}
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