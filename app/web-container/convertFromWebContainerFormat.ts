import { FileNode } from './getAllFiles';
import { WebContainerFiles } from './WebContainerFiles';

export function convertFromWebContainerFormat(files: WebContainerFiles): FileNode[] {
  return Object.entries(files).map(([name, data]) => ({
    name,
    type: 'file' as const,
    content: data.file.contents
  }));
}

