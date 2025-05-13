// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white text-xl font-bold">
                Home File Server
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/' 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:text-white hover:border-blue-300'
                }`}
              >
                Files
              </Link>
              <Link
                href="/upload"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/upload' 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:text-white hover:border-blue-300'
                }`}
              >
                Upload
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/' 
                ? 'bg-blue-700 border-white text-white' 
                : 'border-transparent text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            Files
          </Link>
          <Link
            href="/upload"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/upload' 
                ? 'bg-blue-700 border-white text-white' 
                : 'border-transparent text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
}

