// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title KasDrawLottery
 * @dev Decentralized lottery contract for Kasplex EVM testnet
 * @author KasDraw Team
 */
contract KasDrawLottery is Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant TICKET_PRICE = 10 ether; // 10 KAS
    uint256 public constant NUMBERS_PER_TICKET = 6;
    uint256 public constant MAX_NUMBER = 49;
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant ADMIN_FEE_PERCENTAGE = 1; // 1%
    
    // Prize distribution percentages
    uint256 public constant JACKPOT_PERCENTAGE = 60; // 60%
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 20; // 20%
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 15; // 15%
    uint256 public constant FOURTH_PRIZE_PERCENTAGE = 5; // 5% (fixed from 4% to total 100%)
    
    // Structs
    struct Ticket {
        address player;
        uint256[NUMBERS_PER_TICKET] numbers;
        uint256 drawId;
        bool claimed;
    }
    
    struct Draw {
        uint256 id;
        uint256[NUMBERS_PER_TICKET] winningNumbers;
        uint256 timestamp;
        uint256 totalPrizePool;
        uint256 jackpotAmount;
        bool executed;
        mapping(uint256 => uint256) winnersCount; // matches => count
        mapping(uint256 => uint256) prizeAmounts; // matches => amount per winner
    }
    
    struct PlayerStats {
        uint256 totalTickets;
        uint256 totalWinnings;
        uint256[] ticketIds;
    }
    
    // State variables
    uint256 public currentDrawId;
    uint256 public totalTicketsSold;
    uint256 public accumulatedJackpot;
    uint256 public adminBalance;
    
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => uint256[]) public drawTickets; // drawId => ticketIds
    
    uint256 private ticketCounter;
    
    // Events
    event TicketPurchased(
        address indexed player,
        uint256 indexed ticketId,
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] numbers
    );
    
    event DrawExecuted(
        uint256 indexed drawId,
        uint256[NUMBERS_PER_TICKET] winningNumbers,
        uint256 totalPrizePool,
        uint256 jackpotAmount
    );
    
    event PrizeClaimed(
        address indexed player,
        uint256 indexed ticketId,
        uint256 matches,
        uint256 amount
    );
    
    event AdminFeesWithdrawn(address indexed admin, uint256 amount);
    
    constructor() {
        currentDrawId = 1;
        ticketCounter = 1;
    }
    
    /**
     * @dev Purchase lottery tickets
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
            
            // Copy numbers
            for (uint256 j = 0; j < NUMBERS_PER_TICKET; j++) {
                ticket.numbers[j] = ticketNumbers[i][j];
            }
            
            // Update mappings
            drawTickets[currentDrawId].push(ticketId);
            playerStats[msg.sender].ticketIds.push(ticketId);
            playerStats[msg.sender].totalTickets++;
            
            emit TicketPurchased(msg.sender, ticketId, currentDrawId, ticketNumbers[i]);
        }
        
        totalTicketsSold += ticketNumbers.length;
        
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
        
        _executeDraw(winningNumbers);
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
        
        _executeDraw(winningNumbers);
    }
    
    /**
     * @dev Internal function to execute draw with given winning numbers
     */
    function _executeDraw(uint256[NUMBERS_PER_TICKET] memory winningNumbers) internal {
        Draw storage draw = draws[currentDrawId];
        draw.id = currentDrawId;
        draw.timestamp = block.timestamp;
        draw.totalPrizePool = accumulatedJackpot;
        draw.executed = true;
        
        // Copy winning numbers
        for (uint256 i = 0; i < NUMBERS_PER_TICKET; i++) {
            draw.winningNumbers[i] = winningNumbers[i];
        }
        
        // Count winners for each prize tier
        uint256[] memory currentDrawTickets = drawTickets[currentDrawId];
        
        for (uint256 i = 0; i < currentDrawTickets.length; i++) {
            uint256 ticketId = currentDrawTickets[i];
            uint256 matches = _countMatches(tickets[ticketId].numbers, winningNumbers);
            
            if (matches >= 3) {
                draw.winnersCount[matches]++;
            }
        }
        
        // Calculate prize amounts
        uint256 totalPrizePool = draw.totalPrizePool;
        
        if (draw.winnersCount[6] > 0) {
            // Jackpot won
            draw.prizeAmounts[6] = (totalPrizePool * JACKPOT_PERCENTAGE / 100) / draw.winnersCount[6];
            draw.jackpotAmount = draw.prizeAmounts[6] * draw.winnersCount[6];
            accumulatedJackpot = 0; // Reset jackpot
        } else {
            // Jackpot rolls over
            draw.jackpotAmount = 0;
        }
        
        if (draw.winnersCount[5] > 0) {
            draw.prizeAmounts[5] = (totalPrizePool * SECOND_PRIZE_PERCENTAGE / 100) / draw.winnersCount[5];
        }
        
        if (draw.winnersCount[4] > 0) {
            draw.prizeAmounts[4] = (totalPrizePool * THIRD_PRIZE_PERCENTAGE / 100) / draw.winnersCount[4];
        }
        
        if (draw.winnersCount[3] > 0) {
            draw.prizeAmounts[3] = (totalPrizePool * FOURTH_PRIZE_PERCENTAGE / 100) / draw.winnersCount[3];
        }
        
        emit DrawExecuted(currentDrawId, winningNumbers, totalPrizePool, draw.jackpotAmount);
        
        // Start next draw
        currentDrawId++;
    }
    
    /**
     * @dev Claim prize for a winning ticket
     * @param ticketId The ID of the winning ticket
     */
    function claimPrize(uint256 ticketId) external nonReentrant {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not ticket owner");
        require(!ticket.claimed, "Prize already claimed");
        require(draws[ticket.drawId].executed, "Draw not executed yet");
        
        Draw storage draw = draws[ticket.drawId];
        uint256 matches = _countMatches(ticket.numbers, draw.winningNumbers);
        
        require(matches >= 3, "No prize to claim");
        
        uint256 prizeAmount = draw.prizeAmounts[matches];
        require(prizeAmount > 0, "No prize amount set");
        
        ticket.claimed = true;
        playerStats[msg.sender].totalWinnings += prizeAmount;
        
        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit PrizeClaimed(msg.sender, ticketId, matches, prizeAmount);
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
    
    // View functions
    
    /**
     * @dev Get ticket details
     */
    function getTicket(uint256 ticketId) external view returns (
        address player,
        uint256[NUMBERS_PER_TICKET] memory numbers,
        uint256 drawId,
        bool claimed
    ) {
        Ticket storage ticket = tickets[ticketId];
        return (ticket.player, ticket.numbers, ticket.drawId, ticket.claimed);
    }
    
    /**
     * @dev Get draw details
     */
    function getDraw(uint256 drawId) external view returns (
        uint256 id,
        uint256[NUMBERS_PER_TICKET] memory winningNumbers,
        uint256 timestamp,
        uint256 totalPrizePool,
        uint256 jackpotAmount,
        bool executed
    ) {
        Draw storage draw = draws[drawId];
        return (
            draw.id,
            draw.winningNumbers,
            draw.timestamp,
            draw.totalPrizePool,
            draw.jackpotAmount,
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
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalTickets,
        uint256 totalWinnings,
        uint256[] memory ticketIds
    ) {
        PlayerStats storage stats = playerStats[player];
        return (stats.totalTickets, stats.totalWinnings, stats.ticketIds);
    }
    
    /**
     * @dev Get tickets for a specific draw
     */
    function getDrawTickets(uint256 drawId) external view returns (uint256[] memory) {
        return drawTickets[drawId];
    }
    
    /**
     * @dev Get current lottery state
     */
    function getLotteryState() external view returns (
        uint256 _currentDrawId,
        uint256 _totalTicketsSold,
        uint256 _accumulatedJackpot,
        uint256 _adminBalance,
        bool _paused
    ) {
        return (
            currentDrawId,
            totalTicketsSold,
            accumulatedJackpot,
            adminBalance,
            paused()
        );
    }

    /**
     * @dev Get winner addresses for a specific draw
     * @param drawId The draw ID to get winners for
     * @return winners Array of winner addresses with their match counts and prize amounts
     */
    function getDrawWinners(uint256 drawId) external view returns (
        address[] memory winners,
        uint256[] memory matchCounts,
        uint256[] memory prizeAmounts,
        bool[] memory claimed
    ) {
        require(draws[drawId].executed, "Draw not executed yet");
        
        uint256[] memory ticketIds = drawTickets[drawId];
        uint256 winnerCount = 0;
        
        // First pass: count winners
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            uint256 matches = _countMatches(tickets[ticketId].numbers, draws[drawId].winningNumbers);
            if (matches >= 3) {
                winnerCount++;
            }
        }
        
        // Initialize arrays
        winners = new address[](winnerCount);
        matchCounts = new uint256[](winnerCount);
        prizeAmounts = new uint256[](winnerCount);
        claimed = new bool[](winnerCount);
        
        // Second pass: populate winner data
        uint256 index = 0;
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            uint256 matches = _countMatches(tickets[ticketId].numbers, draws[drawId].winningNumbers);
            
            if (matches >= 3) {
                winners[index] = tickets[ticketId].player;
                matchCounts[index] = matches;
                prizeAmounts[index] = draws[drawId].prizeAmounts[matches];
                claimed[index] = tickets[ticketId].claimed;
                index++;
            }
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
     * @dev Validate ticket numbers
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
     * Uses multiple entropy sources for better randomness distribution
     * Implements Fisher-Yates shuffle algorithm for uniform distribution
     */
    function _generateRandomNumbers() internal view returns (uint256[NUMBERS_PER_TICKET] memory) {
        // Create array of all possible numbers (1-49)
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
        
        // Use Fisher-Yates shuffle to select 6 unique numbers
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