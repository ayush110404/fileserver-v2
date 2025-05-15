import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FolderOpen, 
  Star, 
  Clock, 
  Trash, 
  Cloud, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Folder,
  FolderOpenIcon,
  FolderIcon,
  Plus,
  File
} from 'lucide-react';

// Define the file/folder structure type
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

interface SidebarProps {
  isOpen: boolean;
  basePath?: string;
  apiEndpoint?: string;
}

export function Sidebar({ isOpen, basePath = '/files', apiEndpoint = '/api/files' }: SidebarProps) {
  const pathname = usePathname();
  const [folderStructure, setFolderStructure] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Define the main navigation items
  const mainNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Files', href: '/files', icon: FolderOpen },
    { name: 'Favorites', href: '/favorites', icon: Star },
    { name: 'Recent', href: '/recent', icon: Clock },
    { name: 'Trash', href: '/trash', icon: Trash },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  // Fetch the folder structure
  useEffect(() => {
    const fetchFolderStructure = async () => {
      try {
        setIsLoading(true);
        // Start from the root to build folder structure
        const rootResponse = await fetch(`${apiEndpoint}?path=`);
        
        if (!rootResponse.ok) {
          throw new Error('Failed to fetch folder structure');
        }
        
        const data = await rootResponse.json();
        
        // Filter only directories and sort them alphabetically
        const directories = data.files
          .filter((file: FileNode) => file.isDirectory)
          .sort((a: FileNode, b: FileNode) => a.name.localeCompare(b.name));
        
        // Initialize children arrays for top-level directories
        const enhancedDirs = directories.map((dir: FileNode) => ({
          ...dir,
          children: []
        }));
        
        setFolderStructure(enhancedDirs);
        
        // For folders matching the current path, automatically expand them
        if (pathname.startsWith('/files/')) {
          const pathParts = pathname.replace('/files/', '').split('/');
          let currentPath = '';
          
          // Pre-expand folders in the current path
          for (const part of pathParts) {
            if (part) {
              currentPath = currentPath ? `${currentPath}/${part}` : part;
              setExpandedFolders(prev => ({ ...prev, [currentPath]: true }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching folder structure:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFolderStructure();
  }, [apiEndpoint, pathname]);

  // Toggle folder expanded/collapsed state
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Fetch children for a specific folder when expanded
  const fetchFolderContents = async (folderPath: string) => {
    try {
      const response = await fetch(`${apiEndpoint}?path=${encodeURIComponent(folderPath)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contents for ${folderPath}`);
      }
      
      const data = await response.json();
      
      // Filter only directories and sort them
      const directories = data.files
        .filter((file: FileNode) => file.isDirectory)
        .sort((a: FileNode, b: FileNode) => a.name.localeCompare(b.name));
      
      // Add children to each directory
      const enhancedDirs = directories.map((dir: FileNode) => ({
        ...dir,
        children: []
      }));
      
      // Update the folder structure with the new children
      setFolderStructure(prevStructure => {
        return updateFolderChildren(prevStructure, folderPath, enhancedDirs);
      });
    } catch (error) {
      console.error(`Error fetching folder contents for ${folderPath}:`, error);
    }
  };

  // Recursively update children for a specific path in the folder structure
  const updateFolderChildren = (structure: FileNode[], path: string, children: FileNode[]): FileNode[] => {
    return structure.map(node => {
      if (node.path === path) {
        return { ...node, children };
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateFolderChildren(node.children, path, children)
        };
      }
      return node;
    });
  };

  // Load folder contents when a folder is expanded
  useEffect(() => {
    Object.entries(expandedFolders).forEach(([path, isExpanded]) => {
      if (isExpanded) {
        fetchFolderContents(path);
      }
    });
  }, [expandedFolders]);

  // Render a folder and its children recursively
  const renderFolder = (folder: FileNode, level = 0) => {
    const isExpanded = expandedFolders[folder.path] || false;
    const isActive = pathname === `${basePath}/${folder.path}` || pathname === `${basePath}${folder.path}`;
    
    return (
      <Collapsible
        key={folder.path}
        open={isExpanded}
        onOpenChange={() => toggleFolder(folder.path)}
        className="w-full"
      >
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "transform rotate-90"
              )} />
            </Button>
          </CollapsibleTrigger>
          
          <Link href={`${basePath}/${folder.path}`} className="flex-1">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal h-8",
                level > 0 && "ml-0"
              )}
            >
              {isExpanded ? (
                <FolderOpenIcon className="mr-2 h-4 w-4 " />
              ) : (
                <FolderIcon className="mr-2 h-4 w-4 " />
              )}
              <span className="truncate">{folder.name}</span>
            </Button>
          </Link>
        </div>
        
        <CollapsibleContent className="ml-4">
          {folder.children && folder.children.map(child => renderFolder(child, level + 1))}
          {folder.children && folder.children.length === 0 && (
            <div className="pl-8 py-1 text-xs text-muted-foreground">
              No subfolders
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render folder loading skeletons
  const renderFolderSkeletons = () => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="flex items-center px-1 py-1">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    ));
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform transform",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <ScrollArea className="h-full py-20">
        {/* <div className="px-3 py-2">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div> */}

        
        {/* Folder structure section */}
        <div className="px-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Folders</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              renderFolderSkeletons()
            ) : (
              folderStructure.map(folder => renderFolder(folder))
            )}
            
            {!isLoading && folderStructure.length === 0 && (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                No folders found
              </div>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Storage display */}
        <div className="px-3 mt-2">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium">Storage</div>
            </div>
            <div className="w-full h-2 bg-background rounded-full">
              <div className="h-2 bg-primary rounded-full w-3/4"></div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">75% of 10GB used</div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}