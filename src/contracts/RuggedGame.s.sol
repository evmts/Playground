// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRandomSource {
    function randomBytes() external view returns (bytes32);
}

contract RuggedGame {
    struct Game {
        uint256 startBlock;
        uint256 endBlock;
        uint256 prizePool;
        mapping(address => bool) registered;
        mapping(address => bytes32) commitments;
        mapping(address => uint256[5]) revealedLineups;
        bytes32 disasterRandomness;
        bool disasterTriggered;
        address claimant;
    }

    mapping(uint256 => Game) public games;
    uint256 public currentGameId;
    uint256 public constant REGISTRATION_FEE = 0.02 ether;
    uint256 public constant BLOCKS_PER_PHASE = 100; // Adjust as needed
    IRandomSource public randomSource;

    event Registered(address indexed player, uint256 indexed gameId);
    event LineupCommitted(address indexed player, uint256 indexed gameId);
    event LineupRevealed(address indexed player, uint256 indexed gameId);
    event DisasterTriggered(uint256 indexed gameId, bytes32 randomness);
    event WinningsClaimed(address indexed winner, uint256 indexed gameId, uint256 amount);

    constructor(address _randomSource) {
        randomSource = IRandomSource(_randomSource);
        currentGameId = 1;
        games[currentGameId].startBlock = block.number;
        games[currentGameId].endBlock = block.number + BLOCKS_PER_PHASE * 5; // 5 phases
    }

    function register(uint256 gameId) external payable {
        require(msg.value == REGISTRATION_FEE, "Incorrect registration fee");
        require(keccak256(abi.encodePacked(status(gameId))) == keccak256("REGISTRATION_OPEN"), "Registration is not open");
        require(!games[gameId].registered[msg.sender], "Already registered");

        games[gameId].registered[msg.sender] = true;
        games[gameId].prizePool += msg.value;

        emit Registered(msg.sender, gameId);
    }

    function nextGame() external view returns (uint256) {
        return currentGameId;
    }

    function status(uint256 gameId) public view returns (string memory) {
        Game storage game = games[gameId];
        uint256 phase = (block.number - game.startBlock) / BLOCKS_PER_PHASE;

        if (phase == 0) return "REGISTRATION_OPEN";
        if (phase == 1) return "COMMIT_LINEUP";
        if (phase == 2) return "REVEAL_LINEUP";
        if (phase == 3) return "TRIGGER_DISASTER";
        if (phase == 4) return "CLAIM_WINNINGS";
        return "GAME_OVER";
    }

    function commitLineup(uint256 gameId, bytes32 commitment) external {
        require(keccak256(abi.encodePacked(status(gameId))) == keccak256("COMMIT_LINEUP"), "Not in commit phase");
        require(games[gameId].registered[msg.sender], "Not registered");

        games[gameId].commitments[msg.sender] = commitment;
        emit LineupCommitted(msg.sender, gameId);
    }

    function revealLineup(uint256 gameId, uint256[5] memory lineup, bytes32 salt) external {
        require(keccak256(abi.encodePacked(status(gameId))) == keccak256("REVEAL_LINEUP"), "Not in reveal phase");
        require(games[gameId].registered[msg.sender], "Not registered");
        require(keccak256(abi.encodePacked(lineup, salt)) == games[gameId].commitments[msg.sender], "Invalid reveal");

        games[gameId].revealedLineups[msg.sender] = lineup;
        emit LineupRevealed(msg.sender, gameId);
    }

    function triggerDisaster(uint256 gameId) external {
        require(keccak256(abi.encodePacked(status(gameId))) == keccak256("TRIGGER_DISASTER"), "Not in trigger disaster phase");
        require(!games[gameId].disasterTriggered, "Disaster already triggered");

        bytes32 randomness = randomSource.randomBytes();
        games[gameId].disasterRandomness = randomness;
        games[gameId].disasterTriggered = true;

        emit DisasterTriggered(gameId, randomness);
    }

    function isRugged(uint256 gameId, address player) public view returns (bool) {
        Game storage game = games[gameId];
        require(game.disasterTriggered, "Disaster not yet triggered");

        // Check for invalid lineup (simplified, add more checks as needed)
        if (game.revealedLineups[player][0] == 0) return true;

        // Simplified disaster check (implement your logic here)
        uint256 protectionScore = calculateProtectionScore(game.revealedLineups[player]);
        uint256 disasterSeverity = uint256(game.disasterRandomness) % 100;

        return disasterSeverity > protectionScore;
    }

    function claimWinnings(uint256 gameId) external {
        require(keccak256(abi.encodePacked(status(gameId))) == keccak256("CLAIM_WINNINGS"), "Not in claim winnings phase");
        require(games[gameId].registered[msg.sender], "Not registered");
        require(!isRugged(gameId, msg.sender), "Player is rugged");

        games[gameId].claimant = msg.sender;

        // If this is the last player, transfer winnings
        if (isLastPlayer(gameId)) {
            uint256 winnings = games[gameId].prizePool;
            games[gameId].prizePool = 0;
            payable(msg.sender).transfer(winnings);
            emit WinningsClaimed(msg.sender, gameId, winnings);
            
            // Start next game
            currentGameId++;
            games[currentGameId].startBlock = block.number;
            games[currentGameId].endBlock = block.number + BLOCKS_PER_PHASE * 5;
        }
    }

    // Helper functions (implement these based on your game logic)
    function calculateProtectionScore(uint256[5] memory lineup) internal pure returns (uint256) {
        // Implement your protection score calculation logic
        return 50; // Placeholder
    }

    function isLastPlayer(uint256 gameId) internal view returns (bool) {
        // Implement logic to check if this is the last non-rugged player
        return true; // Placeholder
    }
}
