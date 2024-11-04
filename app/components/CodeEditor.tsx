import { Editor } from '@monaco-editor/react'
import { FileNode } from '@/utils/getAllFiles'

interface CodeEditorProps {
    selectedFile: FileNode | null
    handleCodeChange: (value: string | undefined) => void
    editorTheme: string
}

export function CodeEditor({ selectedFile, handleCodeChange, editorTheme }: CodeEditorProps) {
    if (!selectedFile) return null

    const getLanguage = (filename: string) => {
        if (filename.endsWith('.sol')) return 'sol'
        if (filename.endsWith('.json')) return 'json'
        return 'typescript'
    }

    return (
        <div className="flex-1 overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage={getLanguage(selectedFile.name)}
                language={getLanguage(selectedFile.name)}
                value={selectedFile.content}
                onChange={handleCodeChange}
                theme={editorTheme}
                options={{
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
                }}
            />
        </div>
    )
}