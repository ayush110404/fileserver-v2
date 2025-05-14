// 2. lib/file-system.ts - Utility functions for file operations
// lib/file-system.ts
// import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { FileInfo } from '@/types';

// Base directory for all files
export const FILE_DIRECTORY = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'server-files');

// Ensure the file directory exists
export const initFileSystem = async () => {
  try {
    await fsPromises.access(FILE_DIRECTORY);
  } catch (error) {
    await fsPromises.mkdir(FILE_DIRECTORY, { recursive: true });
  }
};

// Get information about files and directories at a specific path
export const getDirectoryContents = async (dirPath: string): Promise<FileInfo[]> => {
  const fullPath = path.join(FILE_DIRECTORY, dirPath);
  
  try {
    await fsPromises.access(fullPath);
    const stats = await fsPromises.stat(fullPath);
    
    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory');
    }
    
    const items = await fsPromises.readdir(fullPath);
    const contents: FileInfo[] = [];
    
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const itemStats = await fsPromises.stat(itemPath);
      
      contents.push({
        name: item,
        path: path.join(dirPath, item).replace(/\\/g, '/'),
        isDirectory: itemStats.isDirectory(),
        size: itemStats.size,
        modifiedAt: itemStats.mtime
      });
    }
    
    // Sort directories first, then files (alphabetically)
    return contents.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
};

// Get file information
export const getFileInfo = async (filePath: string): Promise<FileInfo> => {
  const fullPath = path.join(FILE_DIRECTORY, filePath);
  
  try {
    const stats = await fsPromises.stat(fullPath);
    
    return {
      name: path.basename(filePath),
      path: filePath.replace(/\\/g, '/'),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Create a directory at the specified path
export const createDirectory = async (dirPath: string): Promise<void> => {
  const fullPath = path.join(FILE_DIRECTORY, dirPath);
  
  try {
    await fsPromises.mkdir(fullPath, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

// Delete a file or directory
export const deleteFileOrDirectory = async (itemPath: string): Promise<void> => {
  const fullPath = path.join(FILE_DIRECTORY, itemPath);
  
  try {
    const stats = await fsPromises.stat(fullPath);
    
    if (stats.isDirectory()) {
      await fsPromises.rm(fullPath, { recursive: true, force: true });
    } else {
      await fsPromises.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};
