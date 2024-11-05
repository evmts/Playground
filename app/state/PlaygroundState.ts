import { FileNode } from '@/web-container/getAllFiles'

export interface PlaygroundState {
    // UI State
    selectedFile: FileNode | null
    isFileTreeCollapsed: boolean
    isResultCollapsed: boolean
    sidebarWidth: number
    resultHeight: number
    executionResult: string
    expandedFolders: Set<string>

    // Actions
    setSelectedFile: (file: FileNode | null) => void
    setIsFileTreeCollapsed: (collapsed: boolean) => void
    setIsResultCollapsed: (collapsed: boolean) => void
    setSidebarWidth: (width: number) => void
    setResultHeight: (height: number) => void
    setExecutionResult: (result: string) => void
    appendExecutionResult: (result: string) => void
    toggleFolder: (folderPath: string) => void
}
