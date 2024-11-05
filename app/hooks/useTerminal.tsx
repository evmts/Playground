import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useQuery } from 'react-query'

interface ExecutionPanelProps {
    outputStream: TransformStream<string, string>
}

export function useTerminal({ outputStream }: ExecutionPanelProps) {
    return useQuery({
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
}
