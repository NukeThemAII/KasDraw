// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title KasDrawLotteryV2Fixed - Production-Ready Lottery with Critical Fixes
 * @dev Fixed version addressing critical audit findings
 * @author KasDraw Team
 */
contract KasDrawLotteryV2Fixed is Ownable, ReentrancyGuard, Pausable {

    // ============ CONSTANTS ============
    
    uint256 public constant TICKET_PRICE = 10 ether; // 10 KAS per ticket
    uint256 public constant NUMBERS_PER_TICKET = 5; // Pick 5 numbers
    uint256 public constant MAX_NUMBER = 35; // From 1 to 35
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant MAX_TICKETS_PER_PURCHASE = 100; // Prevent gas limit issues
    
    // Timing Configuration
    uint256 public constant DRAW_INTERVAL = 3.5 days; // Twice per week
    uint256 public constant BLOCKS_PER_DRAW = 302400; // ~3.5 days at 10 BPS (Kasplex L2)
    uint256 public constant MIN_BLOCKS_BETWEEN_DRAWS = 8640; // ~1 day minimum
    
    // Economic Configuration (in basis points - total 10000)
    uint256 public constant ADMIN_FEE_PERCENTAGE = 100; // 1% (100 basis points)
    uint256 public constant EXECUTOR_REWARD_PERCENTAGE = 10; // 0.1% (10 basis points)
    uint256 public constant MIN_EXECUTOR_REWARD = 0.1 ether; // 0.1 KAS
    uint256 public constant MAX_EXECUTOR_REWARD = 10 ether; // 10 KAS
    
    // Prize Distribution (basis points - total 10000)
    uint256 public constant JACKPOT_PERCENTAGE = 5000; // 50% for 5 matches
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 2500; // 25% for 4 matches
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 1500; // 15% for 3 matches
    uint256 public constant FOURTH_PRIZE_PERCENTAGE = 1000; // 10% for 2 matches
    
    // ============ STRUCTS ============
    
    struct Ticket {
        address player;
        uint256[NUMBERS_PER_TICKET] numbers;
        uint256 drawId;
        bool claimed;
        uint256 purchaseTime;
        uint256 purchaseBlock;
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
        // Separate mappings for winners data
        uint256 winners5Count;
        uint256 winners4Count;
        uint256 winners3Count;
        uint256 winners2Count;
        uint256 prize5Amount;
        uint256 prize4Amount;
        uint256 prize3Amount;
        uint256 prize2Amount;
    }
    
    struct PlayerStats {
        uint256 totalTickets;
        uint256 totalWinnings;
        uint256[] ticketIds;
        uint256 lastPlayTime;
        uint256 totalSpent;
        uint256 biggestWin;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public currentDrawId;
    uint256 public totalTicketsSold;
    uint256 public accumulatedJackpot;
    uint256 public adminBalance;
    uint256 public totalPrizesDistributed;
    
    // Timing variables
    uint256 public lastDrawTime;
    uint256 public nextDrawTime;
    uint256 public lastDrawBlock;
    uint256 public nextDrawBlock;
    
    // Mappings
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => uint256[]) public drawTickets; // drawId => ticketIds
    mapping(address => uint256) public playerDeposits; // For emergency refunds
    
    uint256 private ticketCounter;
    uint256 private randomNonce;
    
    // ============ EVENTS ============
    
    event TicketPurchased(
        address indexed player,
        uint256 indexed ticketId,
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] numbers,
        uint256 timestamp,
        uint256 totalCost
    );
    
    event DrawExecuted(
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] winningNumbers,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        address indexed executor,
        uint256 executorReward,
        uint256 totalTickets
    );
    
    event PrizeClaimed(
        address indexed player,
        uint256 indexed ticketId,
        uint256 indexed drawId,
        uint256 matches,
        uint256 amount
    );
    
    event DrawExecutedByPublic(
        address indexed executor,
        uint256 indexed drawId,
        uint256 reward,
        uint256 gasUsed
    );
    
    event JackpotRollover(
        uint256 indexed fromDrawId,
        uint256 indexed toDrawId,
        uint256 amount
    );
    
    event AdminFeesWithdrawn(
        address indexed admin,
        uint256 amount,
        uint256 timestamp
    );
    
    event EmergencyRefund(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier validDrawId(uint256 drawId) {
        require(drawId > 0 && drawId <= currentDrawId, "Invalid draw ID");
        _;
    }
    
    modifier validTicketId(uint256 ticketId) {
        require(ticketId > 0 && ticketId < ticketCounter, "Invalid ticket ID");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        currentDrawId = 1;
        ticketCounter = 1;
        lastDrawTime = block.timestamp;
        nextDrawTime = block.timestamp + DRAW_INTERVAL;
        lastDrawBlock = block.number;
        nextDrawBlock = block.number + BLOCKS_PER_DRAW;
        randomNonce = 1;
    }
    
    // ============ TICKET PURCHASE ============
    
    function purchaseTickets(
        uint256[NUMBERS_PER_TICKET][] calldata ticketNumbers
    ) external payable nonReentrant whenNotPaused {
        require(ticketNumbers.length > 0, "Must purchase at least one ticket");
        require(ticketNumbers.length <= MAX_TICKETS_PER_PURCHASE, "Too many tickets in one transaction");
        
        uint256 totalCost = TICKET_PRICE * ticketNumbers.length;
        require(msg.value == totalCost, "Incorrect payment amount");
        
        // Batch validation for gas efficiency
        for (uint256 i = 0; i < ticketNumbers.length; i++) {
            _validateTicketNumbers(ticketNumbers[i]);
        }
        
        // Batch ticket creation
        for (uint256 i = 0; i < ticketNumbers.length; i++) {
            uint256 ticketId = ticketCounter;
            ticketCounter++; // Increment after assignment
            
            Ticket storage ticket = tickets[ticketId];
            ticket.player = msg.sender;
            ticket.drawId = currentDrawId;
            ticket.purchaseTime = block.timestamp;
            ticket.purchaseBlock = block.number;
            
            // Copy numbers efficiently
            for (uint256 j = 0; j < NUMBERS_PER_TICKET; j++) {
                ticket.numbers[j] = ticketNumbers[i][j];
            }
            
            // Update mappings
            drawTickets[currentDrawId].push(ticketId);
            playerStats[msg.sender].ticketIds.push(ticketId);
            
            emit TicketPurchased(
                msg.sender,
                ticketId,
                currentDrawId,
                ticketNumbers[i],
                block.timestamp,
                TICKET_PRICE
            );
        }
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalTickets += ticketNumbers.length;
        stats.lastPlayTime = block.timestamp;
        stats.totalSpent += totalCost;
        
        // Update global counters
        totalTicketsSold += ticketNumbers.length;
        playerDeposits[msg.sender] += totalCost;
        
        // Calculate fees and prize pool contribution - FIXED CALCULATION
        uint256 adminFee = (totalCost * ADMIN_FEE_PERCENTAGE) / 10000; // Correct percentage calculation
        uint256 prizePoolAddition = totalCost - adminFee;
        
        adminBalance += adminFee;
        accumulatedJackpot += prizePoolAddition;
    }
    
    // ============ DRAW EXECUTION ============
    
    function executeDraw() external onlyOwner {
        _executeDraw(msg.sender);
    }
    
    function executeDrawManual(
        uint256[NUMBERS_PER_TICKET] calldata winningNumbers
    ) external onlyOwner {
        _validateTicketNumbers(winningNumbers);
        _executeDrawWithNumbers(winningNumbers, msg.sender);
    }
    
    function executeDrawPublic() external nonReentrant whenNotPaused {
        require(!draws[currentDrawId].executed, "Draw already executed");
        require(drawTickets[currentDrawId].length > 0, "No tickets sold");
        
        // Enhanced dual validation
        require(
            block.timestamp >= nextDrawTime,
            "Draw time not reached"
        );
        require(
            block.number >= nextDrawBlock,
            "Draw block not reached"
        );
        
        uint256 gasStart = gasleft();
        _executeDraw(msg.sender);
        uint256 gasUsed = gasStart - gasleft();
        
        emit DrawExecutedByPublic(msg.sender, currentDrawId - 1, 0, gasUsed);
    }
    
    function _executeDraw(address executor) internal {
        uint256[NUMBERS_PER_TICKET] memory winningNumbers = _generateRandomNumbers();
        _executeDrawWithNumbers(winningNumbers, executor);
    }
    
    function _executeDrawWithNumbers(
        uint256[NUMBERS_PER_TICKET] memory winningNumbers,
        address executor
    ) internal {
        require(!draws[currentDrawId].executed, "Draw already executed");
        
        Draw storage draw = draws[currentDrawId];
        draw.id = currentDrawId;
        draw.timestamp = block.timestamp;
        draw.blockNumber = block.number;
        draw.totalPrizePool = accumulatedJackpot;
        draw.executed = true;
        draw.executor = executor;
        draw.totalTickets = drawTickets[currentDrawId].length;
        
        // Copy winning numbers
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            draw.winningNumbers[i] = winningNumbers[i];
        }
        
        // Calculate executor reward
        uint256 executorReward = _calculateExecutorReward(accumulatedJackpot);
        draw.executorReward = executorReward;
        
        // Process winners and calculate prizes - FIXED
        _processWinners(currentDrawId, winningNumbers);
        
        // Calculate final jackpot after prizes
        uint256 totalPrizePool = draw.totalPrizePool - executorReward;
        uint256 distributedPrizes = _calculateDistributedPrizes(currentDrawId, totalPrizePool);
        
        // Handle rollover
        uint256 rolloverAmount = totalPrizePool - distributedPrizes;
        if (rolloverAmount > 0) {
            emit JackpotRollover(currentDrawId, currentDrawId + 1, rolloverAmount);
        }
        
        // Pay executor reward
        if (executorReward > 0 && address(this).balance >= executorReward) {
            (bool success, ) = payable(executor).call{value: executorReward}("");
            require(success, "Executor reward transfer failed");
        }
        
        // Reset jackpot (rollover handled above)
        accumulatedJackpot = rolloverAmount;
        
        emit DrawExecuted(
            currentDrawId,
            winningNumbers,
            totalPrizePool,
            draw.jackpotAmount,
            executor,
            executorReward,
            draw.totalTickets
        );
        
        // Update timing for next draw
        _updateDrawTiming();
        
        // Increment draw ID
        currentDrawId++;
    }
    
    // ============ PRIZE CLAIMING - FIXED ============
    
    function claimPrize(uint256 ticketId) external nonReentrant validTicketId(ticketId) {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not ticket owner");
        require(!ticket.claimed, "Prize already claimed");
        require(draws[ticket.drawId].executed, "Draw not executed");
        
        Draw storage draw = draws[ticket.drawId];
        uint256 matches = _countMatches(ticket.numbers, draw.winningNumbers);
        
        require(matches >= 2, "No prize to claim");
        
        // Get prize amount based on matches - FIXED ACCESS
        uint256 prizeAmount = 0;
        if (matches == 5) {
            prizeAmount = draw.prize5Amount;
        } else if (matches == 4) {
            prizeAmount = draw.prize4Amount;
        } else if (matches == 3) {
            prizeAmount = draw.prize3Amount;
        } else if (matches == 2) {
            prizeAmount = draw.prize2Amount;
        }
        
        require(prizeAmount > 0, "No prize amount set");
        require(address(this).balance >= prizeAmount, "Insufficient contract balance");
        
        // Update state before transfer
        ticket.claimed = true;
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalWinnings += prizeAmount;
        if (prizeAmount > stats.biggestWin) {
            stats.biggestWin = prizeAmount;
        }
        totalPrizesDistributed += prizeAmount;
        
        // Transfer prize
        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit PrizeClaimed(msg.sender, ticketId, ticket.drawId, matches, prizeAmount);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function withdrawAdminFees() external onlyOwner {
        uint256 amount = adminBalance;
        require(amount > 0, "No admin fees to withdraw");
        
        adminBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Admin fee transfer failed");
        
        emit AdminFeesWithdrawn(owner(), amount, block.timestamp);
    }
    
    function emergencyRefundAll() external onlyOwner {
        require(address(this).balance > 0, "No funds to refund");
        
        // Simple refund implementation
        for (uint256 i = 1; i < ticketCounter; i++) {
            address player = tickets[i].player;
            uint256 refundAmount = playerDeposits[player];
            
            if (refundAmount > 0 && address(this).balance >= refundAmount) {
                playerDeposits[player] = 0;
                (bool success, ) = payable(player).call{value: refundAmount}("");
                if (success) {
                    emit EmergencyRefund(player, refundAmount, block.timestamp);
                }
            }
        }
        
        // Reset contract state
        accumulatedJackpot = 0;
        adminBalance = 0;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Contract must be paused");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    // ============ VIEW FUNCTIONS - FIXED ============
    
    function getLotteryStats() external view returns (
        uint256 currentJackpot,
        uint256 ticketsSoldThisDraw,
        uint256 totalTickets,
        uint256 nextDraw,
        uint256 executorReward,
        bool canExecute,
        uint256 totalPrizesDistributedAmount,
        uint256 currentDrawTickets
    ) {
        bool canExec = _canExecuteDrawPublic();
        uint256 reward = _calculateExecutorReward(accumulatedJackpot);
        
        return (
            accumulatedJackpot,
            drawTickets[currentDrawId].length,
            totalTicketsSold,
            nextDrawTime,
            reward,
            canExec,
            totalPrizesDistributed,
            drawTickets[currentDrawId].length
        );
    }
    
    function canExecuteDrawPublic() external view returns (
        bool canExecute,
        uint256 timeRemaining,
        uint256 nextDrawTimeStamp,
        uint256 blocksRemaining,
        uint256 nextDrawBlockNumber
    ) {
        bool canExec = _canExecuteDrawPublic();
        
        uint256 timeRem = block.timestamp >= nextDrawTime ? 0 : nextDrawTime - block.timestamp;
        uint256 blockRem = block.number >= nextDrawBlock ? 0 : nextDrawBlock - block.number;
        
        return (canExec, timeRem, nextDrawTime, blockRem, nextDrawBlock);
    }
    
    function getCurrentExecutorReward() external view returns (uint256) {
        return _calculateExecutorReward(accumulatedJackpot);
    }
    
    function getTicket(uint256 ticketId) external view validTicketId(ticketId) returns (
        address player,
        uint256[NUMBERS_PER_TICKET] memory numbers,
        uint256 drawId,
        bool claimed,
        uint256 purchaseTime,
        uint256 purchaseBlock
    ) {
        Ticket storage ticket = tickets[ticketId];
        return (
            ticket.player,
            ticket.numbers,
            ticket.drawId,
            ticket.claimed,
            ticket.purchaseTime,
            ticket.purchaseBlock
        );
    }
    
    // FIXED: Simplified draw data structure
    function getDraw(uint256 drawId) external view validDrawId(drawId) returns (
        uint256 id,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers,
        uint256 timestamp,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        uint256 totalTickets,
        bool executed,
        address executor
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
            draw.executor
        );
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 totalTickets,
        uint256 totalWinnings,
        uint256[] memory ticketIds,
        uint256 totalDeposits,
        uint256 lastPlayTime,
        uint256 totalSpent,
        uint256 biggestWin
    ) {
        PlayerStats storage stats = playerStats[player];
        return (
            stats.totalTickets,
            stats.totalWinnings,
            stats.ticketIds,
            playerDeposits[player],
            stats.lastPlayTime,
            stats.totalSpent,
            stats.biggestWin
        );
    }
    
    // FIXED: Simplified winners function
    function getDrawWinners(uint256 drawId) external view validDrawId(drawId) returns (
        address[] memory winners,
        uint256[] memory matchCounts,
        uint256[] memory prizeAmounts,
        bool[] memory claimed
    ) {
        require(draws[drawId].executed, "Draw not executed");
        
        uint256[] memory ticketIds = drawTickets[drawId];
        uint256 winnerCount = 0;
        
        // Count winners first
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 matches = _countMatches(
                tickets[ticketIds[i]].numbers,
                draws[drawId].winningNumbers
            );
            if (matches >= 2) {
                winnerCount++;
            }
        }
        
        // Allocate arrays
        winners = new address[](winnerCount);
        matchCounts = new uint256[](winnerCount);
        prizeAmounts = new uint256[](winnerCount);
        claimed = new bool[](winnerCount);
        
        // Populate winner data
        uint256 index = 0;
        Draw storage draw = draws[drawId];
        
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            uint256 matches = _countMatches(
                tickets[ticketId].numbers,
                draw.winningNumbers
            );
            
            if (matches >= 2) {
                winners[index] = tickets[ticketId].player;
                matchCounts[index] = matches;
                
                // Get prize amount based on matches
                if (matches == 5) {
                    prizeAmounts[index] = draw.prize5Amount;
                } else if (matches == 4) {
                    prizeAmounts[index] = draw.prize4Amount;
                } else if (matches == 3) {
                    prizeAmounts[index] = draw.prize3Amount;
                } else if (matches == 2) {
                    prizeAmounts[index] = draw.prize2Amount;
                }
                
                claimed[index] = tickets[ticketId].claimed;
                index++;
            }
        }
    }
    
    function getRolloverAmount() external view returns (uint256) {
        return accumulatedJackpot;
    }
    
    // ============ INTERNAL FUNCTIONS - FIXED ============
    
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
    
    function _generateRandomNumbers() internal returns (uint256[NUMBERS_PER_TICKET] memory) {
        randomNonce++;
        
        uint256[] memory availableNumbers = new uint256[](MAX_NUMBER);
        for (uint256 i = 0; i < MAX_NUMBER; i++) {
            availableNumbers[i] = i + MIN_NUMBER;
        }
        
        uint256[NUMBERS_PER_TICKET] memory selectedNumbers;
        uint256 remainingCount = MAX_NUMBER;
        
        uint256 baseEntropy = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            block.coinbase,
            msg.sender,
            currentDrawId,
            totalTicketsSold,
            address(this).balance,
            gasleft(),
            randomNonce
        )));
        
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            uint256 additionalEntropy = uint256(keccak256(abi.encodePacked(
                baseEntropy,
                i,
                block.timestamp + i,
                remainingCount,
                randomNonce + i
            )));
            
            uint256 randomIndex = additionalEntropy % remainingCount;
            selectedNumbers[i] = availableNumbers[randomIndex];
            
            availableNumbers[randomIndex] = availableNumbers[remainingCount - 1];
            remainingCount--;
        }
        
        _sortNumbers(selectedNumbers);
        return selectedNumbers;
    }
    
    // FIXED: Prize processing with correct calculations
    function _processWinners(uint256 drawId, uint256[NUMBERS_PER_TICKET] memory winningNumbers) internal {
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
        
        // Calculate prize amounts - FIXED CALCULATION
        uint256 totalPrizePool = draw.totalPrizePool - draw.executorReward;
        
        // Jackpot (5 matches)
        if (draw.winners5Count > 0) {
            uint256 jackpotTotal = (totalPrizePool * JACKPOT_PERCENTAGE) / 10000;
            draw.prize5Amount = jackpotTotal / draw.winners5Count;
            draw.jackpotAmount = jackpotTotal;
        }
        
        // Second prize (4 matches)
        if (draw.winners4Count > 0) {
            uint256 secondPrizeTotal = (totalPrizePool * SECOND_PRIZE_PERCENTAGE) / 10000;
            draw.prize4Amount = secondPrizeTotal / draw.winners4Count;
        }
        
        // Third prize (3 matches)
        if (draw.winners3Count > 0) {
            uint256 thirdPrizeTotal = (totalPrizePool * THIRD_PRIZE_PERCENTAGE) / 10000;
            draw.prize3Amount = thirdPrizeTotal / draw.winners3Count;
        }
        
        // Fourth prize (2 matches)
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
        if (reward < MIN_EXECUTOR_REWARD) {
            return MIN_EXECUTOR_REWARD;
        } else if (reward > MAX_EXECUTOR_REWARD) {
            return MAX_EXECUTOR_REWARD;
        }
        return reward;
    }
    
    function _canExecuteDrawPublic() internal view returns (bool) {
        if (draws[currentDrawId].executed || drawTickets[currentDrawId].length == 0) {
            return false;
        }
        
        bool timeReached = block.timestamp >= nextDrawTime;
        bool blockReached = block.number >= nextDrawBlock;
        
        return timeReached && blockReached;
    }
    
    function _updateDrawTiming() internal {
        lastDrawTime = block.timestamp;
        nextDrawTime = block.timestamp + DRAW_INTERVAL;
        lastDrawBlock = block.number;
        nextDrawBlock = block.number + BLOCKS_PER_DRAW;
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
        for (uint256 i = 0; i < NUMBERS_PER_TICKET - 1; i++) {
            for (uint256 j = 0; j < NUMBERS_PER_TICKET - i - 1; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    uint256 temp = numbers[j];
                    numbers[j] = numbers[j + 1];
                    numbers[j + 1] = temp;
                }
            }
        }
    }
    
    // ============ FALLBACK FUNCTIONS ============
    
    receive() external payable {
        accumulatedJackpot += msg.value;
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}