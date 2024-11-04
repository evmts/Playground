import { WebContainer } from '@webcontainer/api'
import { usePlaygroundStore } from '@/state/State'
import { FileNode } from '@/utils/getAllFiles';

// Export initial files separately
export const initialFiles = {
  'SimpleStorage.sol': {
    file: {
      contents: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;

    function set(uint256 x) public {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}`
    }
  },
  'deploy.ts': {
    file: {
      contents: `import { ethers } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  console.log("SimpleStorage deployed to:", simpleStorage.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`
    }
  },
  'package.json': {
    file: {
      contents: `{
  "name": "tevm-playground",
  "description": "Interactive Solidity playground powered by TEVM",
  "type": "module",
  "dependencies": {
    "tevm": "1.0.0-next.114",
    "@tevm/ts-plugin": "1.0.0-next.109",
    "viem": "^2.21.10"
  }
}`
    }
  },
  'tsconfig.json': {
    file: {
      contents: `{
  "compilerOptions": {
    "strict": true
  },
  "plugins": [
    {
      "name": "@tevm/ts-plugin"
    }
  ]
}`
    }
  },
  'vite.config.ts': {
    file: {
      contents: `import { defineConfig } from 'vite';
import { vitePluginTevm } from 'tevm/bundler/vite-plugin';

export default defineConfig({
  plugins: [vitePluginTevm()]
});`
    }
  }
}

// Type for the WebContainer file format
export type WebContainerFiles = {
    [path: string]: {
        file: {
            contents: string;
        };
    };
}

// Convert FileNode[] to WebContainer format
export function convertToWebContainerFormat(files: FileNode[]): WebContainerFiles {
    const result: WebContainerFiles = {};
    
    files.forEach(file => {
        if (file.type === 'file') {
            result[file.name] = {
                file: {
                    contents: file.content || ''
                }
            };
        }
    });
    
    return result;
}

// Convert WebContainer format to FileNode[]
export function convertFromWebContainerFormat(files: WebContainerFiles): FileNode[] {
    return Object.entries(files).map(([name, data]) => ({
        name,
        type: 'file' as const,
        content: data.file.contents
    }));
}

// Add version number to storage key
export const STORAGE_VERSION = '1'
export const STORAGE_KEY = `playground-files-v${STORAGE_VERSION}`

// Get files from localStorage or use defaults
function getInitialFiles(): WebContainerFiles {
    const storedFiles = localStorage.getItem(STORAGE_KEY)
    if (storedFiles) {
        try {
            const parsed = JSON.parse(storedFiles)
            // Could add version checking logic here if needed
            return parsed
        } catch (e) {
            console.error('Failed to parse stored files:', e)
            return initialFiles
        }
    }
    
    // Clear any old versions from storage
    for (let i = 0; i < parseInt(STORAGE_VERSION); i++) {
        localStorage.removeItem(`playground-files-v${i}`)
    }
    
    return initialFiles
}

// Create the promise once, outside of any component
export async function getWebContainer() {
  const webcontainer = await WebContainer.boot()
  const files = getInitialFiles()
  await webcontainer.mount(files)

  // Get the append function from the store
  const appendExecutionResult = usePlaygroundStore.getState().appendExecutionResult

  // Start installation in the background and pipe output to store
  webcontainer.spawn('npm', ['install']).then(async (installProcess) => {
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          appendExecutionResult(`[npm install]: ${data}\n`)
        }
      })
    )
    
    const installExitCode = await installProcess.exit
    if (installExitCode !== 0) {
      appendExecutionResult('[npm install]: Installation failed\n')
    } else {
      appendExecutionResult('[npm install]: completed successfully\n')
    }
  })

  return webcontainer
}

// Add helper to save files to localStorage with version
export function saveFilesToStorage(files: FileNode[]) {
    try {
        const webContainerFiles = convertToWebContainerFormat(files)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: STORAGE_VERSION,
            files: webContainerFiles
        }))
    } catch (e) {
        console.error('Failed to save files to storage:', e)
    }
}
