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

