import { useCallback, Suspense, lazy, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { useQuery, useMutation } from 'react-query'
import { MetaFunction } from '@remix-run/node'
import { FileNode, getAllFiles } from '@/utils/getAllFiles'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { FileExplorer } from '@/components/FileExplorer'
import { CodeEditor } from '@/components/CodeEditor'
import { usePlaygroundStore } from '@/state/State.js'
import { saveFilesToStorage, convertFromWebContainerFormat, initialFiles } from '@/web-container/webContainerPromise'
import { WebContainer } from '@webcontainer/api'

const LazyExecutionPanel = lazy(() => 
  import('@/components/ExecutionPanel').then(module => ({ 
    default: module.ExecutionPanel 
  }))
)

export const meta: MetaFunction = () => {
    return [
        { title: "Tevm Playground" },
        { name: "description", content: "Interactive playground for Tevm - Test, develop and deploy Ethereum smart contracts" },
    ]
}

export async function loader({ request }: LoaderFunctionArgs) {
    return json({})
}

export default function Index() {
    const data = useLoaderData<typeof loader>()
    return <TevmPlayground />
}

export function TevmPlayground() {
    const { 
        selectedFile, setSelectedFile,
        isFileTreeCollapsed, setIsFileTreeCollapsed,
        setExecutionResult, appendExecutionResult,
        sidebarWidth, setSidebarWidth,
        expandedFolders, toggleFolder
    } = usePlaygroundStore()

    // WebContainer setup - keep using React Query
    const { data: webContainer, isLoading } = useQuery(
        'webcontainer',
        () => import('@/web-container/webContainerPromise.js').then(({ getWebContainer }) => {
            return getWebContainer()
        }), {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        refetchInterval: false,
        onSuccess: (webContainer) => {
            console.log('WebContainer ready, running npm install...')
            npmInstallMutation.mutate(webContainer)
        }
    })

    // Get initial files from localStorage or default to initialFiles
    const getStoredFiles = useCallback(() => {
        try {
            const stored = localStorage.getItem('playground-files')
            if (stored) {
                return convertFromWebContainerFormat(JSON.parse(stored))
            }
        } catch (e) {
            console.error('Failed to load stored files:', e)
        }
        // Return converted initialFiles if nothing in localStorage
        return convertFromWebContainerFormat(initialFiles)
    }, [])

    // File loading logic with initialData
    const { data: fileTree = [], isLoading: isLoadedFilesLoading, refetch: refetchLoadedFiles } = useQuery(
        ['loadedFiles', expandedFolders],
        async () => {
            if (!webContainer) {
            return getStoredFiles()
            }
                const rootFiles = await getAllFiles(webContainer, '/')
                const newFileTree = [...rootFiles]

                for (const folder of expandedFolders) {
                    const folderFiles = await getAllFiles(webContainer, folder)
                    updateFileTree(newFileTree, folder, folderFiles)
                }

                return newFileTree
        },
        {
            initialData: getStoredFiles,
            onSuccess: (newFileTree) => {
                if (newFileTree?.length > 0 && !selectedFile) {
                    setSelectedFile(newFileTree[0])
                }
            }
        }
    )

    // File tree update helper
    const updateFileTree = useCallback((tree: FileNode[], folderPath: string, files: FileNode[]) => {
        const pathParts = folderPath.split('/').filter(Boolean)
        let currentLevel = tree

        for (const part of pathParts) {
            const folder = currentLevel.find(node => node.name.endsWith(`/${part}`) && node.type === 'folder')
            if (folder && folder.children) {
                currentLevel = folder.children
            } else {
                return
            }
        }

        const folderInTree = currentLevel.find(node => node.name === folderPath)
        if (folderInTree) {
            folderInTree.children = files
        }
    }, [])

    // Helper to get current file tree state
    const saveCurrentFiles = useCallback(async () => {
        if (webContainer) {
            const allFiles = await getAllFiles(webContainer, '/')
            saveFilesToStorage(allFiles)
        }
    }, [webContainer])

    // File content changes
    const handleCodeChangeMutation = useMutation(
        async ({ file, value }: { file: FileNode, value: string }) => {
            if (webContainer) {
                await webContainer.fs.writeFile(file.name, value)
                return { name: file.name, content: value }
            }
            throw new Error('webContainer not ready')
        },
        {
            onSuccess: () => {
                saveCurrentFiles()
            }
        }
    )

    const handleCodeChange = useCallback(async (value: string | undefined) => {
        if (selectedFile && value !== undefined) {
            handleCodeChangeMutation.mutate({ file: selectedFile, value })
        }
    }, [selectedFile, handleCodeChangeMutation])

    // File creation
    const handleNewFileMutation = useMutation(
        async (newFileName: string) => {
            if (webContainer) {
                const newFileContent = `// New file: ${newFileName}\n`
                await webContainer.fs.writeFile(newFileName, newFileContent)
                return { name: newFileName, type: 'file' as const, content: newFileContent }
            }
        },
        {
            onSuccess: (newFile) => {
                if (newFile) {
                    setSelectedFile(newFile)
                    saveCurrentFiles()
                }
            }
        }
    )

    const handleNewFile = useCallback(async () => {
        const newFileName = prompt('Enter new file name:')
        if (newFileName) {
            handleNewFileMutation.mutate(newFileName)
        }
    }, [handleNewFileMutation])

    // File opening
    const handleOpenFileMutation = useMutation(
        async (files: FileList) => {
            if (webContainer) {
                const newFiles = await Promise.all(Array.from(files).map(async file => {
                    const content = await file.text()
                    await webContainer.fs.writeFile(file.name, content)
                    return { name: file.name, type: 'file' as const, content }
                }))
                return newFiles
            }
        },
        {
            onSuccess: () => {
                saveCurrentFiles()
            }
        }
    )

    const handleOpenFile = useCallback(() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files
            if (files) {
                handleOpenFileMutation.mutate(files)
            }
        }
        input.click()
    }, [handleOpenFileMutation])

    // Code execution
    const executeCodeMutation = useMutation(
        async () => {
            if (webContainer) {
                const process = await webContainer.spawn('node', ['deploy.ts'])
                let output = ''
                process.output.pipeTo(new WritableStream({
                    write(data) {
                        output += data
                    }
                }))
                await process.exit
                return output
            }
        },
        {
            onSuccess: (output) => {
                if (output !== undefined) {
                    setExecutionResult(output)
                }
            }
        }
    )

    const executeCode = useCallback(() => {
        executeCodeMutation.mutate()
    }, [executeCodeMutation])

    // NPM installation
    const outputStream = useMemo(() => new TransformStream<string, string>(), [])

    const npmInstallMutation = useMutation(
        async (webContainer: WebContainer) => {
            const writer = outputStream.writable.getWriter()
            await writer.write('$ npm install\n')
            
            const installProcess = await webContainer.spawn('npm', ['install'])
            
            installProcess.output.pipeTo(new WritableStream({
                write: async (data) => {
                    await writer.write(data)
                }
            }))
            
            const exitCode = await installProcess.exit
            if (exitCode !== 0) {
                await writer.write(`\nError: npm install failed with exit code ${exitCode}\n`)
                throw new Error(`npm install failed with exit code ${exitCode}`)
            }

            const rootContents = await webContainer.fs.readdir('/')
            if (rootContents.includes('node_modules')) {
                const nodeModulesContents = await webContainer.fs.readdir('/node_modules')
                const packages = nodeModulesContents
                    .filter(name => !name.startsWith('.'))
                    .sort()
                    .join('\n')
                await writer.write('\nInstalled packages:\n' + packages + '\n')
            }

            await writer.write('\nnpm install completed successfully!\n$ ')
            writer.releaseLock()
        }
    )

    // Theme
    const { theme } = useTheme()
    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light'

    return (
        <>
            <FileExplorer
                sidebarWidth={sidebarWidth}
                setSidebarWidth={setSidebarWidth}
                isFileTreeCollapsed={isFileTreeCollapsed}
                setIsFileTreeCollapsed={setIsFileTreeCollapsed}
                selectedFile={selectedFile}
                fileTree={fileTree}
                expandedFolders={expandedFolders}
                handleNewFile={handleNewFile}
                handleOpenFile={handleOpenFile}
                handleFileSelect={setSelectedFile}
                toggleFolder={toggleFolder}
            />
            
            <div style={{minHeight:'calc(100vh - 68px)'}} className="flex-1 flex flex-col min-w-0 h-full">
                <CodeEditor
                    selectedFile={selectedFile}
                    handleCodeChange={handleCodeChange}
                    editorTheme={editorTheme}
                />
                
                <div className="absolute bottom-0 left-0 right-0">
                    <Suspense fallback={<div>Loading execution panel...</div>}>
                        <LazyExecutionPanel 
                            executeCode={executeCode} 
                            webcontainerInstance={webContainer}
                            outputStream={outputStream}
                        />
                    </Suspense>
                </div>
            </div>
        </>
    )
}
