import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  Upload, 
  FolderPlus, 
  RefreshCw, 
  List,
  Grid,
  Loader,
  FolderUp,
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface FileActionsProps {
  onRefresh: () => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onCreateFolder: (name: string) => Promise<void>;
  onUploadFile: (files: File[]) => Promise<void>;
  currentPath?: string;
}

export function FileActions({ 
  onRefresh, 
  viewMode, 
  onViewModeChange, 
  onCreateFolder,
  onUploadFile,
  currentPath = '',
}: FileActionsProps) {
  // State management
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs for file input elements
  const multipleFileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const folderInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Handle file selection
  const handleFileSelection = (files: FileList | null) => {
    if (!files?.length) return;
    setSelectedFiles(Array.from(files));
  };

  // Handle direct file input click
  const handleFileInputClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
  };

  // Handle file upload submission
  const handleFileUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedFiles.length) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      await onUploadFile(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset state after successful upload
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadOpen(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle folder creation
  const handleCreateDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setCreateFolderOpen(false);
      onRefresh(); // Refresh the file list after creating a folder
    } catch (error) {
      console.error('Error creating directory:', error);
      alert('Failed to create directory');
    }
  };

  // Process drag and drop uploads
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.length) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Hidden file inputs */}
        <input 
          ref={multipleFileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />
        
        <input 
          ref={folderInputRef}
          type="file"
          // webkitdirectory="true"
          // directory=""
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />
        
        {/* Upload Button Group */}
        <div className="relative group">
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          
          <div className="hidden group-hover:flex flex-col absolute z-10 mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg">
            <Button 
              variant="ghost" 
              className="justify-start rounded-none hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => handleFileInputClick(multipleFileInputRef)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start rounded-none hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => handleFileInputClick(folderInputRef)}
            >
              <FolderUp className="h-4 w-4 mr-2" />
              Upload Folder
            </Button>
          </div>
        </div>
        
        {/* Upload Dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent 
            className="sm:max-w-md" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
          >
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Upload files to {currentPath || 'the current directory'}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFileUpload}>
              <div className="grid gap-4 py-4">
                {!selectedFiles.length ? (
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer"
                    onClick={() => handleFileInputClick(multipleFileInputRef)}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop files here or click to browse
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm flex justify-between items-center">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
                
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)} type="button">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedFiles.length || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length ? `(${selectedFiles.length})` : ''}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Create Folder Dialog */}
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
                Enter a name for the new folder in {currentPath || 'the current directory'}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDirectory}>
              <div className="grid gap-4 py-4">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New Folder"
                  required
                  autoFocus
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
        
        {/* Refresh Button */}
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center border rounded-md overflow-hidden">
        <Button 
          variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
          size="sm"
          className="rounded-none"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
          size="sm"
          className="rounded-none"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}