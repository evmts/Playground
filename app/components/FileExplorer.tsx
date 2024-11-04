import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { FileNode } from '@/utils/getAllFiles'
import { ChevronLeft, ChevronRight, Plus, Upload, File, Folder, FolderOpen, ChevronDown, Diamond } from 'lucide-react'
import { useState } from 'react'

interface FileExplorerProps {
    sidebarWidth: number
    setSidebarWidth: (width: number) => void
    isFileTreeCollapsed: boolean
    setIsFileTreeCollapsed: (collapsed: boolean) => void
    selectedFile: FileNode | null
    fileTree: FileNode[]
    expandedFolders: Set<string>
    handleNewFile: () => void
    handleOpenFile: () => void
    handleFileSelect: (file: FileNode) => void
    toggleFolder: (path: string) => void
    isLoadingFiles: boolean
}

export function FileExplorer({
    sidebarWidth,
    setSidebarWidth,
    isFileTreeCollapsed,
    setIsFileTreeCollapsed,
    selectedFile,
    fileTree,
    expandedFolders,
    handleNewFile,
    handleOpenFile,
    handleFileSelect,
    toggleFolder,
}: FileExplorerProps) {
    const getFileIcon = (file: FileNode) => {
        if (file.type === 'folder') {
            return expandedFolders.has(file.name)
                ? <FolderOpen className="inline-block mr-2 h-5 w-5 text-yellow-400" />
                : <Folder className="inline-block mr-2 h-5 w-5 text-yellow-400" />
        }
        if (file.name.endsWith('.sol')) return <Diamond className="inline-block mr-2 h-5 w-5 text-emerald-400" />
        if (file.name.endsWith('.ts')) return <svg className="inline-block mr-2 h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" /></svg>
        return <File className="inline-block mr-2 h-5 w-5 text-gray-400" />
    }

    const renderFileTree = (files: FileNode[], depth = 0) => {
        return files.map((file) => (
            <div key={file.name}>
                <div
                    className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 ${
                        selectedFile?.name === file.name ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-medium' : 'text-gray-700 dark:text-gray-300'
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
        ))
    }

    return (
        <Resizable
            size={{ width: sidebarWidth, height: '100%' }}
            minWidth={200}
            maxWidth={'50%'}
            minHeight={'calc(100vh - 68px)'}
            onResizeStop={(_e, _direction, _ref, d) => {
                setSidebarWidth(sidebarWidth + d.width)
            }}
            enable={{ right: true }}
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
                isFileTreeCollapsed ? 'w-16' : ''
            } flex flex-col overflow-x-hidden`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className={`font-semibold text-gray-700 dark:text-gray-300 ${isFileTreeCollapsed ? 'hidden' : ''}`}>Files</span>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNewFile}
                        title="New File"
                        className="mr-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">New File</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenFile}
                        title="Open File/Folder"
                        className="mr-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                        <Upload className="h-5 w-5" />
                        <span className="sr-only">Open File/Folder</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFileTreeCollapsed(!isFileTreeCollapsed)}
                        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        aria-label={isFileTreeCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isFileTreeCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                {
                    renderFileTree(fileTree)
                }
            </ScrollArea>
        </Resizable>
    )
}