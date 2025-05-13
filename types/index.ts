// 1. types/index.ts - Define our TypeScript interfaces
// types/index.ts
export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: Date;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}