import { useFileTree } from '@/hooks/useFileTree'
import { usePlaygroundStore } from '@/state/usePlaygroundStore'
import { FileNode } from '@/web-container/getAllFiles'
import { WebContainer } from '@webcontainer/api'
import { ChevronRight, File, Folder, FolderOpen, ChevronDown, Diamond } from 'lucide-react'

interface FileExplorerProps {
    webContainer?: WebContainer
}

export function FileExplorerTree({
    webContainer
}: FileExplorerProps) {
    const { data: fileTree = [] } = useFileTree({ webContainer })

    const { selectedFile, expandedFolders, isFileTreeCollapsed } = usePlaygroundStore()

    const getFileIcon = (file: FileNode) => {
        if (file.type === 'folder') {
            return expandedFolders.has(file.name)
                ? <FolderOpen className="inline-block mr-2 h-5 w-5 text-yellow-400" />
                : <Folder className="inline-block mr-2 h-5 w-5 text-yellow-400" />
        }
        if (file.name.endsWith('.sol')) {
            return <Diamond className="inline-block mr-2 h-5 w-5 text-emerald-400" />
        }
        if (file.name.endsWith('.ts')) {
            return <svg className="inline-block mr-2 h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" /></svg>
        }
        return <File className="inline-block mr-2 h-5 w-5 text-gray-400" />
    }

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

    return renderFileTree(fileTree)
}
