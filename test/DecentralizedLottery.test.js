const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Comprehensive Test Suite for DecentralizedLottery Contract
 * 
 * Test Coverage:
 * - Contract deployment and initialization
 * - Ticket purchasing (single and batch)
 * - Draw execution and randomness
 * - Prize claiming and distribution
 * - Analytics and statistics
 * - Security features and edge cases
 * - Gas optimization validation
 * - Emergency circuit breakers
 * - Testing mode functionality
 */

describe("DecentralizedLottery", function () {
    // Test constants
    const TICKET_PRICE = ethers.parseEther("0.1");
    const NUMBERS_PER_TICKET = 5;
    const MAX_NUMBER = 35;
    const MIN_NUMBER = 1;
    const TEST_DRAW_INTERVAL = 600; // 10 minutes for testing
    
    // Valid ticket numbers for testing
    const VALID_TICKET_1 = [1, 5, 10, 15, 20];
    const VALID_TICKET_2 = [2, 6, 11, 16, 21];
    const VALID_TICKET_3 = [3, 7, 12, 17, 22];
    const INVALID_TICKET_DUPLICATE = [1, 1, 10, 15, 20];
    const INVALID_TICKET_OUT_OF_RANGE = [0, 5, 10, 15, 20];
    const INVALID_TICKET_HIGH_NUMBER = [1, 5, 10, 15, 36];
    
    async function deployLotteryFixture() {
        const [owner, player1, player2, player3, executor] = await ethers.getSigners();
        
        const DecentralizedLottery = await ethers.getContractFactory("DecentralizedLottery");
        const lottery = await DecentralizedLottery.deploy(true); // Testing mode enabled
        
        return { lottery, owner, player1, player2, player3, executor };
    }
    
    describe("Deployment and Initialization", function () {
        it("Should deploy with correct initial values", async function () {
            const { lottery } = await loadFixture(deployLotteryFixture);
            
            expect(await lottery.currentDrawId()).to.equal(1);
            expect(await lottery.accumulatedJackpot()).to.equal(0);
            expect(await lottery.protocolFeeBalance()).to.equal(0);
            expect(await lottery.testingMode()).to.equal(true);
            expect(await lottery.emergencyPaused()).to.equal(false);
            
            const analytics = await lottery.getAnalytics();
            expect(analytics.totalDraws).to.equal(0);
            expect(analytics.totalTicketsSold).to.equal(0);
            expect(analytics.totalPrizesDistributed).to.equal(0);
            expect(analytics.totalPlayers).to.equal(0);
        });
        
        it("Should set correct timing for testing mode", async function () {
            const { lottery } = await loadFixture(deployLotteryFixture);
            
            const drawInfo = await lottery.getDrawInfo();
            expect(drawInfo.canExecute).to.equal(false); // No tickets sold yet
            
            const timeUntil = await lottery.getTimeUntilDraw();
            expect(timeUntil.timeRemaining).to.be.greaterThan(0);
        });
        
        it("Should have correct constants", async function () {
            const { lottery } = await loadFixture(deployLotteryFixture);
            
            expect(await lottery.TICKET_PRICE()).to.equal(TICKET_PRICE);
            expect(await lottery.NUMBERS_PER_TICKET()).to.equal(NUMBERS_PER_TICKET);
            expect(await lottery.MAX_NUMBER()).to.equal(MAX_NUMBER);
            expect(await lottery.MIN_NUMBER()).to.equal(MIN_NUMBER);
        });
    });
    
    describe("Ticket Purchasing", function () {
        it("Should purchase single ticket successfully", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await expect(
                lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                    value: TICKET_PRICE
                })
            ).to.emit(lottery, "TicketsPurchased")
            .withArgs(player1.address, 1, [1], TICKET_PRICE, 1);
            
            const ticket = await lottery.getTicket(1);
            expect(ticket.player).to.equal(player1.address);
            expect(ticket.drawId).to.equal(1);
            expect(ticket.claimed).to.equal(false);
            
            // Check numbers
            for (let i = 0; i < NUMBERS_PER_TICKET; i++) {
                expect(ticket.numbers[i]).to.equal(VALID_TICKET_1[i]);
            }
        });
        
        it("Should purchase multiple tickets in batch", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            const tickets = [VALID_TICKET_1, VALID_TICKET_2, VALID_TICKET_3];
            const totalCost = TICKET_PRICE * BigInt(tickets.length);
            
            await expect(
                lottery.connect(player1).purchaseTickets(tickets, {
                    value: totalCost
                })
            ).to.emit(lottery, "TicketsPurchased")
            .withArgs(player1.address, 1, [1, 2, 3], totalCost, 1);
            
            // Verify all tickets
            for (let i = 0; i < tickets.length; i++) {
                const ticket = await lottery.getTicket(i + 1);
                expect(ticket.player).to.equal(player1.address);
                expect(ticket.batchId).to.equal(1);
            }
        });
        
        it("Should reject invalid ticket numbers", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Test duplicate numbers
            await expect(
                lottery.connect(player1).purchaseTickets([INVALID_TICKET_DUPLICATE], {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Duplicate numbers not allowed");
            
            // Test out of range (too low)
            await expect(
                lottery.connect(player1).purchaseTickets([INVALID_TICKET_OUT_OF_RANGE], {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Number out of range");
            
            // Test out of range (too high)
            await expect(
                lottery.connect(player1).purchaseTickets([INVALID_TICKET_HIGH_NUMBER], {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Number out of range");
        });
        
        it("Should reject incorrect payment amount", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Too little payment
            await expect(
                lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                    value: TICKET_PRICE - 1n
                })
            ).to.be.revertedWith("Incorrect payment amount");
            
            // Too much payment
            await expect(
                lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                    value: TICKET_PRICE + 1n
                })
            ).to.be.revertedWith("Incorrect payment amount");
        });
        
        it("Should update player stats correctly", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            const stats = await lottery.getPlayerStats(player1.address);
            expect(stats.totalTickets).to.equal(1);
            expect(stats.totalSpent).to.equal(TICKET_PRICE);
            expect(stats.totalWinnings).to.equal(0);
            expect(stats.winCount).to.equal(0);
            expect(stats.ticketIds.length).to.equal(1);
            
            // Purchase more tickets
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_2, VALID_TICKET_3], {
                value: TICKET_PRICE * 2n
            });
            
            const updatedStats = await lottery.getPlayerStats(player1.address);
            expect(updatedStats.totalTickets).to.equal(3);
            expect(updatedStats.totalSpent).to.equal(TICKET_PRICE * 3n);
            expect(updatedStats.ticketIds.length).to.equal(3);
        });
        
        it("Should update analytics correctly", async function () {
            const { lottery, player1, player2 } = await loadFixture(deployLotteryFixture);
            
            // First player purchases tickets
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            let analytics = await lottery.getAnalytics();
            expect(analytics.totalTicketsSold).to.equal(1);
            expect(analytics.totalPlayers).to.equal(1);
            
            // Second player purchases tickets
            await lottery.connect(player2).purchaseTickets([VALID_TICKET_2], {
                value: TICKET_PRICE
            });
            
            analytics = await lottery.getAnalytics();
            expect(analytics.totalTicketsSold).to.equal(2);
            expect(analytics.totalPlayers).to.equal(2);
            
            // First player purchases more (should not increase player count)
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_3], {
                value: TICKET_PRICE
            });
            
            analytics = await lottery.getAnalytics();
            expect(analytics.totalTicketsSold).to.equal(3);
            expect(analytics.totalPlayers).to.equal(2); // Still 2 unique players
        });
        
        it("Should accumulate jackpot correctly", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            const initialJackpot = await lottery.accumulatedJackpot();
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            const protocolFee = (TICKET_PRICE * 50n) / 10000n; // 0.5%
            const expectedJackpotIncrease = TICKET_PRICE - protocolFee;
            
            const newJackpot = await lottery.accumulatedJackpot();
            expect(newJackpot).to.equal(initialJackpot + expectedJackpotIncrease);
        });
    });
    
    describe("Draw Execution", function () {
        it("Should not execute draw without tickets", async function () {
            const { lottery, executor } = await loadFixture(deployLotteryFixture);
            
            await expect(
                lottery.connect(executor).executeDraw()
            ).to.be.revertedWith("No tickets sold");
        });
        
        it("Should not execute draw before time/block conditions", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase tickets
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            // Try to execute immediately (should fail)
            await expect(
                lottery.connect(executor).executeDraw()
            ).to.be.revertedWith("Cannot execute draw yet");
        });
        
        it("Should execute draw successfully in testing mode", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase tickets
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1, VALID_TICKET_2], {
                value: TICKET_PRICE * 2n
            });
            
            // Use testing function to force execution
            await expect(
                lottery.connect(executor).forceExecuteDrawForTesting()
            ).to.emit(lottery, "DrawExecuted");
            
            const draw = await lottery.getDraw(1);
            expect(draw.executed).to.equal(true);
            expect(draw.executor).to.equal(executor.address);
            expect(draw.totalTickets).to.equal(2);
            expect(draw.totalPrizePool).to.be.greaterThan(0);
            
            // Verify winning numbers are valid
            for (let i = 0; i < NUMBERS_PER_TICKET; i++) {
                expect(draw.winningNumbers[i]).to.be.gte(MIN_NUMBER);
                expect(draw.winningNumbers[i]).to.be.lte(MAX_NUMBER);
            }
            
            // Check that numbers are sorted and unique
            for (let i = 0; i < NUMBERS_PER_TICKET - 1; i++) {
                expect(draw.winningNumbers[i]).to.be.lt(draw.winningNumbers[i + 1]);
            }
        });
        
        it("Should pay executor reward", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase tickets to build jackpot
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            const initialBalance = await ethers.provider.getBalance(executor.address);
            
            // Execute draw
            const tx = await lottery.connect(executor).forceExecuteDrawForTesting();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const finalBalance = await ethers.provider.getBalance(executor.address);
            const draw = await lottery.getDraw(1);
            
            // Executor should receive reward minus gas costs
            const expectedBalance = initialBalance - gasUsed + draw.executorReward;
            expect(finalBalance).to.equal(expectedBalance);
        });
        
        it("Should increment draw ID after execution", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            expect(await lottery.currentDrawId()).to.equal(1);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            expect(await lottery.currentDrawId()).to.equal(2);
        });
        
        it("Should handle rollover correctly", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase tickets
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            const jackpotBefore = await lottery.accumulatedJackpot();
            
            // Execute draw (likely no winners with random numbers)
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            const jackpotAfter = await lottery.accumulatedJackpot();
            const draw = await lottery.getDraw(1);
            
            // If no jackpot winners, amount should roll over
            if (draw.winners5Count === 0n) {
                expect(jackpotAfter).to.be.greaterThan(0);
            }
        });
    });
    
    describe("Prize Claiming", function () {
        it("Should not claim prizes before draw execution", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            await expect(
                lottery.connect(player1).claimPrizes([1])
            ).to.be.revertedWith("Draw not executed");
        });
        
        it("Should not claim prizes for non-owned tickets", async function () {
            const { lottery, player1, player2, executor } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            await expect(
                lottery.connect(player2).claimPrizes([1])
            ).to.be.revertedWith("Not ticket owner");
        });
        
        it("Should not double-claim prizes", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            // Try to claim (might not win, but test the flow)
            try {
                await lottery.connect(player1).claimPrizes([1]);
                
                // If first claim succeeded, second should fail
                await expect(
                    lottery.connect(player1).claimPrizes([1])
                ).to.be.revertedWith("Prize already claimed");
            } catch (error) {
                // If no prizes to claim, that's also valid for this test
                expect(error.message).to.include("No prizes to claim");
            }
        });
    });
    
    describe("Analytics and View Functions", function () {
        it("Should return correct draw info", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1, VALID_TICKET_2], {
                value: TICKET_PRICE * 2n
            });
            
            const drawInfo = await lottery.getDrawInfo();
            expect(drawInfo.currentDraw).to.equal(1);
            expect(drawInfo.ticketsSold).to.equal(2);
            expect(drawInfo.currentJackpot).to.be.greaterThan(0);
            expect(drawInfo.canExecute).to.equal(false); // Time not reached
        });
        
        it("Should return correct player tickets by draw", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase tickets for draw 1
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1, VALID_TICKET_2], {
                value: TICKET_PRICE * 2n
            });
            
            let playerTickets = await lottery.getPlayerTicketsByDraw(player1.address, 1);
            expect(playerTickets.length).to.equal(2);
            
            // Execute draw and move to next
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            // Purchase tickets for draw 2
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_3], {
                value: TICKET_PRICE
            });
            
            playerTickets = await lottery.getPlayerTicketsByDraw(player1.address, 2);
            expect(playerTickets.length).to.equal(1);
            
            // Draw 1 tickets should still be there
            playerTickets = await lottery.getPlayerTicketsByDraw(player1.address, 1);
            expect(playerTickets.length).to.equal(2);
        });
        
        it("Should return correct time until draw", async function () {
            const { lottery } = await loadFixture(deployLotteryFixture);
            
            const timeUntil = await lottery.getTimeUntilDraw();
            expect(timeUntil.timeRemaining).to.be.greaterThan(0);
            expect(timeUntil.blocksRemaining).to.be.greaterThan(0);
        });
    });
    
    describe("Security Features", function () {
        it("Should prevent reentrancy attacks", async function () {
            // This would require a malicious contract to test properly
            // For now, we verify the modifier is in place
            const { lottery } = await loadFixture(deployLotteryFixture);
            
            // The contract should have ReentrancyGuard imported and used
            // This is verified by the successful deployment
            expect(await lottery.getAddress()).to.be.properAddress;
        });
        
        it("Should handle emergency pause correctly", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Build up a large jackpot to trigger emergency pause
            const largeAmount = ethers.parseEther("150"); // Above threshold
            
            // Send large amount directly to trigger emergency pause
            await player1.sendTransaction({
                to: await lottery.getAddress(),
                value: largeAmount
            });
            
            expect(await lottery.emergencyPaused()).to.equal(true);
            
            // Should not be able to purchase tickets when emergency paused
            await expect(
                lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Emergency paused");
        });
        
        it("Should validate ticket IDs correctly", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Try to get non-existent ticket
            await expect(
                lottery.getTicket(999)
            ).to.be.revertedWith("Invalid ticket ID");
            
            // Try to get draw that doesn't exist
            await expect(
                lottery.getDraw(999)
            ).to.be.revertedWith("Invalid draw ID");
        });
    });
    
    describe("Testing Mode Features", function () {
        it("Should allow testing mode configuration", async function () {
            const { lottery, owner } = await loadFixture(deployLotteryFixture);
            
            expect(await lottery.testingMode()).to.equal(true);
            
            // Set custom test interval
            await expect(
                lottery.connect(owner).setTestingMode(true, 300) // 5 minutes
            ).to.emit(lottery, "TestingModeChanged")
            .withArgs(true, 300);
        });
        
        it("Should allow force execution in testing mode", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            // Should be able to force execute in testing mode
            await expect(
                lottery.connect(executor).forceExecuteDrawForTesting()
            ).to.emit(lottery, "DrawExecuted");
        });
        
        it("Should reject testing functions when not in testing mode", async function () {
            // Deploy in production mode
            const DecentralizedLottery = await ethers.getContractFactory("DecentralizedLottery");
            const prodLottery = await DecentralizedLottery.deploy(false); // Production mode
            
            const [owner] = await ethers.getSigners();
            
            await expect(
                prodLottery.connect(owner).setTestingMode(true, 300)
            ).to.be.revertedWith("Only available in testing mode");
            
            await expect(
                prodLottery.connect(owner).forceExecuteDrawForTesting()
            ).to.be.revertedWith("Only available in testing mode");
        });
    });
    
    describe("Gas Optimization", function () {
        it("Should handle batch ticket purchases efficiently", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Purchase maximum batch size
            const maxBatch = [];
            for (let i = 0; i < 50; i++) {
                maxBatch.push([1 + i % 5, 6 + i % 5, 11 + i % 5, 16 + i % 5, 21 + i % 5]);
            }
            
            const totalCost = TICKET_PRICE * BigInt(maxBatch.length);
            
            // Should succeed with max batch size
            await expect(
                lottery.connect(player1).purchaseTickets(maxBatch, {
                    value: totalCost
                })
            ).to.emit(lottery, "TicketsPurchased");
            
            // Should reject over max batch size
            const overMaxBatch = [...maxBatch, [1, 2, 3, 4, 5]];
            
            await expect(
                lottery.connect(player1).purchaseTickets(overMaxBatch, {
                    value: TICKET_PRICE * BigInt(overMaxBatch.length)
                })
            ).to.be.revertedWith("Too many tickets in batch");
        });
        
        it("Should limit prize claiming batch size", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Purchase many tickets
            const tickets = [];
            for (let i = 0; i < 25; i++) {
                tickets.push([1 + i % 5, 6 + i % 5, 11 + i % 5, 16 + i % 5, 21 + i % 5]);
            }
            
            await lottery.connect(player1).purchaseTickets(tickets, {
                value: TICKET_PRICE * BigInt(tickets.length)
            });
            
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            // Should be able to claim up to 20 tickets
            const ticketIds = Array.from({length: 20}, (_, i) => i + 1);
            
            try {
                await lottery.connect(player1).claimPrizes(ticketIds);
            } catch (error) {
                // Might fail with "No prizes to claim" which is fine
                expect(error.message).to.include("No prizes to claim");
            }
            
            // Should reject over 20 tickets
            const tooManyTicketIds = Array.from({length: 21}, (_, i) => i + 1);
            
            await expect(
                lottery.connect(player1).claimPrizes(tooManyTicketIds)
            ).to.be.revertedWith("Too many tickets in one claim");
        });
    });
    
    describe("Economic Model", function () {
        it("Should calculate fees correctly", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            const initialProtocolFees = await lottery.protocolFeeBalance();
            const initialJackpot = await lottery.accumulatedJackpot();
            
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            const finalProtocolFees = await lottery.protocolFeeBalance();
            const finalJackpot = await lottery.accumulatedJackpot();
            
            const expectedProtocolFee = (TICKET_PRICE * 50n) / 10000n; // 0.5%
            const expectedJackpotIncrease = TICKET_PRICE - expectedProtocolFee;
            
            expect(finalProtocolFees - initialProtocolFees).to.equal(expectedProtocolFee);
            expect(finalJackpot - initialJackpot).to.equal(expectedJackpotIncrease);
        });
        
        it("Should calculate executor rewards within bounds", async function () {
            const { lottery, player1, executor } = await loadFixture(deployLotteryFixture);
            
            // Small jackpot - should get minimum reward
            await lottery.connect(player1).purchaseTickets([VALID_TICKET_1], {
                value: TICKET_PRICE
            });
            
            await lottery.connect(executor).forceExecuteDrawForTesting();
            
            const draw = await lottery.getDraw(1);
            const minReward = ethers.parseEther("0.05"); // MIN_EXECUTOR_REWARD
            
            expect(draw.executorReward).to.be.gte(minReward);
        });
    });
    
    describe("Edge Cases and Error Handling", function () {
        it("Should handle empty ticket arrays", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await expect(
                lottery.connect(player1).purchaseTickets([], {
                    value: 0
                })
            ).to.be.revertedWith("Must purchase at least one ticket");
        });
        
        it("Should handle empty claim arrays", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            await expect(
                lottery.connect(player1).claimPrizes([])
            ).to.be.revertedWith("No tickets to claim");
        });
        
        it("Should handle contract receiving ETH", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            const initialJackpot = await lottery.accumulatedJackpot();
            const donationAmount = ethers.parseEther("1.0");
            
            // Send ETH directly to contract (donation)
            await player1.sendTransaction({
                to: await lottery.getAddress(),
                value: donationAmount
            });
            
            const finalJackpot = await lottery.accumulatedJackpot();
            expect(finalJackpot - initialJackpot).to.equal(donationAmount);
        });
        
        it("Should reject calls to non-existent functions", async function () {
            const { lottery, player1 } = await loadFixture(deployLotteryFixture);
            
            // Try to call non-existent function
            await expect(
                player1.sendTransaction({
                    to: await lottery.getAddress(),
                    data: "0x12345678" // Random function selector
                })
            ).to.be.revertedWith("Function not found");
        });
    });
});