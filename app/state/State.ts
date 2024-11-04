import { create } from 'zustand'
import { FileNode } from '@/utils/getAllFiles'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

interface PlaygroundState {
    // UI State
    selectedFile: FileNode | null
    isFileTreeCollapsed: boolean
    isResultCollapsed: boolean
    sidebarWidth: number
    resultHeight: number
    executionResult: string
    expandedFolders: Set<string>
    terminal: Terminal | null
    fitAddon: FitAddon | null

    // Actions
    setSelectedFile: (file: FileNode | null) => void
    setIsFileTreeCollapsed: (collapsed: boolean) => void
    setIsResultCollapsed: (collapsed: boolean) => void
    setSidebarWidth: (width: number) => void
    setResultHeight: (height: number) => void
    setExecutionResult: (result: string) => void
    appendExecutionResult: (result: string) => void
    toggleFolder: (folderPath: string) => void
    initializeTerminal: (element: HTMLDivElement) => void
    disposeTerminal: () => void
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
    // Initial state
    selectedFile: null,
    isFileTreeCollapsed: false,
    isResultCollapsed: false,
    sidebarWidth: 280,
    resultHeight: 200,
    executionResult: '',
    expandedFolders: new Set(),
    terminal: null,
    fitAddon: null,

    // Actions
    setSelectedFile: (file) => set({ selectedFile: file }),
    setIsFileTreeCollapsed: (collapsed) => set({ isFileTreeCollapsed: collapsed }),
    setIsResultCollapsed: (collapsed) => set({ isResultCollapsed: collapsed }),
    setSidebarWidth: (width) => set({ sidebarWidth: width }),
    setResultHeight: (height) => set({ resultHeight: height }),
    setExecutionResult: (result) => set({ executionResult: result }),
    appendExecutionResult: (result) => {
        const { terminal } = get()
        if (terminal) {
            terminal.write('\r\n' + result)
            terminal.write('\r\n$ ')
        }
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
    initializeTerminal: (element) => {
        const term = new Terminal({
            theme: {
                background: '#1a1b26',
                foreground: '#a9b1d6',
                cursor: '#c0caf5',
                black: '#414868',
                brightBlack: '#414868',
                red: '#f7768e',
                brightRed: '#f7768e',
                green: '#73daca',
                brightGreen: '#73daca',
                yellow: '#e0af68',
                brightYellow: '#e0af68',
                blue: '#7aa2f7',
                brightBlue: '#7aa2f7',
                magenta: '#bb9af7',
                brightMagenta: '#bb9af7',
                cyan: '#7dcfff',
                brightCyan: '#7dcfff',
                white: '#c0caf5',
                brightWhite: '#c0caf5'
            },
            cursorBlink: true,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            lineHeight: 1.2,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(element)
        fitAddon.fit()

        term.write('\r\n$ ')
        term.focus()

        set({ terminal: term, fitAddon })
    },
    disposeTerminal: () => {
        const { terminal } = get()
        if (terminal) {
            terminal.dispose()
            set({ terminal: null, fitAddon: null })
        }
    }
}))