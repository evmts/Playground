import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { usePlaygroundStore } from "@/state/usePlaygroundStore"
import { useMutation } from "react-query"
import { WebContainer } from "@webcontainer/api"
import { saveFilesToStorage } from "@/web-container/saveFilesToStorage"
import { getAllFiles } from "@/web-container/getAllFiles"

interface FileExplorerProps {
  webContainer?: WebContainer
}

export function useNewFileMutation({
  webContainer,
}: FileExplorerProps) {
  return useMutation(
    async (newFileName: string) => {
      if (webContainer) {
        const newFileContent = `// New file: ${newFileName}\n`
        await webContainer.fs.writeFile(newFileName, newFileContent)
        return { name: newFileName, type: 'file' as const, content: newFileContent }
      }
    },
    {
      onSuccess: async (newFile) => {
        if (newFile && webContainer) {
          usePlaygroundStore.getState().setSelectedFile(newFile)
          saveFilesToStorage(await getAllFiles(webContainer, '/'))
        }
      }
    }
  )
}
