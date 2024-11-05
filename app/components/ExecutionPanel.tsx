import 'xterm/css/xterm.css'
import { useCallback } from 'react'
import { useTerminal } from '@/hooks/useTerminal'

interface ExecutionPanelProps {
    outputStream: TransformStream<string, string>
}

export function ExecutionPanel({ outputStream }: ExecutionPanelProps) {
    const { data: terminalInstance } = useTerminal({ outputStream })

    const handleTerminalMount = useCallback((element: HTMLDivElement | null) => {
        if (!element || !terminalInstance) {
            return
        }
        terminalInstance.terminal.open(element)
        terminalInstance.fitAddon.fit()
        terminalInstance.terminal.write('$ ')
    }, [terminalInstance])

    return (
        <div className="h-[300px] bg-black">
            <div
                ref={handleTerminalMount}
                className="h-full"
                onClick={() => terminalInstance?.terminal.focus()}
            />
        </div>
    )
}
