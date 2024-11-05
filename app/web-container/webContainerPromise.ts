import { FileNode } from './getAllFiles';
import { WebContainerFiles } from './WebContainerFiles';

export function convertToWebContainerFormat(files: FileNode[]): WebContainerFiles {
  const result: WebContainerFiles = {};

  files.forEach(file => {
    if (file.type === 'file') {
      result[file.name] = {
        file: {
          contents: file.content || ''
        }
      };
    }
  });

  return result;
}
