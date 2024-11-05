import { Suspense, lazy, useMemo } from 'react'
import { FileExplorer } from '@/components/FileExplorer'
import { CodeEditor } from '@/components/CodeEditor'
import { useWebContainer } from '@/hooks/useWebContainer'

const LazyExecutionPanel = lazy(() =>
    import('@/components/ExecutionPanel').then(module => ({
        default: module.ExecutionPanel
    }))
)

export function TevmPlayground() {
    const outputStream = useMemo(() => new TransformStream<string, string>(), [])
    const { webContainerQuery } = useWebContainer({ outputStream })
    return (
        <>
            <FileExplorer
                webContainer={webContainerQuery.data}
            />
            <div style={{ minHeight: 'calc(100vh - 68px)' }} className="flex-1 flex flex-col min-w-0 h-full">
                <CodeEditor/>
                <div className="absolute bottom-0 left-0 right-0">
                    <Suspense fallback={<div>Loading execution panel...</div>}>
                        <LazyExecutionPanel
                            outputStream={outputStream}
                        />
                    </Suspense>
                </div>
            </div>
        </>
    )
}
