import { useState } from 'react';
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
} from 'lucide-react';

interface FileActionsProps {
  onRefresh: () => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onCreateFolder: (name: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
}

export function FileActions({ 
  onRefresh, 
  viewMode, 
  onViewModeChange, 
  onCreateFolder,
  onUploadFile
}: FileActionsProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      await onUploadFile(selectedFile);
      setSelectedFile(null);
      setUploadOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const handleCreateDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setCreateFolderOpen(false);
    } catch (error) {
      console.error('Error creating directory:', error);
      alert('Failed to create directory');
    }
  };

  return (
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
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
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
            <form onSubmit={handleCreateDirectory}>
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
        
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
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
