import { WebContainer } from '@webcontainer/api'
import { usePlaygroundStore } from '@/state/State'

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

// Create the promise once, outside of any component
export async function getWebContainer() {
  const webcontainer = await WebContainer.boot()
  await webcontainer.mount(initialFiles)

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
