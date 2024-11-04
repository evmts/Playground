import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { usePlaygroundStore } from '@/state/State'
import { useCallback } from 'react'
import 'xterm/css/xterm.css'
import { Button } from "./ui/button"

interface ExecutionPanelProps {
    executeCode: () => void
}

export function ExecutionPanel({ executeCode }: ExecutionPanelProps) {
    const { 
        resultHeight,
        setResultHeight,
        isResultCollapsed,
        setIsResultCollapsed,
        terminal,
        initializeTerminal,
        disposeTerminal,
        fitAddon
    } = usePlaygroundStore()

    const handleTerminalMount = useCallback((element: HTMLDivElement | null) => {
        if (element && !terminal) {
            initializeTerminal(element)
        }
    }, [terminal, initializeTerminal])

    const handleTerminalInput = useCallback((executeCode: () => void) => {
        if (!terminal) return

        terminal.onKey(({ key, domEvent }) => {
            if (domEvent.keyCode === 13) { // Enter
                executeCode()
            } else {
                terminal.write(key)
            }
        })
    }, [terminal])

    return (
        <Resizable
            size={{ height: resultHeight, width: '100%' }}
            minHeight={100}
            maxHeight={500}
            onResizeStop={(_e, _direction, _ref, d) => {
                setResultHeight(resultHeight + d.height)
                fitAddon?.fit()
            }}
            enable={{ top: true }}
            className={`bg-[#1a1b26] border-t border-gray-700 overflow-hidden shadow-md ${
                isResultCollapsed ? 'h-12' : ''
            } z-10`}
        >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-[#1a1b26]">
                <span className="font-semibold text-gray-300">Terminal</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsResultCollapsed(!isResultCollapsed)}
                    className="text-gray-400 hover:text-indigo-400 hover:bg-[#33467C]"
                    aria-label={isResultCollapsed ? "Expand terminal" : "Collapse terminal"}
                >
                    {isResultCollapsed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
            </div>
            <div 
                ref={handleTerminalMount}
                className={`h-[calc(100%-3rem)] ${isResultCollapsed ? 'hidden' : ''}`}
                onClick={() => terminal?.focus()}
            />
        </Resizable>
    )
}