import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from 'lucide-react';
import { redirect } from "next/dist/server/api-utils";

interface BreadcrumbNavProps {
  breadcrumbs: { name: string; path: string }[];
  onNavigate: (path: string) => void;
}

export function BreadcrumbNav({ breadcrumbs, onNavigate }: BreadcrumbNavProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.path}>
            <BreadcrumbLink 
              onClick={() => index==0 ? onNavigate('/') : onNavigate(crumb.path)}
              className={`${index === breadcrumbs.length - 1 ? 'font-semibold pointer-events-none' : 'hover:underline cursor-pointer'}`}
            >
              {crumb.name}
            </BreadcrumbLink>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}