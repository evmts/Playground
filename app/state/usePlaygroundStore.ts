import { create } from 'zustand'
import { PlaygroundState } from './PlaygroundState'

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
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
    setResultHeight: (height) => set({ resultHeight: height }),
    setExecutionResult: (result) => set({ executionResult: result }),
    appendExecutionResult: (result) => {
        set((state) => ({ executionResult: state.executionResult + result }))
    },
    toggleFolder: (folderPath) => set((state) => {
        const newSet = new Set(state.expandedFolders)
        if (newSet.has(folderPath)) {
            newSet.delete(folderPath)
        } else {
            newSet.add(folderPath)
        }
        return { expandedFolders: newSet }
    }),
}))
