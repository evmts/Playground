import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { FileExplorerButtons } from "./FileExplorerButtons"
import { FileExplorerTree } from "./FileExplorerTree"
import { usePlaygroundStore } from "@/state/usePlaygroundStore"
import { WebContainer } from "@webcontainer/api"

interface FileExplorerProps {
    webContainer?: WebContainer
}

export function FileExplorer({
    webContainer,
}: FileExplorerProps) {
    const isFileTreeCollapsed = usePlaygroundStore(({ isFileTreeCollapsed }) => isFileTreeCollapsed)
    const setSidebarWidth = usePlaygroundStore(({ setSidebarWidth }) => setSidebarWidth)
    const sidebarWidth = usePlaygroundStore(({ sidebarWidth }) => sidebarWidth)

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
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isFileTreeCollapsed ? 'w-16' : ''
                } flex flex-col overflow-x-hidden`}
        >
            <FileExplorerButtons
                webContainer={webContainer}
            />
            <ScrollArea className="flex-1">
                <FileExplorerTree
                    webContainer={webContainer}
                />
            </ScrollArea>
        </Resizable>
    )
}
