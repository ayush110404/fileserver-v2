import { FileInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, 
  Folder, 
  File as FileIcon, 
  Download, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';
import { formatFileSize } from '@/utils/file-utils';

interface FileGridProps {
  files: FileInfo[];
  loading: boolean;
  onDirectoryClick: (path: string) => void;
  onDeleteClick: (file: FileInfo) => void;
  deleteInProgress: string | null;
}

export function FileGrid({ 
  files, 
  loading, 
  onDirectoryClick, 
  onDeleteClick,
  deleteInProgress 
}: FileGridProps) {
  // Render loading skeletons
  const renderGridSkeletons = () => (
    Array(8).fill(0).map((_, index) => (
      <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mb-2" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    ))
  );

  return (
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
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                      onClick={() => onDeleteClick(file)}
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
                  onClick={() => onDirectoryClick(file.path)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Folder className="h-12 w-12 text-secondary mb-2" />
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
  );
}