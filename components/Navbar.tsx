
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu as MenuIcon, 
  ServerCog
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onToggleSidebar}>
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="flex items-center gap-2 mr-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1">
            <ServerCog className="h-5 w-5 text-primary-foreground" />
              {/* <FileIcon className="h-5 w-5 text-primary-foreground" /> */}
            </div>
            <span className="font-bold text-lg hidden md:inline-block">Pithos</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center gap-4 md:gap-8 mx-4">
          <form className="hidden md:flex-1 md:flex max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="w-full pl-8 bg-background"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
