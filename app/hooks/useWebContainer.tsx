import { useMutation, useQuery, useQueryClient } from 'react-query'
import { WebContainer } from '@webcontainer/api'

interface UseWebContainerProps {
  outputStream: TransformStream<string, string>
}

export const useWebContainer = ({ outputStream }: UseWebContainerProps) => {
  const queryClient = useQueryClient()
  const webContainerQuery = useQuery(
    'webcontainer',
    () => import('@/web-container/getWebContainer').then(({ getWebContainer }) => {
      return getWebContainer()
    }), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    onSuccess: () => {
      console.log('WebContainer ready, running npm install...')
      runCommandMutation.mutate({ command: 'npm', args: ['install'] })
    }
  })
  const runCommandMutation = useMutation(
    async ({ command, args }: { command: string, args: string[] }) => {
      const webContainer = queryClient.getQueryData<WebContainer>('webcontainer')

      if (!webContainer) throw new Error('WebContainer not ready')

      const writer = outputStream.writable.getWriter()
      try {
        await writer.write(`$ ${command} ${args.join(' ')}\n`)

        const process = await webContainer.spawn(command, args)

        process.output.pipeTo(
          new WritableStream({
            write: async (data) => {
              await writer.write(data)
            }
          })
        )

        const exitCode = await process.exit
        if (exitCode !== 0) {
          throw new Error(`Command failed with exit code ${exitCode}`)
        }
      } finally {
        writer.releaseLock()
      }
    }
  )
  return { runCommandMutation, webContainerQuery }
}
