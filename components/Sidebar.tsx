
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FolderOpen, 
  Star, 
  Clock, 
  Trash, 
  Cloud, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Files', href: '/files', icon: FolderOpen },
    { name: 'Favorites', href: '/favorites', icon: Star },
    { name: 'Recent', href: '/recent', icon: Clock },
    { name: 'Trash', href: '/trash', icon: Trash },
    { name: 'Cloud Storage', href: '/cloud', icon: Cloud },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform transform",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="h-full py-4 overflow-y-auto">
        <div className="mt-16 px-3 py-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
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
        </div>
        
        <div className="px-3 mt-6">
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
      </div>
    </aside>
  );
}