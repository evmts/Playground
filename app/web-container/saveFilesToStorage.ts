import { FileNode } from './getAllFiles';
import { STORAGE_KEY, STORAGE_VERSION } from './localStorage';
import { convertToWebContainerFormat } from './webContainerPromise';

export function saveFilesToStorage(files: FileNode[]) {
  try {
    const webContainerFiles = convertToWebContainerFormat(files)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_VERSION,
      files: webContainerFiles
    }))
  } catch (e) {
    console.error('Failed to save files to storage:', e)
  }
}
