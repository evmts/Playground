import type { Contract } from 'tevm/contract'
const _nameIRandomSource = "IRandomSource" as const;
const _abiIRandomSource = [
  "function randomBytes() view returns (bytes32)"
] as const;
/**
 * IRandomSource Contract (with bytecode)
 * @see [contract docs](https://tevm.sh/learn/contracts/) for more documentation
 */
export const IRandomSource: Contract<
  typeof _nameIRandomSource,
  typeof _abiIRandomSource,
  undefined,
  `0x${string}`,
  `0x${string}`,
  undefined,
>;
const _nameRuggedGame = "RuggedGame" as const;
const _abiRuggedGame = [
  "constructor(address _randomSource)",
  "event DisasterTriggered(uint256 indexed gameId, bytes32 randomness)",
  "event LineupCommitted(address indexed player, uint256 indexed gameId)",
  "event LineupRevealed(address indexed player, uint256 indexed gameId)",
  "event Registered(address indexed player, uint256 indexed gameId)",
  "event WinningsClaimed(address indexed winner, uint256 indexed gameId, uint256 amount)",
  "function BLOCKS_PER_PHASE() view returns (uint256)",
  "function REGISTRATION_FEE() view returns (uint256)",
  "function claimWinnings(uint256 gameId)",
  "function commitLineup(uint256 gameId, bytes32 commitment)",
  "function currentGameId() view returns (uint256)",
  "function games(uint256) view returns (uint256 startBlock, uint256 endBlock, uint256 prizePool, bytes32 disasterRandomness, bool disasterTriggered, address claimant)",
  "function isRugged(uint256 gameId, address player) view returns (bool)",
  "function nextGame() view returns (uint256)",
  "function randomSource() view returns (address)",
  "function register(uint256 gameId) payable",
  "function revealLineup(uint256 gameId, uint256[5] lineup, bytes32 salt)",
  "function status(uint256 gameId) view returns (string)",
  "function triggerDisaster(uint256 gameId)"
] as const;
/**
 * RuggedGame Contract (with bytecode)
 * @see [contract docs](https://tevm.sh/learn/contracts/) for more documentation
 */
export const RuggedGame: Contract<
  typeof _nameRuggedGame,
  typeof _abiRuggedGame,
  undefined,
  `0x${string}`,
  `0x${string}`,
  undefined,
>;