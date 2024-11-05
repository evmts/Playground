import { usePlaygroundStore } from '@/state/usePlaygroundStore'
import { useMutation } from 'react-query'
import { getAllFiles } from '@/web-container/getAllFiles'
import { WebContainer } from '@webcontainer/api'
import { saveFilesToStorage } from '@/web-container/saveFilesToStorage'

interface UseHandleCodeChangeProps {
  webContainer?: WebContainer
}

export function useHandleCodeChange({ webContainer }: UseHandleCodeChangeProps) {
  return useMutation(
    async ({ value }: { value?: string }) => {
      const { selectedFile } = usePlaygroundStore.getState()
      if (!selectedFile || value === undefined) {
        return
      }
      if (webContainer) {
        await webContainer.fs.writeFile(selectedFile.name, value)
        return { name: selectedFile.name, content: value }
      }
      throw new Error('webContainer not ready')
    },
    {
      onSuccess: async () => {
        if (webContainer) {
          saveFilesToStorage(await getAllFiles(webContainer, '/'))
        }
      }
    }
  )
}
