import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryClient } from 'tevm'
import { parseEther } from 'viem'
import { RuggedGame } from './RuggedGame.s.sol'

describe('RuggedGame', () => {
  const memoryClient = createMemoryClient()
  let contractAddress: `0x${string}`

  beforeEach(async () => {
    const randomSource = `0x${'69'.repeat(20)}` as const
    // Deploy the contract before each test
    const { createdAddress } = await memoryClient.tevmDeploy({
        ...RuggedGame,
        args: [randomSource]
    })
    if (!createdAddress) throw new Error('Expected addy')
    contractAddress = createdAddress
  })

  it('should allow registration when game is open', async () => {
    const player = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    const gameId = await memoryClient.readContract({
      address: contractAddress,
      abi: RuggedGame.abi,
      functionName: 'nextGame',
    })

    await memoryClient.tevmContract({
      to: contractAddress,
      abi: RuggedGame.abi,
      functionName: 'register',
      args: [gameId],
      value: parseEther('0.02'),
      from: player,
    })

    // Check if the Registered event was emitted
    const logs = await memoryClient.getLogs({
      address: contractAddress,
      event: {
        type: 'event',
        name: 'Registered',
        inputs: [
          { type: 'address', name: 'player' },
          { type: 'uint256', name: 'gameId' },
        ],
      },
    })

    expect(logs.length).toBe(1)
    expect(logs[0].args.player).toBe(player)
    expect(logs[0].args.gameId).toBe(gameId)
  })

  it('should return correct game status', async () => {
    const gameId = await memoryClient.readContract({
      address: contractAddress,
      abi: RuggedGame.abi,
      functionName: 'nextGame',
    })

    const status = await memoryClient.readContract({
      address: contractAddress,
      abi: RuggedGame.abi,
      functionName: 'status',
      args: [gameId],
    })

    expect(status).toBe('REGISTRATION_OPEN')
  })
})