import { WebContainer } from '@webcontainer/api'
import { FileNode } from '@/utils/getAllFiles'

export class WebContainerService {
    private container: WebContainer | null = null

    async initialize() {
        if (!this.container) {
            const { getWebContainer } = await import('@/web-container/webContainerPromise.js')
            this.container = await getWebContainer()
        }
        return this.container
    }

    async writeFile(path: string, content: string) {
        if (!this.container) throw new Error('WebContainer not initialized')
        await this.container.fs.writeFile(path, content)
    }

    async executeCode() {
        if (!this.container) throw new Error('WebContainer not initialized')
        const process = await this.container.spawn('node', ['deploy.ts'])
        let output = ''
        await process.output.pipeTo(new WritableStream({
            write(data) {
                output += data
            }
        }))
        await process.exit
        return output
    }

    async installDependencies() {
        if (!this.container) throw new Error('WebContainer not initialized')
        const process = await this.container.spawn('npm', ['install'])
        let output = ''
        const exitCode = await process.exit
        
        if (exitCode !== 0) {
            throw new Error(`npm install failed with exit code ${exitCode}`)
        }

        const rootContents = await this.container.fs.readdir('/')
        if (rootContents.includes('node_modules')) {
            const nodeModulesContents = await this.container.fs.readdir('/node_modules')
            output += '\n\nInstalled packages:\n' + nodeModulesContents.join('\n')
        }

        return output
    }

    async getAllFiles(path: string): Promise<FileNode[]> {
        if (!this.container) throw new Error('WebContainer not initialized')
        // Implementation from your getAllFiles utility
        return []
    }
}