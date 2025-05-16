import { FileInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { formatFileSize, formatDate } from '@/utils/file-utils';

interface FileListProps {
  files: FileInfo[];
  loading: boolean;
  onDirectoryClick: (path: string) => void;
  onDeleteClick: (file: FileInfo) => void;
  deleteInProgress: string | null;
}

export function FileList({ 
  files, 
  loading, 
  onDirectoryClick, 
  onDeleteClick, 
  deleteInProgress 
}: FileListProps) {
  // Render loading skeletons
  const renderTableSkeletons = () => (
    Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </TableCell>
        <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell className="text-right">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
        </TableCell>
      </TableRow>
    ))
  );

  return (
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
            <TableRow key={file.path} className="hover:bg-muted/50">
              <TableCell>
                {file.isDirectory ? (
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto font-normal justify-start cursor-pointer" 
                    onClick={() => onDirectoryClick(file.path)}
                  >
                    <Folder className="h-4 w-4 text-primary mr-2" />
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
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}