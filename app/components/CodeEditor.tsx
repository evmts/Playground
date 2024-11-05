import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { usePlaygroundStore } from '@/state/usePlaygroundStore'
import { WebContainer } from '@webcontainer/api'
import { useHandleCodeChange } from '@/hooks/useHandleCodeChange'

interface CodeEditorProps {
    webContainer?: WebContainer
}

const EDITOR_OPTIONS = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 15,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontLigatures: true,
    lineHeight: 1.6,
    padding: { top: 20, bottom: 20 },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'all',
    contextmenu: false,
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    formatOnPaste: true,
    formatOnType: true,
} as const

export function CodeEditor({ webContainer }: CodeEditorProps) {
    const { theme } = useTheme()

    const selectedFile = usePlaygroundStore(({ selectedFile }) => selectedFile)

    const language = ((filename: string) => {
        if (filename.endsWith('.sol')) return 'sol'
        if (filename.endsWith('.json')) return 'json'
        return 'typescript'
    })(selectedFile?.name ?? 'loading.sol')

    const handleCodeChangeMutation = useHandleCodeChange({ webContainer })

    return (
        <div className="flex-1 overflow-hidden">
            <Editor
                defaultLanguage={language}
                language={language}
                value={selectedFile?.content ?? 'loading'}
                onChange={value => handleCodeChangeMutation.mutate({ value })}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={EDITOR_OPTIONS}
                height="100%"
                loading={
                    <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Loading editor...
                    </div>
                }
            />
        </div>
    )
}
