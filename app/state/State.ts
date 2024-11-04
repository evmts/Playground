import { create } from 'zustand'
import { FileNode } from '@/utils/getAllFiles'

interface PlaygroundState {
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

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
    // Initial state
    selectedFile: null,
    isFileTreeCollapsed: false,
    isResultCollapsed: false,
    sidebarWidth: 280,
    resultHeight: 200,
    executionResult: '',
    expandedFolders: new Set(),

    // Actions
    setSelectedFile: (file) => set({ selectedFile: file }),
    setIsFileTreeCollapsed: (collapsed) => set({ isFileTreeCollapsed: collapsed }),
    setIsResultCollapsed: (collapsed) => set({ isResultCollapsed: collapsed }),
    setSidebarWidth: (width) => set({ sidebarWidth: width }),
    setResultHeight: (height) => {
        set({ resultHeight: height })
    },
    setExecutionResult: (result) => set({ executionResult: result }),
    appendExecutionResult: (result) => set((state) => ({ 
        executionResult: state.executionResult + result 
    })),
    toggleFolder: (folderPath) => set((state) => {
        const newSet = new Set(state.expandedFolders)
        if (newSet.has(folderPath)) {
            newSet.delete(folderPath)
        } else {
            newSet.add(folderPath)
        }
        return { expandedFolders: newSet }
    })
}))