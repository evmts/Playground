import { usePlaygroundStore } from "@/state/usePlaygroundStore"
import { convertFromWebContainerFormat } from "@/web-container/convertFromWebContainerFormat"
import { getAllFiles } from "@/web-container/getAllFiles"
import { initialFiles } from "@/web-container/initialFiles"
import { STORAGE_KEY, STORAGE_VERSION } from "@/web-container/localStorage"
import { WebContainer } from "@webcontainer/api"
import { useCallback } from "react"
import { useQuery } from "react-query"

export const useFileTree = ({ webContainer }: { webContainer?: WebContainer }) => {
  const {
    selectedFile,
    setSelectedFile,
    expandedFolders
  } = usePlaygroundStore()

  const getStoredFiles = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check version and handle migrations if needed
        if (parsed.version === STORAGE_VERSION) {
          return convertFromWebContainerFormat(parsed.files)
        }
      }
    } catch (e) {
      console.error('Failed to load stored files:', e)
    }
    return convertFromWebContainerFormat(initialFiles)
  }, [])

  return useQuery(
    ['loadedFiles', expandedFolders],
    async () => {
      if (!webContainer) {
        return getStoredFiles()
      }
      const rootFiles = await getAllFiles(webContainer, '/')
      const newFileTree = [...rootFiles]

      for (const folder of expandedFolders) {
        const folderFiles = await getAllFiles(webContainer, folder)
        const pathParts = folder.split('/').filter(Boolean)
        let currentLevel = newFileTree

        for (const part of pathParts) {
          const folder = currentLevel.find(node => node.name.endsWith(`/${part}`) && node.type === 'folder')
          if (folder && folder.children) {
            currentLevel = folder.children
          } else {
            return
          }
        }

        const folderInTree = currentLevel.find(node => node.name === folder)
        if (folderInTree) {
          folderInTree.children = folderFiles
        }
      }

      return newFileTree
    },
    {
      initialData: getStoredFiles,
      onSuccess: (newFileTree) => {
        if (newFileTree?.length && !selectedFile) {
          setSelectedFile(newFileTree[0])
        }
      }
    }
  )

}
