import { usePlaygroundStore } from "@/state/usePlaygroundStore"
import { convertFromWebContainerFormat } from "@/web-container/convertFromWebContainerFormat"
import { getAllFiles } from "@/web-container/getAllFiles"
import { getInitialFiles } from "@/web-container/getInitialFiles"
import { WebContainer } from "@webcontainer/api"
import { useQuery } from "react-query"

export const useFileTree = ({ webContainer }: { webContainer?: WebContainer }) => {
  const selectedFile  = usePlaygroundStore(({ selectedFile }) => (selectedFile))
  const expandedFolders  = usePlaygroundStore(({ expandedFolders }) => (expandedFolders))

  return useQuery(
    ['loadedFiles', expandedFolders],
    async () => {
      if (!webContainer) {
        return convertFromWebContainerFormat(getInitialFiles())
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
      onSuccess: (newFileTree) => {
        if (newFileTree?.length && !selectedFile) {
          usePlaygroundStore.getState().setSelectedFile(newFileTree[0])
        }
      }
    }
  )

}
