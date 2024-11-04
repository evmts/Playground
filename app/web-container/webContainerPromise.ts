import { WebContainer } from '@webcontainer/api'
import { usePlaygroundStore } from '@/state/State'
import { FileNode } from '@/utils/getAllFiles';

// Export initial files separately
export const initialFiles = {
  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tevm Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/main.ts"></script>
</body>
</html>`
    }
  },
  'main.ts': {
    file: {
      contents: `import { createMemoryClient, http } from "tevm";
import { redstone } from "tevm/common";
import { Counter } from './Counter.s.sol'

const app = document.querySelector("#app") as Element;

const memoryClient = createMemoryClient({
  common: redstone,
  fork: {
    transport: http("https://rpc.redstonechain.com")({}),
  },
});

async function runApp() {
  app.innerHTML = \`
    <b>Status:</b> <span id="status">initializing</span><br/>
    <b>Forked at block:</b> <span id="blocknumber">???</span><br/>
    <b>Counter Contract:</b><br/>
    <pre id="contract"></pre>
  \`;

  const status = app.querySelector("#status")!;
  status.innerHTML = "Working";
  
  const blockNumber = await memoryClient.getBlockNumber();
  document.querySelector("#blocknumber")!.innerHTML = blockNumber;
  
  // Show contract details
  document.querySelector("#contract")!.innerHTML = JSON.stringify({
    abi: Counter.abi,
    bytecode: Counter.bytecode,
  }, null, 2);
  
  status.innerHTML = "Done";
}

runApp();`
    }
  },
  'Counter.s.sol': {
    file: {
      contents: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}`
    }
  },
  'package.json': {
    file: {
      contents: `{
  "name": "tevm-playground",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "preview": "vite preview"
  },
  "dependencies": {
    "tevm": "^1.0.0-next.114",
    "viem": "^2.21.10"
  },
  "devDependencies": {
    "@tevm/ts-plugin": "^1.0.0-next.114",
    "@tevm/vite-plugin": "^1.0.0-next.114",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.0"
  }
}`
    }
  },
  'tsconfig.json': {
    file: {
      contents: `{
  "compilerOptions": {
    "target": "ES2021",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
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
      contents: `import { defineConfig } from 'vite'
import { vitePluginTevm as tevm } from '@tevm/vite-plugin'

export default defineConfig({
  plugins: [tevm()],
  test: {
    environment: 'node',
    globals: true
  }
})`
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
  cachedContainer = cachedContainer ?? WebContainer.boot().then(async (webcontainer) => {
    const files = getInitialFiles()
    await webcontainer.mount(files)
    return webcontainer
  })
  return cachedContainer
}

let cachedContainer: Promise<WebContainer> | undefined = undefined

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
