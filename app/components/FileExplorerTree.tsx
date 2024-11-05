import { useFileTree } from '@/hooks/useFileTree'
import { usePlaygroundStore } from '@/state/usePlaygroundStore'
import { FileNode } from '@/web-container/getAllFiles'
import { WebContainer } from '@webcontainer/api'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { FileIcon } from './FileIcon'

interface FileExplorerProps {
    webContainer?: WebContainer
}

export function FileExplorerTree({
    webContainer
}: FileExplorerProps) {
    const { data: fileTree = [] } = useFileTree({ webContainer })

    const selectedFile = usePlaygroundStore(({ selectedFile }) => selectedFile)
    const expandedFolders = usePlaygroundStore(({ expandedFolders }) => expandedFolders)
    const isFileTreeCollapsed = usePlaygroundStore(({ isFileTreeCollapsed }) => isFileTreeCollapsed)

    const renderFileTree = (files: FileNode[], depth = 0) => {
        return files.map((file) => (
            <div key={`${depth}${file.name}`}>
                <div
                    className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 ${selectedFile?.name === file.name ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-medium' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 16}px` }}
                    onClick={() => file.type === 'folder' ? usePlaygroundStore.getState().toggleFolder(file.name) : usePlaygroundStore.getState().setSelectedFile(file)}
                >
                    {file.type === 'folder' && (
                        expandedFolders.has(file.name)
                            ? <ChevronDown className="inline-block mr-1 h-4 w-4" />
                            : <ChevronRight className="inline-block mr-1 h-4 w-4" />
                    )}
                    <FileIcon file={file} />
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

    return renderFileTree(fileTree)
}
