import { Button } from "@/components/ui/button"
import { useNewFileMutation } from "@/hooks/useNewFileMutation"
import { usePlaygroundStore } from "@/state/usePlaygroundStore"
import { WebContainer } from "@webcontainer/api"
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useCallback } from "react"

interface FileExplorerProps {
    webContainer?: WebContainer
}

export function FileExplorerButtons({
    webContainer
}: FileExplorerProps) {
    const isFileTreeCollapsed = usePlaygroundStore(({ isFileTreeCollapsed }) => isFileTreeCollapsed)
    const setIsFileTreeCollapsed = usePlaygroundStore(({ setIsFileTreeCollapsed }) => setIsFileTreeCollapsed)

    const handleNewFileMutation = useNewFileMutation({ webContainer })

    const handleNewFile = useCallback(async () => {
        const newFileName = prompt('Enter new file name:')
        if (newFileName) {
            handleNewFileMutation.mutate(newFileName)
        }
    }, [handleNewFileMutation])

    return (
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
                    onClick={() => setIsFileTreeCollapsed(!isFileTreeCollapsed)}
                    className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    aria-label={isFileTreeCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isFileTreeCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    )
}
