// app/components/CreateDirectoryForm.tsx
'use client';

import { useState } from 'react';

interface CreateDirectoryFormProps {
  currentPath: string;
  onDirectoryCreated: () => void;
}

export default function CreateDirectoryForm({ currentPath, onDirectoryCreated }: CreateDirectoryFormProps) {
  const [directoryName, setDirectoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!directoryName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath,
          name: directoryName.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create directory');
      }
      
      setDirectoryName('');
      onDirectoryCreated();
    } catch (error) {
      console.error('Error creating directory:', error);
      alert('Failed to create directory');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={directoryName}
          onChange={(e) => setDirectoryName(e.target.value)}
          placeholder="New folder name"
          disabled={isCreating}
          className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!directoryName.trim() || isCreating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
        >
          {isCreating ? 'Creating...' : 'Create Folder'}
        </button>
      </div>
    </form>
  );
}

