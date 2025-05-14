
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
  import { Loader2 } from 'lucide-react';
  import { FileInfo } from '@/types';
  
  interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileToDelete: FileInfo | null;
    onDelete: (file: FileInfo) => void;
    deleteInProgress: boolean;
  }
  
  export function DeleteDialog({ 
    open, 
    onOpenChange, 
    fileToDelete, 
    onDelete, 
    deleteInProgress 
  }: DeleteDialogProps) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
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
              onClick={() => fileToDelete && onDelete(fileToDelete)}
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
    );
  }
  