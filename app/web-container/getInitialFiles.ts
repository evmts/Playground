import { initialFiles } from './initialFiles';
import { WebContainerFiles } from './WebContainerFiles';
import { STORAGE_KEY, STORAGE_VERSION } from './localStorage';

export function getInitialFiles(): WebContainerFiles {
  const storedFiles = localStorage.getItem(STORAGE_KEY)
  if (storedFiles) {
    try {
      const parsed = JSON.parse(storedFiles)
      // Could add version checking logic here if needed
      return parsed
    } catch (e) {
      console.error('Failed to parse stored files:', e)
      return initialFiles
    }
  }

  for (let i = 0; i < parseInt(STORAGE_VERSION); i++) {
    localStorage.removeItem(`playground-files-v${i}`)
  }

  return initialFiles
}
