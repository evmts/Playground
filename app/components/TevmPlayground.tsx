import { useState, useCallback, useMemo } from 'react'
import { Editor } from '@monaco-editor/react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, File, Plus, Upload, Diamond, Play, Settings, Moon, Sun, Folder, FolderOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { useTheme } from 'next-themes'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { webContainerPromise } from '../web-container/webContainerPromise.js'
import { WebContainer } from '@webcontainer/api'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  content: string
  children?: FileNode[]
}

async function getAllFiles(webcontainerInstance: WebContainer, dir: string = '/'): Promise<FileNode[]> {
  const entries = await webcontainerInstance.fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = `${dir}/${entry.name}`.replace(/\/+/g, '/');
    if (entry.isDirectory()) {
      return {
        name: fullPath,
        type: 'folder' as const,
        content: '',
        children: []
      };
    } else {
      const content = await webcontainerInstance.fs.readFile(fullPath, 'utf-8');
      return { name: fullPath, type: 'file' as const, content };
    }
  }));
  return files;
}

export function TevmPlayground() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [isFileTreeCollapsed, setIsFileTreeCollapsed] = useState(false)
  const [isResultCollapsed, setIsResultCollapsed] = useState(false)
  const [executionResult, setExecutionResult] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [resultHeight, setResultHeight] = useState(200)
  const { theme, setTheme } = useTheme()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const queryClient = useQueryClient()

  const { data: webcontainerInstance, isLoading: isWebcontainerLoading } = useQuery('webcontainer', () => webContainerPromise, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  const { isLoading: isLoadedFilesLoading, refetch: refetchLoadedFiles } = useQuery(
    ['loadedFiles', expandedFolders],
    async () => {
      if (webcontainerInstance) {
        const rootFiles = await getAllFiles(webcontainerInstance, '/');
        const newFileTree = [...rootFiles];

        for (const folder of expandedFolders) {
          const folderFiles = await getAllFiles(webcontainerInstance, folder);
          updateFileTree(newFileTree, folder, folderFiles);
        }

        setFileTree(newFileTree);
      }
    },
    {
      enabled: !isWebcontainerLoading,
      onSuccess: () => {
        if (fileTree.length > 0 && !selectedFile) {
          setSelectedFile(fileTree[0])
        }
      }
    }
  )

  const updateFileTree = useCallback((tree: FileNode[], folderPath: string, files: FileNode[]) => {
    const pathParts = folderPath.split('/').filter(Boolean);
    let currentLevel = tree;

    for (const part of pathParts) {
      const folder = currentLevel.find(node => node.name.endsWith(`/${part}`) && node.type === 'folder');
      if (folder && folder.children) {
        currentLevel = folder.children;
      } else {
        return; // Folder not found in the tree
      }
    }

    // Update the children of the folder
    const folderInTree = currentLevel.find(node => node.name === folderPath);
    if (folderInTree) {
      folderInTree.children = files;
    }
  }, []);

  const handleFileSelect = useCallback((file: FileNode) => {
    setSelectedFile(file)
  }, [])

  const handleCodeChangeMutation = useMutation(
    async ({ file, value }: { file: FileNode, value: string }) => {
      if (webcontainerInstance) {
        await webcontainerInstance.fs.writeFile(file.name, value)
        return { name: file.name, content: value }
      }
      throw new Error('WebContainer not ready')
    }
  )

  const handleCodeChange = useCallback(async (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      handleCodeChangeMutation.mutate({ file: selectedFile, value })
    }
  }, [selectedFile, handleCodeChangeMutation])

  const handleNewFileMutation = useMutation(
    async (newFileName: string) => {
      if (webcontainerInstance) {
        const newFileContent = `// New file: ${newFileName}\n`
        await webcontainerInstance.fs.writeFile(newFileName, newFileContent)
        return { name: newFileName, type: 'file' as const, content: newFileContent }
      }
    },
    {
      onSuccess: (newFile) => {
        if (newFile) {
          setSelectedFile(newFile)
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

  const handleOpenFileMutation = useMutation(
    async (files: FileList) => {
      if (webcontainerInstance) {
        const newFiles = await Promise.all(Array.from(files).map(async file => {
          const content = await file.text()
          await webcontainerInstance.fs.writeFile(file.name, content)
          return { name: file.name, type: 'file' as const, content }
        }))
        return newFiles
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

  const executeCodeMutation = useMutation(
    async () => {
      if (webcontainerInstance) {
        const process = await webcontainerInstance.spawn('node', ['deploy.ts'])
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

  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  }, []);

  const getFileIcon = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.name)
        ? <FolderOpen className="inline-block mr-2 h-5 w-5 text-yellow-400" />
        : <Folder className="inline-block mr-2 h-5 w-5 text-yellow-400" />
    }
    if (file.name.endsWith('.sol')) return <Diamond className="inline-block mr-2 h-5 w-5 text-emerald-400" />
    if (file.name.endsWith('.ts')) return <svg className="inline-block mr-2 h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" /></svg>
    return <File className="inline-block mr-2 h-5 w-5 text-gray-400" />
  }, [expandedFolders])

  const editorTheme = useMemo(() => theme === 'dark' ? 'vs-dark' : 'light', [theme])

  const npmInstallMutation = useMutation(
    async () => {
      if (webcontainerInstance) {
        const installProcess = await webcontainerInstance.spawn('npm', ['install'])

        let output = ''
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            output += data
            setExecutionResult(prev => prev + data) // Update in real-time
          }
        }))

        const exitCode = await installProcess.exit

        if (exitCode !== 0) {
          throw new Error(`npm install failed with exit code ${exitCode}`)
        }

        // Check for node_modules after install
        const rootContents = await webcontainerInstance.fs.readdir('/')
        if (rootContents.includes('node_modules')) {
          const nodeModulesContents = await webcontainerInstance.fs.readdir('/node_modules')
          output += '\n\nInstalled packages:\n' + nodeModulesContents.join('\n')
        }

        return output
      }
      throw new Error('WebContainer not ready')
    },
    {
      onMutate: () => {
        setExecutionResult('Running npm install...\n')
      },
      onSuccess: (output) => {
        setExecutionResult(prev => `${prev}\nnpm install completed successfully.${output}`)
        setExpandedFolders(new Set()) // Reset expanded folders to trigger a full refetch
        refetchLoadedFiles()
      },
      onError: (error: Error) => {
        setExecutionResult(prev => `${prev}\nError during npm install: ${error.message}`)
      },
      onSettled: () => {
        setExpandedFolders(new Set()) // Reset expanded folders to trigger a full refetch
        refetchLoadedFiles()
      }
    }
  )

  const handleNpmInstall = useCallback(() => {
    npmInstallMutation.mutate()
  }, [npmInstallMutation])

  const renderFileTree = useCallback((files: FileNode[], depth = 0) => {
    return files.map((file) => (
      <div key={file.name}>
        <div
          className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200 ease-in-out ${selectedFile?.name === file.name ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={() => file.type === 'folder' ? toggleFolder(file.name) : handleFileSelect(file)}
        >
          {file.type === 'folder' && (
            expandedFolders.has(file.name)
              ? <ChevronDown className="inline-block mr-1 h-4 w-4" />
              : <ChevronRight className="inline-block mr-1 h-4 w-4" />
          )}
          {getFileIcon(file)}
          <span className={`${isFileTreeCollapsed ? 'hidden' : ''} ml-1`}>{file.name.split('/').pop()}</span>
        </div>
        {file.type === 'folder' && expandedFolders.has(file.name) && file.children && (
          <div>
            {renderFileTree(file.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  }, [selectedFile, isFileTreeCollapsed, getFileIcon, handleFileSelect, expandedFolders, toggleFolder]);

  if (isWebcontainerLoading) {
    return <div>Loading WebContainer...</div>
  }

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Tevm Playground</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Resizable
          size={{ width: sidebarWidth, height: '100%' }}
          minWidth={200}
          maxWidth={400}
          onResize={(_e, _direction, _ref, d) => {
            setSidebarWidth(sidebarWidth + d.width)
          }}
          enable={{ right: true }}
          className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isFileTreeCollapsed ? 'w-16' : ''} flex flex-col transition-all duration-300 ease-in-out shadow-md`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <span className={`font-semibold text-gray-700 dark:text-gray-300 ${isFileTreeCollapsed ? 'hidden' : ''}`}>Files</span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewFile}
                title="New File"
                className="mr-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">New File</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenFile}
                title="Open File/Folder"
                className="mr-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
              >
                <Upload className="h-5 w-5" />
                <span className="sr-only">Open File/Folder</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFileTreeCollapsed(!isFileTreeCollapsed)}
                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                aria-label={isFileTreeCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isFileTreeCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {isLoadedFilesLoading ? (
              <div>Loading files...</div>
            ) : (
              renderFileTree(fileTree)
            )}
          </ScrollArea>
        </Resizable>
        <div className="flex-1 flex flex-col min-w-0">
          {selectedFile && (
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage={selectedFile.name.endsWith('.sol') ? 'sol' : 'typescript'}
                language={selectedFile.name.endsWith('.sol') ? 'sol' : 'typescript'}
                value={selectedFile.content}
                onChange={handleCodeChange}
                theme={editorTheme}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 15,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontLigatures: true,
                  lineHeight: 1.6,
                  padding: { top: 20, bottom: 20 },
                  smoothScrolling: true,
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  contextmenu: false,
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: 'always',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          )}
          <Resizable
            size={{ height: resultHeight, width: '100%' }}
            minHeight={100}
            maxHeight={500}
            onResize={(_e, _direction, _ref, d) => {
              setResultHeight(resultHeight + d.height)
            }}
            enable={{ top: true }}
            className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden shadow-md ${isResultCollapsed ? 'h-12' : ''
              }`}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Execution Result</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNpmInstall}
                  disabled={npmInstallMutation.isLoading}
                  className="mr-2 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                >
                  {npmInstallMutation.isLoading ? 'Installing...' : 'npm install'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={executeCode}
                  className="mr-2 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                >
                  <Play className="h-4 w-4 mr-1" /> Run
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsResultCollapsed(!isResultCollapsed)}
                  className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                  aria-label={isResultCollapsed ? "Expand result" : "Collapse result"}
                >
                  {isResultCollapsed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <ScrollArea className={`h-[calc(100%-3rem)] ${isResultCollapsed ? 'hidden' : ''}`}>
              <pre className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{executionResult}</pre>
            </ScrollArea>
          </Resizable>
        </div>
      </div>
    </div>
  )
}
