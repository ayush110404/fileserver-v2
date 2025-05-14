'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  Folder, 
  File as FileIcon, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  FolderPlus, 
  MoreVertical,
  List,
  Grid,
  ChevronRight
} from 'lucide-react';

// Utility function to format file sizes
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Utility function to format dates
function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  const now = new Date();
  
  // If the date is today, just show the time
  if (d.toDateString() === now.toDateString()) {
    return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If the date is this year, show the month and day
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show the full date
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
    if (path === '') {
      router.push('/files');
    } else {
      router.push(`/files/${path}`);
    }
  };
  
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('path', currentPath);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      fetchFiles();
      setSelectedFile(null);
      setUploadOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const createDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const response = await fetch('/api/directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath,
          name: newFolderName.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create directory');
      }
      
      fetchFiles();
      setNewFolderName('');
      setCreateFolderOpen(false);
    } catch (error) {
      console.error('Error creating directory:', error);
      alert('Failed to create directory');
    }
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
  
  // Render loading skeletons for table view
  const renderTableSkeletons = () => (
    Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-16 ml-auto" />
        </TableCell>
      </TableRow>
    ))
  );
  
  // Render loading skeletons for grid view
  const renderGridSkeletons = () => (
    Array(8).fill(0).map((_, index) => (
      <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3">
        <h1 className="text-2xl font-semibold text-gray-900">File Explorer</h1>
      </header>
      
      <main className="flex-1 container mx-auto p-6 max-w-7xl">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={crumb.path}>
                <BreadcrumbLink 
                  onClick={() => navigateToPath(crumb.path)}
                  className={`${index === breadcrumbs.length - 1 ? 'font-semibold pointer-events-none' : 'hover:underline cursor-pointer'}`}
                >
                  {crumb.name}
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4" />
                  // <BreadcrumbSeparator>
                  // </BreadcrumbSeparator>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                  <DialogDescription>
                    Select a file to upload to the current directory.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFileUpload}>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!selectedFile || uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for the new folder.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createDirectory}>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="name">Folder Name</Label>
                    <Input
                      id="name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New Folder"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateFolderOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!newFolderName.trim()}>
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon" onClick={fetchFiles} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderTableSkeletons()
                ) : files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                      This folder is empty
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.path}>
                      <TableCell>
                        {file.isDirectory ? (
                          <Button 
                            variant="ghost" 
                            className="p-0 h-auto font-normal justify-start hover:bg-transparent" 
                            onClick={() => handleDirectoryClick(file.path)}
                          >
                            <Folder className="h-4 w-4 text-blue-500 mr-2" />
                            <span>{file.name}</span>
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <FileIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{file.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.isDirectory ? '—' : formatFileSize(file.size || 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.modifiedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!file.isDirectory && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/api/download/${encodeURIComponent(file.path)}`}
                                  className="cursor-pointer flex items-center"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => openDeleteDialog(file)}
                              disabled={deleteInProgress === file.path}
                            >
                              {deleteInProgress === file.path ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {renderGridSkeletons()}
                </div>
              ) : files.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  This folder is empty
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {files.map((file) => (
                    <div 
                      key={file.path} 
                      className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-end w-full mb-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!file.isDirectory && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/api/download/${encodeURIComponent(file.path)}`}
                                  className="cursor-pointer flex items-center"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => openDeleteDialog(file)}
                              disabled={deleteInProgress === file.path}
                            >
                              {deleteInProgress === file.path ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {file.isDirectory ? (
                        <button 
                          onClick={() => handleDirectoryClick(file.path)}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <Folder className="h-12 w-12 text-blue-500 mb-2" />
                          <span className="text-sm text-center truncate w-full">{file.name}</span>
                          <span className="text-xs text-muted-foreground">Folder</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <span className="text-sm text-center truncate w-full">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {fileToDelete?.isDirectory
                ? "This will delete the directory and all its contents. This action cannot be undone."
                : "This will permanently delete this file. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600" 
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}