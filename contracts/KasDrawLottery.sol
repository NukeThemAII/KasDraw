// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title KasDrawLottery - Enhanced Gamified Version
 * @dev Decentralized lottery contract with improved winning odds and user engagement
 * @author KasDraw Team
 */
contract KasDrawLottery is Ownable, ReentrancyGuard, Pausable {
    // Enhanced Constants for Better User Engagement
    uint256 public constant TICKET_PRICE = 10 ether; // 10 KAS
    uint256 public constant NUMBERS_PER_TICKET = 5; // Reduced from 6 to 5 for easier wins
    uint256 public constant MAX_NUMBER = 35; // Reduced from 49 to 35 for better odds
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant ADMIN_FEE_PERCENTAGE = 1; // 1%
    uint256 public constant DRAW_INTERVAL = 3.5 days; // Twice per week (Wednesday & Saturday)
    uint256 public constant EXECUTOR_REWARD_PERCENTAGE = 10; // 0.1% of jackpot (10 basis points)
    uint256 public constant MIN_EXECUTOR_REWARD = 0.1 ether; // Minimum 0.1 KAS
    uint256 public constant MAX_EXECUTOR_REWARD = 10 ether; // Maximum 10 KAS
    
    // Enhanced Prize Distribution for More Winners
    uint256 public constant JACKPOT_PERCENTAGE = 50; // 50% (reduced to fund more tiers)
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 20; // 20% (5 matches)
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 15; // 15% (4 matches)
    uint256 public constant FOURTH_PRIZE_PERCENTAGE = 10; // 10% (3 matches)
    uint256 public constant FIFTH_PRIZE_PERCENTAGE = 5; // 5% (2 matches) - NEW TIER!
    
    // Structs
    struct Ticket {
        address player;
        uint256[NUMBERS_PER_TICKET] numbers;
        uint256 drawId;
        bool claimed;
        uint256 purchaseTime;
    }
    
    struct Draw {
        uint256 id;
        uint256[NUMBERS_PER_TICKET] winningNumbers;
        uint256 timestamp;
        uint256 totalPrizePool;
        uint256 jackpotAmount;
        uint256 executorReward;
        address executor;
        bool executed;
        mapping(uint256 => uint256) winnersCount; // matches => count
        mapping(uint256 => uint256) prizeAmounts; // matches => amount per winner
    }
    
    struct PlayerStats {
        uint256 totalTickets;
        uint256 totalWinnings;
        uint256[] ticketIds;
        uint256 lastPlayTime;
    }
    
    struct RefundInfo {
        address player;
        uint256 amount;
    }
    
    // State variables
    uint256 public currentDrawId;
    uint256 public totalTicketsSold;
    uint256 public accumulatedJackpot;
    uint256 public adminBalance;
    uint256 public lastDrawTime;
    uint256 public nextDrawTime;
    
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => uint256[]) public drawTickets; // drawId => ticketIds
    mapping(address => uint256) public playerDeposits; // For refund tracking
    
    uint256 private ticketCounter;
    
    // Events
    event TicketPurchased(
        address indexed player,
        uint256 indexed ticketId,
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] numbers,
        uint256 timestamp
    );
    
    event DrawExecuted(
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] winningNumbers,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        address indexed executor,
        uint256 executorReward
    );
    
    event PrizeClaimed(
        address indexed player,
        uint256 indexed ticketId,
        uint256 matches,
        uint256 amount
    );
    
    event AdminFeesWithdrawn(address indexed admin, uint256 amount);
    
    event DrawExecutedByPublic(
        address indexed executor,
        uint256 indexed drawId,
        uint256 reward
    );
    
    event EmergencyRefund(
        address indexed player,
        uint256 amount
    );
    
    constructor() {
        currentDrawId = 1;
        ticketCounter = 1;
        lastDrawTime = block.timestamp;
        nextDrawTime = block.timestamp + DRAW_INTERVAL;
    }
    
    /**
     * @dev Purchase lottery tickets with enhanced tracking
     * @param ticketNumbers Array of ticket numbers (each ticket has NUMBERS_PER_TICKET numbers)
     */
    function purchaseTickets(
        uint256[NUMBERS_PER_TICKET][] calldata ticketNumbers
    ) external payable nonReentrant whenNotPaused {
        require(ticketNumbers.length > 0, "Must purchase at least one ticket");
        require(
            msg.value == TICKET_PRICE * ticketNumbers.length,
            "Incorrect payment amount"
        );
        
        for (uint256 i = 0; i < ticketNumbers.length; i++) {
            _validateTicketNumbers(ticketNumbers[i]);
            
            // Create ticket
            uint256 ticketId = ticketCounter++;
            Ticket storage ticket = tickets[ticketId];
            ticket.player = msg.sender;
            ticket.drawId = currentDrawId;
            ticket.purchaseTime = block.timestamp;
            
            // Copy numbers
            for (uint256 j = 0; j < NUMBERS_PER_TICKET; j++) {
                ticket.numbers[j] = ticketNumbers[i][j];
            }
            
            // Update mappings
            drawTickets[currentDrawId].push(ticketId);
            playerStats[msg.sender].ticketIds.push(ticketId);
            playerStats[msg.sender].totalTickets++;
            playerStats[msg.sender].lastPlayTime = block.timestamp;
            
            emit TicketPurchased(msg.sender, ticketId, currentDrawId, ticketNumbers[i], block.timestamp);
        }
        
        totalTicketsSold += ticketNumbers.length;
        
        // Track deposits for refund functionality
        playerDeposits[msg.sender] += msg.value;
        
        // Calculate admin fee and add to prize pool
        uint256 totalAmount = msg.value;
        uint256 adminFee = (totalAmount * ADMIN_FEE_PERCENTAGE) / 100;
        uint256 prizePoolAddition = totalAmount - adminFee;
        
        adminBalance += adminFee;
        accumulatedJackpot += prizePoolAddition;
    }
    
    /**
     * @dev Execute lottery draw with random number generation (only owner)
     */
    function executeDraw() external onlyOwner {
        require(!draws[currentDrawId].executed, "Draw already executed");
        require(drawTickets[currentDrawId].length > 0, "No tickets sold for this draw");
        
        // Generate random winning numbers
        uint256[NUMBERS_PER_TICKET] memory winningNumbers = _generateRandomNumbers();
        
        _executeDraw(winningNumbers, msg.sender);
    }
    
    /**
     * @dev Execute lottery draw with manual numbers (only owner) - for testing
     * @param winningNumbers The winning numbers for this draw
     */
    function executeDrawManual(
        uint256[NUMBERS_PER_TICKET] calldata winningNumbers
    ) external onlyOwner {
        require(!draws[currentDrawId].executed, "Draw already executed");
        _validateTicketNumbers(winningNumbers);
        
        _executeDraw(winningNumbers, msg.sender);
    }
    
    /**
     * @dev Enhanced public function to execute draw with percentage-based rewards
     * Anyone can call this function and receive a percentage of the jackpot as reward
     */
    function executeDrawPublic() external nonReentrant whenNotPaused {
        require(!draws[currentDrawId].executed, "Draw already executed");
        require(drawTickets[currentDrawId].length > 0, "No tickets sold for this draw");
        require(
            block.timestamp >= nextDrawTime,
            "Draw time not reached yet"
        );
        
        // Generate random winning numbers
        uint256[NUMBERS_PER_TICKET] memory winningNumbers = _generateRandomNumbers();
        
        // Execute the draw
        _executeDraw(winningNumbers, msg.sender);
    }
    
    /**
     * @dev Internal function to execute draw with enhanced reward calculation
     */
    function _executeDraw(uint256[NUMBERS_PER_TICKET] memory winningNumbers, address executor) internal {
        Draw storage draw = draws[currentDrawId];
        draw.id = currentDrawId;
        draw.timestamp = block.timestamp;
        draw.totalPrizePool = accumulatedJackpot;
        draw.executed = true;
        draw.executor = executor;
        
        // Copy winning numbers
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            draw.winningNumbers[i] = winningNumbers[i];
        }
        
        // Calculate executor reward (percentage of jackpot)
        uint256 executorReward = (accumulatedJackpot * EXECUTOR_REWARD_PERCENTAGE) / 10000;
        if (executorReward < MIN_EXECUTOR_REWARD) {
            executorReward = MIN_EXECUTOR_REWARD;
        } else if (executorReward > MAX_EXECUTOR_REWARD) {
            executorReward = MAX_EXECUTOR_REWARD;
        }
        
        draw.executorReward = executorReward;
        
        // Count winners for each prize tier (2-5 matches)
        uint256[] memory currentDrawTickets = drawTickets[currentDrawId];
        
        for (uint256 i = 0; i < currentDrawTickets.length; i++) {
            uint256 ticketId = currentDrawTickets[i];
            uint256 matches = _countMatches(tickets[ticketId].numbers, winningNumbers);
            
            if (matches >= 2) { // Now includes 2 matches!
                draw.winnersCount[matches]++;
            }
        }
        
        // Calculate prize amounts with enhanced distribution
        uint256 totalPrizePool = draw.totalPrizePool - executorReward;
        uint256 remainingPrizePool = totalPrizePool;
        
        // Jackpot (5 matches)
        if (draw.winnersCount[5] > 0) {
            uint256 jackpotTotal = (totalPrizePool * JACKPOT_PERCENTAGE) / 100;
            draw.prizeAmounts[5] = jackpotTotal / draw.winnersCount[5];
            draw.jackpotAmount = jackpotTotal;
            remainingPrizePool -= jackpotTotal;
            accumulatedJackpot = 0; // Reset jackpot
        } else {
            draw.jackpotAmount = 0;
        }
        
        // Second Prize (4 matches)
        if (draw.winnersCount[4] > 0) {
            uint256 secondPrizeTotal = (totalPrizePool * SECOND_PRIZE_PERCENTAGE) / 100;
            draw.prizeAmounts[4] = secondPrizeTotal / draw.winnersCount[4];
            remainingPrizePool -= secondPrizeTotal;
        }
        
        // Third Prize (3 matches)
        if (draw.winnersCount[3] > 0) {
            uint256 thirdPrizeTotal = (totalPrizePool * THIRD_PRIZE_PERCENTAGE) / 100;
            draw.prizeAmounts[3] = thirdPrizeTotal / draw.winnersCount[3];
            remainingPrizePool -= thirdPrizeTotal;
        }
        
        // Fourth Prize (2 matches) - NEW!
        if (draw.winnersCount[2] > 0) {
            uint256 fourthPrizeTotal = (totalPrizePool * FOURTH_PRIZE_PERCENTAGE) / 100;
            draw.prizeAmounts[2] = fourthPrizeTotal / draw.winnersCount[2];
            remainingPrizePool -= fourthPrizeTotal;
        }
        
        // Any remaining funds roll over to next draw
        if (remainingPrizePool > 0) {
            accumulatedJackpot += remainingPrizePool;
        }
        
        // Pay executor reward
        if (executorReward > 0 && address(this).balance >= executorReward) {
            (bool success, ) = payable(executor).call{value: executorReward}("");
            if (success) {
                emit DrawExecutedByPublic(executor, currentDrawId, executorReward);
            }
        }
        
        emit DrawExecuted(currentDrawId, winningNumbers, totalPrizePool, draw.jackpotAmount, executor, executorReward);
        
        // Update draw times
        lastDrawTime = block.timestamp;
        nextDrawTime = block.timestamp + DRAW_INTERVAL;
        
        // Start next draw
        currentDrawId++;
    }
    
    /**
     * @dev Claim prize for a winning ticket with enhanced match detection
     * @param ticketId The ID of the winning ticket
     */
    function claimPrize(uint256 ticketId) external nonReentrant {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not ticket owner");
        require(!ticket.claimed, "Prize already claimed");
        require(draws[ticket.drawId].executed, "Draw not executed yet");
        
        Draw storage draw = draws[ticket.drawId];
        uint256 matches = _countMatches(ticket.numbers, draw.winningNumbers);
        
        require(matches >= 2, "No prize to claim"); // Now includes 2 matches!
        
        uint256 prizeAmount = draw.prizeAmounts[matches];
        require(prizeAmount > 0, "No prize amount set");
        
        ticket.claimed = true;
        playerStats[msg.sender].totalWinnings += prizeAmount;
        
        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit PrizeClaimed(msg.sender, ticketId, matches, prizeAmount);
    }
    
    /**
     * @dev Emergency refund function - refunds all player deposits
     * Only owner can call this in emergency situations
     */
    function emergencyRefundAll() external onlyOwner {
        require(address(this).balance > 0, "No funds to refund");
        
        // Get all unique players who have deposits
        address[] memory players = new address[](ticketCounter);
        uint256 playerCount = 0;
        
        // Collect unique players
        for (uint256 i = 1; i < ticketCounter; i++) {
            address player = tickets[i].player;
            if (playerDeposits[player] > 0) {
                bool exists = false;
                for (uint256 j = 0; j < playerCount; j++) {
                    if (players[j] == player) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    players[playerCount] = player;
                    playerCount++;
                }
            }
        }
        
        // Refund each player
        for (uint256 i = 0; i < playerCount; i++) {
            address player = players[i];
            uint256 refundAmount = playerDeposits[player];
            
            if (refundAmount > 0 && address(this).balance >= refundAmount) {
                playerDeposits[player] = 0;
                (bool success, ) = payable(player).call{value: refundAmount}("");
                if (success) {
                    emit EmergencyRefund(player, refundAmount);
                }
            }
        }
        
        // Reset contract state
        accumulatedJackpot = 0;
        adminBalance = 0;
    }
    
    /**
     * @dev Withdraw admin fees (only owner)
     */
    function withdrawAdminFees() external onlyOwner {
        uint256 amount = adminBalance;
        require(amount > 0, "No admin fees to withdraw");
        
        adminBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Admin fee transfer failed");
        
        emit AdminFeesWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Enhanced View functions
    
    /**
     * @dev Check if draw can be executed publicly with time information
     * @return canExecute Whether the draw can be executed
     * @return timeRemaining Time remaining until draw can be executed (0 if can execute)
     * @return nextDraw Next scheduled draw time
     */
    function canExecuteDrawPublic() external view returns (bool canExecute, uint256 timeRemaining, uint256 nextDraw) {
        if (draws[currentDrawId].executed || drawTickets[currentDrawId].length == 0) {
            return (false, 0, nextDrawTime);
        }
        
        if (block.timestamp >= nextDrawTime) {
            return (true, 0, nextDrawTime);
        } else {
            return (false, nextDrawTime - block.timestamp, nextDrawTime);
        }
    }
    
    /**
     * @dev Get current executor reward amount
     * @return reward Current reward amount for executing draw
     */
    function getCurrentExecutorReward() external view returns (uint256 reward) {
        uint256 calculatedReward = (accumulatedJackpot * EXECUTOR_REWARD_PERCENTAGE) / 10000;
        if (calculatedReward < MIN_EXECUTOR_REWARD) {
            return MIN_EXECUTOR_REWARD;
        } else if (calculatedReward > MAX_EXECUTOR_REWARD) {
            return MAX_EXECUTOR_REWARD;
        }
        return calculatedReward;
    }
    
    /**
     * @dev Get enhanced lottery statistics
     */
    function getLotteryStats() external view returns (
        uint256 currentJackpot,
        uint256 ticketsSoldThisDraw,
        uint256 totalTickets,
        uint256 nextDraw,
        uint256 executorReward,
        bool canExecute
    ) {
        (bool canExec, , ) = this.canExecuteDrawPublic();
        return (
            accumulatedJackpot,
            drawTickets[currentDrawId].length,
            totalTicketsSold,
            nextDrawTime,
            this.getCurrentExecutorReward(),
            canExec
        );
    }
    
    /**
     * @dev Get ticket details
     */
    function getTicket(uint256 ticketId) external view returns (
        address player,
        uint256[NUMBERS_PER_TICKET] memory numbers,
        uint256 drawId,
        bool claimed,
        uint256 purchaseTime
    ) {
        Ticket storage ticket = tickets[ticketId];
        return (ticket.player, ticket.numbers, ticket.drawId, ticket.claimed, ticket.purchaseTime);
    }
    
    /**
     * @dev Get enhanced draw details
     */
    function getDraw(uint256 drawId) external view returns (
        uint256 id,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers,
        uint256 timestamp,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        uint256 executorReward,
        address executor,
        bool executed
    ) {
        Draw storage draw = draws[drawId];
        return (
            draw.id,
            draw.winningNumbers,
            draw.timestamp,
            draw.totalPrizePool,
            draw.jackpotAmount,
            draw.executorReward,
            draw.executor,
            draw.executed
        );
    }
    
    /**
     * @dev Get winners count for a draw and match count
     */
    function getWinnersCount(uint256 drawId, uint256 matches) external view returns (uint256) {
        return draws[drawId].winnersCount[matches];
    }
    
    /**
     * @dev Get prize amount for a draw and match count
     */
    function getPrizeAmount(uint256 drawId, uint256 matches) external view returns (uint256) {
        return draws[drawId].prizeAmounts[matches];
    }
    
    /**
     * @dev Get enhanced player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalTickets,
        uint256 totalWinnings,
        uint256[] memory ticketIds,
        uint256 totalDeposits,
        uint256 lastPlayTime
    ) {
        PlayerStats storage stats = playerStats[player];
        return (
            stats.totalTickets,
            stats.totalWinnings,
            stats.ticketIds,
            playerDeposits[player],
            stats.lastPlayTime
        );
    }
    
    /**
     * @dev Get winner addresses for a specific draw (enhanced for new prize tiers)
     */
    function getDrawWinners(uint256 drawId) external view returns (
        address[] memory winners,
        uint256[] memory matchCounts,
        uint256[] memory prizeAmounts,
        bool[] memory claimed
    ) {
        require(draws[drawId].executed, "Draw not executed yet");
        
        uint256[] memory ticketIds = drawTickets[drawId];
        
        // Use temporary arrays to store winner data
        address[] memory tempWinners = new address[](ticketIds.length);
        uint256[] memory tempMatchCounts = new uint256[](ticketIds.length);
        uint256[] memory tempPrizeAmounts = new uint256[](ticketIds.length);
        bool[] memory tempClaimed = new bool[](ticketIds.length);
        
        uint256 winnerCount = 0;
        
        // Single pass: count and populate winner data (now includes 2 matches)
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            uint256 matches = _countMatches(tickets[ticketId].numbers, draws[drawId].winningNumbers);
            
            if (matches >= 2) { // Enhanced to include 2 matches
                tempWinners[winnerCount] = tickets[ticketId].player;
                tempMatchCounts[winnerCount] = matches;
                tempPrizeAmounts[winnerCount] = draws[drawId].prizeAmounts[matches];
                tempClaimed[winnerCount] = tickets[ticketId].claimed;
                winnerCount++;
            }
        }
        
        // Create final arrays with exact size
        winners = new address[](winnerCount);
        matchCounts = new uint256[](winnerCount);
        prizeAmounts = new uint256[](winnerCount);
        claimed = new bool[](winnerCount);
        
        // Copy data to final arrays
        for (uint256 i = 0; i < winnerCount; i++) {
            winners[i] = tempWinners[i];
            matchCounts[i] = tempMatchCounts[i];
            prizeAmounts[i] = tempPrizeAmounts[i];
            claimed[i] = tempClaimed[i];
        }
        
        return (winners, matchCounts, prizeAmounts, claimed);
    }
    
    /**
     * @dev Get rollover amount for next draw
     * @return rolloverAmount The amount that will be added to next draw's jackpot
     */
    function getRolloverAmount() external view returns (uint256 rolloverAmount) {
        return accumulatedJackpot;
    }
    
    // Internal functions
    
    /**
     * @dev Validate ticket numbers (updated for new range)
     */
    function _validateTicketNumbers(uint256[NUMBERS_PER_TICKET] memory numbers) internal pure {
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            require(
                numbers[i] >= MIN_NUMBER && numbers[i] <= MAX_NUMBER,
                "Invalid number range"
            );
            
            // Check for duplicates
            for (uint256 j = i + 1; j < NUMBERS_PER_TICKET; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers not allowed");
            }
        }
    }
    
    /**
     * @dev Count matching numbers between ticket and winning numbers
     */
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
    
    /**
     * @dev Generate random winning numbers using enhanced randomness
     * Updated for new number range (1-35) and 5 numbers
     */
    function _generateRandomNumbers() internal view returns (uint256[NUMBERS_PER_TICKET] memory) {
        // Create array of all possible numbers (1-35)
        uint256[] memory availableNumbers = new uint256[](MAX_NUMBER);
        for (uint256 i = 0; i < MAX_NUMBER; i++) {
            availableNumbers[i] = i + MIN_NUMBER;
        }
        
        uint256[NUMBERS_PER_TICKET] memory selectedNumbers;
        uint256 remainingCount = MAX_NUMBER;
        
        // Enhanced entropy sources
        uint256 baseEntropy = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            block.number,
            block.coinbase,
            msg.sender,
            currentDrawId,
            totalTicketsSold,
            address(this).balance,
            gasleft()
        )));
        
        // Use Fisher-Yates shuffle to select 5 unique numbers
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            // Generate additional entropy for each selection
            uint256 additionalEntropy = uint256(keccak256(abi.encodePacked(
                baseEntropy,
                i,
                block.timestamp + i,
                remainingCount
            )));
            
            // Select random index from remaining numbers
            uint256 randomIndex = additionalEntropy % remainingCount;
            
            // Add selected number to result
            selectedNumbers[i] = availableNumbers[randomIndex];
            
            // Remove selected number by swapping with last element
            availableNumbers[randomIndex] = availableNumbers[remainingCount - 1];
            remainingCount--;
        }
        
        // Sort the selected numbers for consistent display
        _sortNumbers(selectedNumbers);
        
        return selectedNumbers;
    }
    
    /**
     * @dev Sort numbers array in ascending order using bubble sort
     * @param numbers Array of numbers to sort
     */
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
}