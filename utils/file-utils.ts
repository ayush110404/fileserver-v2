
export function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  const now = new Date();
  
  // If the date is today, just show the time
  if (d.toDateString() === now.toDateString()) {
    return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If the date is this year, show the month and day
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show the full date
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getBreadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '' }];
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath += `${currentPath ? '/' : ''}${part}`;
    breadcrumbs.push({ name: part, path: currentPath });
  });
  
  return breadcrumbs;
}