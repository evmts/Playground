import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from 're-resizable'
import { ChevronUp, ChevronDown, Play } from 'lucide-react'
import { usePlaygroundStore } from '@/state/State'

interface ExecutionPanelProps {
    executeCode: () => void
}

export function ExecutionPanel({ executeCode }: ExecutionPanelProps) {
    const { 
        resultHeight,
        setResultHeight,
        isResultCollapsed,
        setIsResultCollapsed,
        executionResult
    } = usePlaygroundStore()

    return (
        <Resizable
            size={{ height: resultHeight, width: '100%' }}
            minHeight={100}
            maxHeight={500}
            onResize={(_e, _direction, _ref, d) => {
                setResultHeight(resultHeight + d.height)
            }}
            enable={{ top: true }}
            className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden shadow-md ${
                isResultCollapsed ? 'h-12' : ''
            }`}
        >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Execution Result</span>
                <div className="flex items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={executeCode}
                        className="mr-2 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                    >
                        <Play className="h-4 w-4 mr-1" /> Run
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsResultCollapsed(!isResultCollapsed)}
                        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                        aria-label={isResultCollapsed ? "Expand result" : "Collapse result"}
                    >
                        {isResultCollapsed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            <ScrollArea className={`h-[calc(100%-3rem)] ${isResultCollapsed ? 'hidden' : ''}`}>
                <pre className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {executionResult}
                </pre>
            </ScrollArea>
        </Resizable>
    )
}