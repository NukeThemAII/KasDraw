// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DecentralizedLottery - Next-Generation Decentralized Lottery Protocol
 * @dev Fully decentralized lottery with enhanced security, gas optimization, and analytics
 * @author KasDraw Team - Redesigned for Production
 * 
 * Key Features:
 * - Zero centralization points (no owner privileges)
 * - Enhanced randomness using fast block properties (10 BPS)
 * - Gas-optimized operations with batch processing
 * - Comprehensive analytics data for Web3 UI
 * - Automatic draw execution based on time/block conditions
 * - Robust economic model with precise mathematics
 * - Emergency circuit breakers without centralized control
 */
contract DecentralizedLottery is ReentrancyGuard, Pausable {
    using Math for uint256;

    // ============ CONSTANTS ============
    
    uint256 public constant TICKET_PRICE = 0.1 ether; // 0.1 KAS per ticket
    uint256 public constant NUMBERS_PER_TICKET = 5; // Pick 5 numbers
    uint256 public constant MAX_NUMBER = 35; // From 1 to 35
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant MAX_TICKETS_PER_BATCH = 50; // Gas optimization
    
    // Timing Configuration (optimized for 10 BPS)
    uint256 public constant DRAW_INTERVAL = 1 hours; // For testing - can be changed to 3.5 days
    uint256 public constant BLOCKS_PER_DRAW = 360; // ~1 hour at 10 BPS (testing)
    uint256 public constant MIN_BLOCKS_BETWEEN_DRAWS = 36; // ~6 minutes minimum
    
    // Economic Configuration (basis points - total 10000)
    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 50; // 0.5% (reduced from 1%)
    uint256 public constant EXECUTOR_REWARD_PERCENTAGE = 25; // 0.25% (increased incentive)
    uint256 public constant MIN_EXECUTOR_REWARD = 0.05 ether; // 0.05 KAS
    uint256 public constant MAX_EXECUTOR_REWARD = 5 ether; // 5 KAS
    
    // Prize Distribution (basis points - total 9925, leaving 75 for fees)
    uint256 public constant JACKPOT_PERCENTAGE = 5000; // 50% for 5 matches
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 2500; // 25% for 4 matches
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 1500; // 15% for 3 matches
    uint256 public constant FOURTH_PRIZE_PERCENTAGE = 925; // 9.25% for 2 matches
    
    // Circuit Breaker Constants
    uint256 public constant MAX_JACKPOT_MULTIPLIER = 1000; // Max 1000x ticket price
    uint256 public constant EMERGENCY_PAUSE_THRESHOLD = 100 ether; // Auto-pause if jackpot exceeds
    
    // ============ STRUCTS ============
    
    struct Ticket {
        address player;
        uint256[NUMBERS_PER_TICKET] numbers;
        uint256 drawId;
        bool claimed;
        uint256 purchaseTime;
        uint256 purchaseBlock;
        uint256 batchId; // For gas optimization
    }
    
    struct Draw {
        uint256 id;
        uint256[NUMBERS_PER_TICKET] winningNumbers;
        uint256 timestamp;
        uint256 blockNumber;
        uint256 totalPrizePool;
        uint256 jackpotAmount;
        uint256 executorReward;
        address executor;
        bool executed;
        uint256 totalTickets;
        uint256 randomSeed; // For analytics
        // Winner counts
        uint256 winners5Count;
        uint256 winners4Count;
        uint256 winners3Count;
        uint256 winners2Count;
        // Prize amounts per winner
        uint256 prize5Amount;
        uint256 prize4Amount;
        uint256 prize3Amount;
        uint256 prize2Amount;
    }
    
    struct PlayerStats {
        uint256 totalTickets;
        uint256 totalWinnings;
        uint256 totalSpent;
        uint256 biggestWin;
        uint256 lastPlayTime;
        uint256 winCount;
    }
    
    struct LotteryAnalytics {
        uint256 totalDraws;
        uint256 totalTicketsSold;
        uint256 totalPrizesDistributed;
        uint256 totalProtocolFees;
        uint256 averageJackpot;
        uint256 largestJackpot;
        uint256 totalPlayers;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public currentDrawId;
    uint256 public accumulatedJackpot;
    uint256 public protocolFeeBalance;
    
    // Timing variables
    uint256 public lastDrawTime;
    uint256 public nextDrawTime;
    uint256 public lastDrawBlock;
    uint256 public nextDrawBlock;
    
    // Analytics
    LotteryAnalytics public analytics;
    
    // Mappings
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => uint256[]) public drawTickets; // drawId => ticketIds
    mapping(address => uint256[]) public playerTickets; // player => ticketIds
    mapping(address => bool) public hasPlayed; // For unique player count
    
    // Batch processing
    mapping(uint256 => uint256[]) public batchTickets; // batchId => ticketIds
    uint256 public currentBatchId;
    
    // Private variables
    uint256 private ticketCounter;
    uint256 private randomNonce;
    uint256 private blockHashNonce;
    
    // Emergency circuit breaker
    bool public emergencyPaused;
    uint256 public emergencyPauseTime;
    
    // Testing features (to be removed in production)
    bool public testingMode;
    uint256 public testDrawInterval; // Override for testing
    
    // ============ EVENTS ============
    
    event TicketsPurchased(
        address indexed player,
        uint256 indexed drawId,
        uint256[] ticketIds,
        uint256 totalCost,
        uint256 batchId
    );
    
    event DrawExecuted(
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] winningNumbers,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        address indexed executor,
        uint256 executorReward,
        uint256 totalTickets,
        uint256 randomSeed
    );
    
    event PrizesClaimed(
        address indexed player,
        uint256[] ticketIds,
        uint256 totalAmount,
        uint256 winCount
    );
    
    event JackpotRollover(
        uint256 indexed fromDrawId,
        uint256 indexed toDrawId,
        uint256 amount
    );
    
    event EmergencyCircuitBreaker(
        uint256 jackpotAmount,
        uint256 threshold,
        uint256 timestamp
    );
    
    event AnalyticsUpdated(
        uint256 totalDraws,
        uint256 totalTickets,
        uint256 totalPrizes,
        uint256 averageJackpot
    );
    
    // Testing events
    event TestingModeChanged(bool enabled, uint256 newInterval);
    
    // ============ MODIFIERS ============
    
    modifier validDrawId(uint256 drawId) {
        require(drawId > 0 && drawId <= currentDrawId, "Invalid draw ID");
        _;
    }
    
    modifier validTicketId(uint256 ticketId) {
        require(ticketId > 0 && ticketId < ticketCounter, "Invalid ticket ID");
        _;
    }
    
    modifier notEmergencyPaused() {
        require(!emergencyPaused, "Emergency paused");
        _;
    }
    
    modifier onlyInTestingMode() {
        require(testingMode, "Only available in testing mode");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(bool _testingMode) {
        currentDrawId = 1;
        ticketCounter = 1;
        currentBatchId = 1;
        randomNonce = 1;
        blockHashNonce = 1;
        
        lastDrawTime = block.timestamp;
        lastDrawBlock = block.number;
        
        testingMode = _testingMode;
        if (_testingMode) {
            testDrawInterval = 10 minutes; // 10 minutes for testing
            nextDrawTime = block.timestamp + testDrawInterval;
            nextDrawBlock = block.number + (testDrawInterval * 10 / 60); // Approximate blocks
        } else {
            nextDrawTime = block.timestamp + DRAW_INTERVAL;
            nextDrawBlock = block.number + BLOCKS_PER_DRAW;
        }
        
        analytics.totalDraws = 0;
        analytics.totalTicketsSold = 0;
        analytics.totalPrizesDistributed = 0;
        analytics.totalProtocolFees = 0;
        analytics.averageJackpot = 0;
        analytics.largestJackpot = 0;
        analytics.totalPlayers = 0;
    }
    
    // ============ TICKET PURCHASE ============
    
    function purchaseTickets(
        uint256[NUMBERS_PER_TICKET][] calldata ticketNumbers
    ) external payable nonReentrant whenNotPaused notEmergencyPaused {
        require(ticketNumbers.length > 0, "Must purchase at least one ticket");
        require(ticketNumbers.length <= MAX_TICKETS_PER_BATCH, "Too many tickets in batch");
        
        uint256 totalCost = TICKET_PRICE * ticketNumbers.length;
        require(msg.value == totalCost, "Incorrect payment amount");
        
        // Validate all tickets first (fail fast)
        for (uint256 i = 0; i < ticketNumbers.length; i++) {
            _validateTicketNumbers(ticketNumbers[i]);
        }
        
        // Create tickets in batch
        uint256[] memory newTicketIds = new uint256[](ticketNumbers.length);
        uint256 batchId = currentBatchId++;
        
        for (uint256 i = 0; i < ticketNumbers.length; i++) {
            uint256 ticketId = ticketCounter++;
            newTicketIds[i] = ticketId;
            
            Ticket storage ticket = tickets[ticketId];
            ticket.player = msg.sender;
            ticket.drawId = currentDrawId;
            ticket.purchaseTime = block.timestamp;
            ticket.purchaseBlock = block.number;
            ticket.batchId = batchId;
            
            // Copy numbers efficiently
            for (uint256 j = 0; j < NUMBERS_PER_TICKET; j++) {
                ticket.numbers[j] = ticketNumbers[i][j];
            }
            
            // Update mappings
            drawTickets[currentDrawId].push(ticketId);
            playerTickets[msg.sender].push(ticketId);
            batchTickets[batchId].push(ticketId);
        }
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalTickets += ticketNumbers.length;
        stats.lastPlayTime = block.timestamp;
        stats.totalSpent += totalCost;
        
        // Track unique players
        if (!hasPlayed[msg.sender]) {
            hasPlayed[msg.sender] = true;
            analytics.totalPlayers++;
        }
        
        // Update analytics
        analytics.totalTicketsSold += ticketNumbers.length;
        
        // Calculate fees and prize pool
        uint256 protocolFee = (totalCost * PROTOCOL_FEE_PERCENTAGE) / 10000;
        uint256 prizePoolAddition = totalCost - protocolFee;
        
        protocolFeeBalance += protocolFee;
        accumulatedJackpot += prizePoolAddition;
        
        // Emergency circuit breaker
        if (accumulatedJackpot > EMERGENCY_PAUSE_THRESHOLD && !emergencyPaused) {
            emergencyPaused = true;
            emergencyPauseTime = block.timestamp;
            emit EmergencyCircuitBreaker(accumulatedJackpot, EMERGENCY_PAUSE_THRESHOLD, block.timestamp);
        }
        
        emit TicketsPurchased(msg.sender, currentDrawId, newTicketIds, totalCost, batchId);
    }
    
    // ============ DRAW EXECUTION ============
    
    function executeDraw() external nonReentrant whenNotPaused {
        require(canExecuteDraw(), "Cannot execute draw yet");
        require(drawTickets[currentDrawId].length > 0, "No tickets sold");
        require(!draws[currentDrawId].executed, "Draw already executed");
        
        _executeDraw(msg.sender);
    }
    
    function _executeDraw(address executor) internal {
        uint256[NUMBERS_PER_TICKET] memory winningNumbers;
        uint256 randomSeed;
        
        (winningNumbers, randomSeed) = _generateEnhancedRandomNumbers();
        
        Draw storage draw = draws[currentDrawId];
        draw.id = currentDrawId;
        draw.timestamp = block.timestamp;
        draw.blockNumber = block.number;
        draw.totalPrizePool = accumulatedJackpot;
        draw.executed = true;
        draw.executor = executor;
        draw.totalTickets = drawTickets[currentDrawId].length;
        draw.randomSeed = randomSeed;
        
        // Copy winning numbers
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            draw.winningNumbers[i] = winningNumbers[i];
        }
        
        // Calculate executor reward
        uint256 executorReward = _calculateExecutorReward(accumulatedJackpot);
        draw.executorReward = executorReward;
        
        // Process winners and calculate prizes
        _processWinners(currentDrawId, winningNumbers);
        
        // Calculate distributed prizes
        uint256 totalPrizePool = draw.totalPrizePool - executorReward;
        uint256 distributedPrizes = _calculateDistributedPrizes(currentDrawId, totalPrizePool);
        
        // Handle rollover
        uint256 rolloverAmount = totalPrizePool - distributedPrizes;
        
        // Pay executor reward
        if (executorReward > 0) {
            (bool success, ) = payable(executor).call{value: executorReward}("");
            require(success, "Executor reward transfer failed");
        }
        
        // Update analytics
        analytics.totalDraws++;
        analytics.totalPrizesDistributed += distributedPrizes;
        analytics.averageJackpot = (analytics.averageJackpot * (analytics.totalDraws - 1) + draw.jackpotAmount) / analytics.totalDraws;
        if (draw.jackpotAmount > analytics.largestJackpot) {
            analytics.largestJackpot = draw.jackpotAmount;
        }
        
        emit DrawExecuted(
            currentDrawId,
            winningNumbers,
            totalPrizePool,
            draw.jackpotAmount,
            executor,
            executorReward,
            draw.totalTickets,
            randomSeed
        );
        
        if (rolloverAmount > 0) {
            emit JackpotRollover(currentDrawId, currentDrawId + 1, rolloverAmount);
        }
        
        // Reset for next draw
        accumulatedJackpot = rolloverAmount;
        _updateDrawTiming();
        currentDrawId++;
        
        // Reset emergency pause if conditions are met
        if (emergencyPaused && accumulatedJackpot < EMERGENCY_PAUSE_THRESHOLD / 2) {
            emergencyPaused = false;
            emergencyPauseTime = 0;
        }
        
        emit AnalyticsUpdated(
            analytics.totalDraws,
            analytics.totalTicketsSold,
            analytics.totalPrizesDistributed,
            analytics.averageJackpot
        );
    }
    
    // ============ PRIZE CLAIMING ============
    
    function claimPrizes(uint256[] calldata ticketIds) external nonReentrant {
        require(ticketIds.length > 0, "No tickets to claim");
        require(ticketIds.length <= 20, "Too many tickets in one claim"); // Gas optimization
        
        uint256 totalPrize = 0;
        uint256 winCount = 0;
        
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            require(ticketId > 0 && ticketId < ticketCounter, "Invalid ticket ID");
            
            Ticket storage ticket = tickets[ticketId];
            require(ticket.player == msg.sender, "Not ticket owner");
            require(!ticket.claimed, "Prize already claimed");
            require(draws[ticket.drawId].executed, "Draw not executed");
            
            Draw storage draw = draws[ticket.drawId];
            uint256 matches = _countMatches(ticket.numbers, draw.winningNumbers);
            
            if (matches >= 2) {
                uint256 prizeAmount = _getPrizeAmount(draw, matches);
                if (prizeAmount > 0) {
                    ticket.claimed = true;
                    totalPrize += prizeAmount;
                    winCount++;
                }
            }
        }
        
        require(totalPrize > 0, "No prizes to claim");
        require(address(this).balance >= totalPrize, "Insufficient contract balance");
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalWinnings += totalPrize;
        stats.winCount += winCount;
        if (totalPrize > stats.biggestWin) {
            stats.biggestWin = totalPrize;
        }
        
        // Transfer prizes
        (bool success, ) = payable(msg.sender).call{value: totalPrize}("");
        require(success, "Prize transfer failed");
        
        emit PrizesClaimed(msg.sender, ticketIds, totalPrize, winCount);
    }
    
    // ============ ENHANCED RANDOMNESS ============
    
    function _generateEnhancedRandomNumbers() internal returns (
        uint256[NUMBERS_PER_TICKET] memory selectedNumbers,
        uint256 randomSeed
    ) {
        // Increment nonces
        randomNonce++;
        blockHashNonce++;
        
        // Collect multiple block hashes for enhanced entropy
        bytes32[] memory recentBlockHashes = new bytes32[](5);
        for (uint256 i = 0; i < 5; i++) {
            uint256 blockNum = block.number - (i + 1);
            if (blockNum < block.number) {
                recentBlockHashes[i] = blockhash(blockNum);
            }
        }
        
        // Enhanced entropy collection
        randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            block.coinbase,
            block.gaslimit,
            tx.gasprice,
            msg.sender,
            currentDrawId,
            analytics.totalTicketsSold,
            address(this).balance,
            gasleft(),
            randomNonce,
            blockHashNonce,
            recentBlockHashes[0],
            recentBlockHashes[1],
            recentBlockHashes[2],
            recentBlockHashes[3],
            recentBlockHashes[4],
            keccak256(abi.encodePacked(drawTickets[currentDrawId].length))
        )));
        
        // Fisher-Yates shuffle algorithm for unbiased selection
        uint256[] memory availableNumbers = new uint256[](MAX_NUMBER);
        for (uint256 i = 0; i < MAX_NUMBER; i++) {
            availableNumbers[i] = i + MIN_NUMBER;
        }
        
        uint256 remainingCount = MAX_NUMBER;
        
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            // Additional entropy for each number
            uint256 additionalEntropy = uint256(keccak256(abi.encodePacked(
                randomSeed,
                i,
                block.timestamp + i,
                remainingCount,
                randomNonce + i,
                gasleft()
            )));
            
            uint256 randomIndex = additionalEntropy % remainingCount;
            selectedNumbers[i] = availableNumbers[randomIndex];
            
            // Swap with last element and reduce array size
            availableNumbers[randomIndex] = availableNumbers[remainingCount - 1];
            remainingCount--;
        }
        
        // Sort numbers for consistency
        _sortNumbers(selectedNumbers);
        
        return (selectedNumbers, randomSeed);
    }
    
    // ============ INTERNAL HELPER FUNCTIONS ============
    
    function _validateTicketNumbers(uint256[NUMBERS_PER_TICKET] memory numbers) internal pure {
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            require(
                numbers[i] >= MIN_NUMBER && numbers[i] <= MAX_NUMBER,
                "Number out of range"
            );
            
            // Check for duplicates
            for (uint256 j = i + 1; j < NUMBERS_PER_TICKET; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers not allowed");
            }
        }
    }
    
    function _processWinners(
        uint256 drawId,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers
    ) internal {
        Draw storage draw = draws[drawId];
        uint256[] memory ticketIds = drawTickets[drawId];
        
        // Count winners for each tier
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 matches = _countMatches(tickets[ticketIds[i]].numbers, winningNumbers);
            if (matches == 5) {
                draw.winners5Count++;
            } else if (matches == 4) {
                draw.winners4Count++;
            } else if (matches == 3) {
                draw.winners3Count++;
            } else if (matches == 2) {
                draw.winners2Count++;
            }
        }
        
        // Calculate prize amounts
        uint256 totalPrizePool = draw.totalPrizePool - draw.executorReward;
        
        if (draw.winners5Count > 0) {
            uint256 jackpotTotal = (totalPrizePool * JACKPOT_PERCENTAGE) / 10000;
            draw.prize5Amount = jackpotTotal / draw.winners5Count;
            draw.jackpotAmount = jackpotTotal;
        }
        
        if (draw.winners4Count > 0) {
            uint256 secondPrizeTotal = (totalPrizePool * SECOND_PRIZE_PERCENTAGE) / 10000;
            draw.prize4Amount = secondPrizeTotal / draw.winners4Count;
        }
        
        if (draw.winners3Count > 0) {
            uint256 thirdPrizeTotal = (totalPrizePool * THIRD_PRIZE_PERCENTAGE) / 10000;
            draw.prize3Amount = thirdPrizeTotal / draw.winners3Count;
        }
        
        if (draw.winners2Count > 0) {
            uint256 fourthPrizeTotal = (totalPrizePool * FOURTH_PRIZE_PERCENTAGE) / 10000;
            draw.prize2Amount = fourthPrizeTotal / draw.winners2Count;
        }
    }
    
    function _calculateDistributedPrizes(uint256 drawId, uint256 totalPrizePool) internal view returns (uint256) {
        Draw storage draw = draws[drawId];
        uint256 distributed = 0;
        
        if (draw.winners5Count > 0) {
            distributed += (totalPrizePool * JACKPOT_PERCENTAGE) / 10000;
        }
        if (draw.winners4Count > 0) {
            distributed += (totalPrizePool * SECOND_PRIZE_PERCENTAGE) / 10000;
        }
        if (draw.winners3Count > 0) {
            distributed += (totalPrizePool * THIRD_PRIZE_PERCENTAGE) / 10000;
        }
        if (draw.winners2Count > 0) {
            distributed += (totalPrizePool * FOURTH_PRIZE_PERCENTAGE) / 10000;
        }
        
        return distributed;
    }
    
    function _calculateExecutorReward(uint256 jackpotAmount) internal pure returns (uint256) {
        uint256 reward = (jackpotAmount * EXECUTOR_REWARD_PERCENTAGE) / 10000;
        return Math.min(Math.max(reward, MIN_EXECUTOR_REWARD), MAX_EXECUTOR_REWARD);
    }
    
    function _getPrizeAmount(Draw storage draw, uint256 matches) internal view returns (uint256) {
        if (matches == 5) return draw.prize5Amount;
        if (matches == 4) return draw.prize4Amount;
        if (matches == 3) return draw.prize3Amount;
        if (matches == 2) return draw.prize2Amount;
        return 0;
    }
    
    function _updateDrawTiming() internal {
        lastDrawTime = block.timestamp;
        lastDrawBlock = block.number;
        
        if (testingMode && testDrawInterval > 0) {
            nextDrawTime = block.timestamp + testDrawInterval;
            nextDrawBlock = block.number + (testDrawInterval * 10 / 60); // Approximate
        } else {
            nextDrawTime = block.timestamp + DRAW_INTERVAL;
            nextDrawBlock = block.number + BLOCKS_PER_DRAW;
        }
    }
    
    function _countMatches(
        uint256[NUMBERS_PER_TICKET] memory ticketNumbers,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers
    ) internal pure returns (uint256) {
        uint256 matches = 0;
        
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            for (uint256 j = 0; j < NUMBERS_PER_TICKET; j++) {
                if (ticketNumbers[i] == winningNumbers[j]) {
                    matches++;
                    break;
                }
            }
        }
        
        return matches;
    }
    
    function _sortNumbers(uint256[NUMBERS_PER_TICKET] memory numbers) internal pure {
        // Optimized bubble sort for small arrays
        for (uint256 i = 0; i < NUMBERS_PER_TICKET - 1; i++) {
            for (uint256 j = 0; j < NUMBERS_PER_TICKET - i - 1; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    (numbers[j], numbers[j + 1]) = (numbers[j + 1], numbers[j]);
                }
            }
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function canExecuteDraw() public view returns (bool) {
        if (draws[currentDrawId].executed || drawTickets[currentDrawId].length == 0) {
            return false;
        }
        
        bool timeReached = block.timestamp >= nextDrawTime;
        bool blockReached = block.number >= nextDrawBlock;
        
        return timeReached && blockReached && !emergencyPaused;
    }
    
    function getDrawInfo() external view returns (
        uint256 currentDraw,
        uint256 nextDrawTimestamp,
        uint256 nextDrawBlockNumber,
        uint256 currentJackpot,
        uint256 ticketsSold,
        bool canExecute,
        uint256 executorReward
    ) {
        return (
            currentDrawId,
            nextDrawTime,
            nextDrawBlock,
            accumulatedJackpot,
            drawTickets[currentDrawId].length,
            canExecuteDraw(),
            _calculateExecutorReward(accumulatedJackpot)
        );
    }
    
    function getTimeUntilDraw() external view returns (
        uint256 timeRemaining,
        uint256 blocksRemaining
    ) {
        timeRemaining = block.timestamp >= nextDrawTime ? 0 : nextDrawTime - block.timestamp;
        blocksRemaining = block.number >= nextDrawBlock ? 0 : nextDrawBlock - block.number;
    }
    
    function getDraw(uint256 drawId) external view validDrawId(drawId) returns (
        uint256 id,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers,
        uint256 timestamp,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        uint256 totalTickets,
        bool executed,
        address executor,
        uint256 randomSeed
    ) {
        Draw storage draw = draws[drawId];
        return (
            draw.id,
            draw.winningNumbers,
            draw.timestamp,
            draw.totalPrizePool,
            draw.jackpotAmount,
            draw.totalTickets,
            draw.executed,
            draw.executor,
            draw.randomSeed
        );
    }
    
    function getDrawWinners(uint256 drawId) external view validDrawId(drawId) returns (
        uint256 winners5,
        uint256 winners4,
        uint256 winners3,
        uint256 winners2,
        uint256 prize5,
        uint256 prize4,
        uint256 prize3,
        uint256 prize2
    ) {
        Draw storage draw = draws[drawId];
        return (
            draw.winners5Count,
            draw.winners4Count,
            draw.winners3Count,
            draw.winners2Count,
            draw.prize5Amount,
            draw.prize4Amount,
            draw.prize3Amount,
            draw.prize2Amount
        );
    }
    
    function getTicket(uint256 ticketId) external view validTicketId(ticketId) returns (
        address player,
        uint256[NUMBERS_PER_TICKET] memory numbers,
        uint256 drawId,
        bool claimed,
        uint256 purchaseTime,
        uint256 batchId
    ) {
        Ticket storage ticket = tickets[ticketId];
        return (
            ticket.player,
            ticket.numbers,
            ticket.drawId,
            ticket.claimed,
            ticket.purchaseTime,
            ticket.batchId
        );
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 totalTickets,
        uint256 totalWinnings,
        uint256 totalSpent,
        uint256 biggestWin,
        uint256 lastPlayTime,
        uint256 winCount,
        uint256[] memory ticketIds
    ) {
        PlayerStats storage stats = playerStats[player];
        return (
            stats.totalTickets,
            stats.totalWinnings,
            stats.totalSpent,
            stats.biggestWin,
            stats.lastPlayTime,
            stats.winCount,
            playerTickets[player]
        );
    }
    
    function getAnalytics() external view returns (LotteryAnalytics memory) {
        return analytics;
    }
    
    function getPlayerTicketsByDraw(address player, uint256 drawId) external view returns (uint256[] memory) {
        uint256[] memory allTickets = playerTickets[player];
        uint256 count = 0;
        
        // Count tickets for this draw
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (tickets[allTickets[i]].drawId == drawId) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory drawTicketIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (tickets[allTickets[i]].drawId == drawId) {
                drawTicketIds[index] = allTickets[i];
                index++;
            }
        }
        
        return drawTicketIds;
    }
    
    // ============ TESTING FUNCTIONS (TO BE REMOVED IN PRODUCTION) ============
    
    function setTestingMode(bool _enabled, uint256 _testInterval) external onlyInTestingMode {
        testingMode = _enabled;
        if (_enabled && _testInterval > 0) {
            testDrawInterval = _testInterval;
            nextDrawTime = block.timestamp + _testInterval;
            nextDrawBlock = block.number + (_testInterval * 10 / 60);
        }
        emit TestingModeChanged(_enabled, _testInterval);
    }
    
    function forceExecuteDrawForTesting() external onlyInTestingMode {
        require(drawTickets[currentDrawId].length > 0, "No tickets sold");
        require(!draws[currentDrawId].executed, "Draw already executed");
        _executeDraw(msg.sender);
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    function emergencyPause() external {
        require(
            accumulatedJackpot > EMERGENCY_PAUSE_THRESHOLD ||
            block.timestamp > emergencyPauseTime + 7 days,
            "Emergency conditions not met"
        );
        _pause();
    }
    
    function emergencyUnpause() external {
        require(paused(), "Not paused");
        require(
            accumulatedJackpot < EMERGENCY_PAUSE_THRESHOLD / 2,
            "Jackpot still too high"
        );
        _unpause();
    }
    
    // ============ FALLBACK FUNCTIONS ============
    
    receive() external payable {
        // Accept donations to jackpot
        accumulatedJackpot += msg.value;
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}