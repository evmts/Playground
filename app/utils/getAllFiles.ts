import { WebContainer } from "@webcontainer/api";

export interface FileNode {
    name: string
    type: 'file' | 'folder'
    content: string
    children?: FileNode[]
  }

export async function getAllFiles(webcontainerInstance: WebContainer, dir: string = '/'): Promise<FileNode[]> {
    const entries = await webcontainerInstance.fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = `${dir}/${entry.name}`.replace(/\/+/g, '/');
      if (entry.isDirectory()) {
        return {
          name: fullPath,
          type: 'folder' as const,
          content: '',
          children: []
        };
      } else {
        const content = await webcontainerInstance.fs.readFile(fullPath, 'utf-8');
        return { name: fullPath, type: 'file' as const, content };
      }
    }));
    return files;
  }
  