import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { useQuery } from 'react-query'
import { useCallback } from 'react'
import { usePlaygroundStore } from '@/state/State'
import { WebContainer } from '@webcontainer/api'

interface ExecutionPanelProps {
    executeCode: () => void
    webcontainerInstance?: WebContainer
    outputStream: TransformStream<string, string>
    runCommand: (params: { command: string, args: string[] }) => void
}

interface TerminalInstance {
    terminal: Terminal
    fitAddon: FitAddon
    write: (data: string) => void
}

export function ExecutionPanel({ executeCode, webcontainerInstance, outputStream, runCommand }: ExecutionPanelProps) {
    const { data: terminalInstance } = useQuery({
        queryKey: ['terminal'],
        queryFn: async () => {
            const term = new Terminal({
                cursorBlink: true,
                fontFamily: 'monospace',
                fontSize: 14,
                convertEol: true,
                allowTransparency: true,
                scrollback: 1000,
                cols: 80,
                rows: 24,
                allowProposedApi: true,
            })

            const fitAddon = new FitAddon()
            term.loadAddon(fitAddon)

            outputStream.readable.pipeTo(
                new WritableStream({
                    write: (data) => {
                        if (typeof data === 'string') {
                            term.write(data)
                        } else {
                            const decoder = new TextDecoder()
                            term.write(decoder.decode(data))
                        }
                    }
                })
            )

            return { terminal: term, fitAddon }
        },
        staleTime: Infinity,
    })

    const handleTerminalMount = useCallback((element: HTMLDivElement | null) => {
        if (element && terminalInstance) {
            terminalInstance.terminal.open(element)
            terminalInstance.fitAddon.fit()
            terminalInstance.terminal.write('$ ')
            terminalInstance.terminal.focus()
        }
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