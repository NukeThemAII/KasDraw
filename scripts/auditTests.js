import hre from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
const { ethers } = hre;

// Load environment variables
dotenv.config();

// Test configuration
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || '0xc351628EB244ec633d5f21fBD6621e1a683B1181';
const TICKET_PRICE = ethers.parseEther('10'); // 10 KAS
const ADMIN_FEE_PERCENTAGE = 100; // 1% (100 basis points)

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  contractAddress: CONTRACT_ADDRESS,
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper functions
function logTest(name, status, details, gasUsed = null) {
  const test = {
    name,
    status,
    details,
    gasUsed,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(test);
  testResults.summary[status]++;
  
  const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${name}: ${details}${gasUsed ? ` (Gas: ${gasUsed})` : ''}`);
}

function formatKAS(wei) {
  return ethers.formatEther(wei);
}

function parseKAS(kas) {
  return ethers.parseEther(kas.toString());
}

async function main() {
  console.log('🔍 Starting KasDrawLotteryV2 Comprehensive Audit');
  console.log('📍 Contract Address:', CONTRACT_ADDRESS);
  console.log('🌐 Network:', hre.network.name);
  console.log('⏰ Started at:', new Date().toLocaleString());
  console.log('=' .repeat(80));

  // Get signers
  const [owner, player1, player2, player3, executor] = await ethers.getSigners();
  
  console.log('\n👥 Test Accounts:');
  console.log('Owner:', owner.address);
  console.log('Player1:', player1.address);
  console.log('Player2:', player2.address);
  console.log('Player3:', player3.address);
  console.log('Executor:', executor.address);

  // Get contract instance
  const lottery = await ethers.getContractAt('KasDrawLotteryV2', CONTRACT_ADDRESS);

  console.log('\n🧪 Running Audit Tests...\n');

  // ============ BASIC CONTRACT TESTS ============
  
  try {
    // Test 1: Contract deployment verification
    const contractOwner = await lottery.owner();
    if (contractOwner === owner.address) {
      logTest('Contract Deployment', 'passed', 'Owner correctly set');
    } else {
      logTest('Contract Deployment', 'failed', `Owner mismatch: expected ${owner.address}, got ${contractOwner}`);
    }

    // Test 2: Constants verification
    const ticketPrice = await lottery.TICKET_PRICE();
    const maxNumber = await lottery.MAX_NUMBER();
    const numbersPerTicket = await lottery.NUMBERS_PER_TICKET();
    const adminFeePercentage = await lottery.ADMIN_FEE_PERCENTAGE();

    if (ticketPrice.toString() === TICKET_PRICE.toString()) {
      logTest('Ticket Price', 'passed', `Correct: ${formatKAS(ticketPrice)} KAS`);
    } else {
      logTest('Ticket Price', 'failed', `Expected ${formatKAS(TICKET_PRICE)}, got ${formatKAS(ticketPrice)}`);
    }

    if (maxNumber.toString() === '35' && numbersPerTicket.toString() === '5') {
      logTest('Game Configuration', 'passed', `5/35 lottery system confirmed`);
    } else {
      logTest('Game Configuration', 'failed', `Expected 5/35, got ${numbersPerTicket}/${maxNumber}`);
    }

    if (adminFeePercentage.toString() === ADMIN_FEE_PERCENTAGE.toString()) {
      logTest('Admin Fee', 'passed', `Correct: ${Number(adminFeePercentage) / 100}%`);
    } else {
      logTest('Admin Fee', 'failed', `Expected ${ADMIN_FEE_PERCENTAGE / 100}%, got ${Number(adminFeePercentage) / 100}%`);
    }

  } catch (error) {
    logTest('Basic Contract Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ TICKET PURCHASE TESTS ============

  try {
    console.log('\n💳 Testing Ticket Purchases...');

    // Test 3: Single ticket purchase
    const ticketNumbers = [[1, 2, 3, 4, 5]];
    const tx1 = await lottery.connect(player1).purchaseTickets(ticketNumbers, {
      value: TICKET_PRICE
    });
    const receipt1 = await tx1.wait();
    
    logTest('Single Ticket Purchase', 'passed', 'Player1 bought 1 ticket', receipt1.gasUsed.toString());

    // Test 4: Multiple ticket purchase
    const multipleTickets = [
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20]
    ];
    const tx2 = await lottery.connect(player2).purchaseTickets(multipleTickets, {
      value: TICKET_PRICE * BigInt(3)
    });
    const receipt2 = await tx2.wait();
    
    logTest('Multiple Ticket Purchase', 'passed', 'Player2 bought 3 tickets', receipt2.gasUsed.toString());

    // Test 5: Invalid ticket purchase (wrong payment)
    try {
      await lottery.connect(player3).purchaseTickets([[21, 22, 23, 24, 25]], {
        value: parseKAS('5') // Wrong amount
      });
      logTest('Invalid Payment Test', 'failed', 'Should have reverted with wrong payment');
    } catch (error) {
      logTest('Invalid Payment Test', 'passed', 'Correctly rejected wrong payment amount');
    }

    // Test 6: Invalid numbers (out of range)
    try {
      await lottery.connect(player3).purchaseTickets([[1, 2, 3, 4, 36]], { // 36 is out of range
        value: TICKET_PRICE
      });
      logTest('Invalid Numbers Test', 'failed', 'Should have reverted with out-of-range numbers');
    } catch (error) {
      logTest('Invalid Numbers Test', 'passed', 'Correctly rejected out-of-range numbers');
    }

    // Test 7: Duplicate numbers
    try {
      await lottery.connect(player3).purchaseTickets([[1, 1, 2, 3, 4]], { // Duplicate 1
        value: TICKET_PRICE
      });
      logTest('Duplicate Numbers Test', 'failed', 'Should have reverted with duplicate numbers');
    } catch (error) {
      logTest('Duplicate Numbers Test', 'passed', 'Correctly rejected duplicate numbers');
    }

  } catch (error) {
    logTest('Ticket Purchase Tests', 'failed', `Unexpected error: ${error.message}`);
  }

  // ============ ACCOUNTING TESTS ============

  try {
    console.log('\n💰 Testing Accounting & Math...');

    // Test 8: Check lottery stats after purchases
    const stats = await lottery.getLotteryStats();
    const currentJackpot = stats[0];
    const ticketsSoldThisDraw = stats[1];
    const totalTickets = stats[2];

    // Expected: 4 tickets * 10 KAS = 40 KAS total
    // Admin fee: 40 * 1% = 0.4 KAS
    // Prize pool: 40 - 0.4 = 39.6 KAS
    const expectedTickets = 4;
    const expectedTotalRevenue = parseKAS('40');
    const expectedAdminFee = parseKAS('0.4');
    const expectedPrizePool = parseKAS('39.6');

    if (ticketsSoldThisDraw.toString() === expectedTickets.toString()) {
      logTest('Ticket Count', 'passed', `Correct: ${ticketsSoldThisDraw} tickets sold`);
    } else {
      logTest('Ticket Count', 'failed', `Expected ${expectedTickets}, got ${ticketsSoldThisDraw}`);
    }

    if (currentJackpot.toString() === expectedPrizePool.toString()) {
      logTest('Prize Pool Calculation', 'passed', `Correct: ${formatKAS(currentJackpot)} KAS`);
    } else {
      logTest('Prize Pool Calculation', 'failed', `Expected ${formatKAS(expectedPrizePool)}, got ${formatKAS(currentJackpot)}`);
    }

    // Test 9: Check admin balance
    const adminBalance = await lottery.adminBalance();
    if (adminBalance.toString() === expectedAdminFee.toString()) {
      logTest('Admin Fee Calculation', 'passed', `Correct: ${formatKAS(adminBalance)} KAS`);
    } else {
      logTest('Admin Fee Calculation', 'failed', `Expected ${formatKAS(expectedAdminFee)}, got ${formatKAS(adminBalance)}`);
    }

  } catch (error) {
    logTest('Accounting Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ DRAW EXECUTION TESTS ============

  try {
    console.log('\n🎲 Testing Draw Execution...');

    // Test 10: Premature draw execution (should fail)
    try {
      await lottery.executeDrawPublic();
      logTest('Premature Draw Test', 'failed', 'Should not allow draw before time');
    } catch (error) {
      logTest('Premature Draw Test', 'passed', 'Correctly prevented premature draw');
    }

    // Test 11: Manual draw execution by owner
    const manualWinningNumbers = [1, 2, 3, 4, 5]; // Player1's numbers
    const tx3 = await lottery.executeDrawManual(manualWinningNumbers);
    const receipt3 = await tx3.wait();
    
    logTest('Manual Draw Execution', 'passed', 'Owner executed manual draw', receipt3.gasUsed.toString());

    // Test 12: Check draw results
    const drawId = 1;
    const drawResult = await lottery.getDraw(drawId);
    
    // getDraw returns: [id, winningNumbers, timestamp, totalPrizePool, jackpotAmount, totalTickets, executed, executor]
    const [id, winningNumbers, timestamp, totalPrizePool, jackpotAmount, totalTickets, executed, executor] = drawResult;

    if (executed) {
      logTest('Draw Execution Status', 'passed', 'Draw marked as executed');
    } else {
      logTest('Draw Execution Status', 'failed', 'Draw not marked as executed');
    }

    // Test 13: Check winning numbers
    if (winningNumbers && winningNumbers.length > 0) {
      const winningNumbersArray = winningNumbers.map(n => Number(n));
      if (JSON.stringify(winningNumbersArray) === JSON.stringify(manualWinningNumbers)) {
        logTest('Winning Numbers', 'passed', `Correct: [${winningNumbersArray.join(', ')}]`);
      } else {
        logTest('Winning Numbers', 'failed', `Expected [${manualWinningNumbers.join(', ')}], got [${winningNumbersArray.join(', ')}]`);
      }
    } else {
      logTest('Winning Numbers', 'failed', 'Cannot access winning numbers from draw');
    }

  } catch (error) {
    logTest('Draw Execution Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ PRIZE CALCULATION TESTS ============

  try {
    console.log('\n🏆 Testing Prize Calculations...');

    // Test 14: Check winners
    const winners = await lottery.getDrawWinners(1);
    const winnerAddresses = winners[0];
    const matchCounts = winners[1];
    const prizeAmounts = winners[2];
    const claimed = winners[3];

    // Player1 should have 5 matches (jackpot)
    let player1Found = false;
    for (let i = 0; i < winnerAddresses.length; i++) {
      if (winnerAddresses[i] === player1.address) {
        player1Found = true;
        const matches = Number(matchCounts[i]);
        const prize = prizeAmounts[i];
        
        if (matches === 5) {
          logTest('Jackpot Winner Detection', 'passed', `Player1 has 5 matches`);
          
          // Calculate expected jackpot (50% of prize pool)
          const stats = await lottery.getLotteryStats();
          const totalPrizePool = parseKAS('39.6'); // From earlier calculation
          const expectedJackpot = totalPrizePool * BigInt(50) / BigInt(100); // 50%
          
          if (prize.toString() === expectedJackpot.toString()) {
            logTest('Jackpot Prize Amount', 'passed', `Correct: ${formatKAS(prize)} KAS`);
          } else {
            logTest('Jackpot Prize Amount', 'failed', `Expected ${formatKAS(expectedJackpot)}, got ${formatKAS(prize)}`);
          }
        } else {
          logTest('Jackpot Winner Detection', 'failed', `Player1 should have 5 matches, got ${matches}`);
        }
        break;
      }
    }

    if (!player1Found) {
      logTest('Winner Detection', 'failed', 'Player1 not found in winners list');
    }

  } catch (error) {
    logTest('Prize Calculation Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ PRIZE CLAIMING TESTS ============

  try {
    console.log('\n💎 Testing Prize Claiming...');

    // Test 15: Claim prize
    const ticketId = 1; // Player1's ticket
    const balanceBefore = await ethers.provider.getBalance(player1.address);
    
    const tx4 = await lottery.connect(player1).claimPrize(ticketId);
    const receipt4 = await tx4.wait();
    
    const balanceAfter = await ethers.provider.getBalance(player1.address);
    const gasUsed = receipt4.gasUsed * receipt4.gasPrice;
    const netGain = balanceAfter - balanceBefore + gasUsed;
    
    logTest('Prize Claiming', 'passed', `Player1 claimed ${formatKAS(netGain)} KAS`, receipt4.gasUsed.toString());

    // Test 16: Double claim attempt (should fail)
    try {
      await lottery.connect(player1).claimPrize(ticketId);
      logTest('Double Claim Test', 'failed', 'Should not allow double claiming');
    } catch (error) {
      logTest('Double Claim Test', 'passed', 'Correctly prevented double claiming');
    }

  } catch (error) {
    logTest('Prize Claiming Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ ROLLOVER TESTS ============

  try {
    console.log('\n🔄 Testing Jackpot Rollover...');

    // Test 17: Buy tickets for next draw
    const nextDrawTickets = [[26, 27, 28, 29, 30]]; // Different numbers
    await lottery.connect(player2).purchaseTickets(nextDrawTickets, {
      value: TICKET_PRICE
    });

    // Test 18: Execute draw with no winners
    const noWinnerNumbers = [31, 32, 33, 34, 35];
    await lottery.executeDrawManual(noWinnerNumbers);

    // Test 19: Check rollover
    const statsAfterRollover = await lottery.getLotteryStats();
    const jackpotAfterRollover = statsAfterRollover[0];
    
    // Should have some rollover amount
    if (jackpotAfterRollover > 0) {
      logTest('Jackpot Rollover', 'passed', `Rollover amount: ${formatKAS(jackpotAfterRollover)} KAS`);
    } else {
      logTest('Jackpot Rollover', 'warning', 'No rollover detected - check prize distribution logic');
    }

  } catch (error) {
    logTest('Rollover Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ ADMIN FUNCTION TESTS ============

  try {
    console.log('\n👑 Testing Admin Functions...');

    // Test 20: Admin fee withdrawal
    const adminBalanceBefore = await lottery.adminBalance();
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    
    if (adminBalanceBefore > 0) {
      const tx5 = await lottery.withdrawAdminFees();
      const receipt5 = await tx5.wait();
      
      const adminBalanceAfter = await lottery.adminBalance();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      if (adminBalanceAfter.toString() === '0') {
        logTest('Admin Fee Withdrawal', 'passed', `Withdrew ${formatKAS(adminBalanceBefore)} KAS`, receipt5.gasUsed.toString());
      } else {
        logTest('Admin Fee Withdrawal', 'failed', 'Admin balance not reset to zero');
      }
    } else {
      logTest('Admin Fee Withdrawal', 'warning', 'No admin fees to withdraw');
    }

    // Test 21: Unauthorized admin function access
    try {
      await lottery.connect(player1).withdrawAdminFees();
      logTest('Admin Access Control', 'failed', 'Non-owner should not access admin functions');
    } catch (error) {
      logTest('Admin Access Control', 'passed', 'Correctly restricted admin functions');
    }

  } catch (error) {
    logTest('Admin Function Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ EMERGENCY TESTS ============

  try {
    console.log('\n🚨 Testing Emergency Functions...');

    // Test 22: Pause functionality
    await lottery.pause();
    const isPaused = await lottery.paused();
    
    if (isPaused) {
      logTest('Pause Functionality', 'passed', 'Contract successfully paused');
    } else {
      logTest('Pause Functionality', 'failed', 'Contract not paused');
    }

    // Test 23: Paused state prevents ticket purchases
    try {
      await lottery.connect(player3).purchaseTickets([[21, 22, 23, 24, 25]], {
        value: TICKET_PRICE
      });
      logTest('Paused State Protection', 'failed', 'Should prevent ticket purchases when paused');
    } catch (error) {
      logTest('Paused State Protection', 'passed', 'Correctly prevented operations when paused');
    }

    // Test 24: Unpause
    await lottery.unpause();
    const isUnpaused = !(await lottery.paused());
    
    if (isUnpaused) {
      logTest('Unpause Functionality', 'passed', 'Contract successfully unpaused');
    } else {
      logTest('Unpause Functionality', 'failed', 'Contract still paused');
    }

    // Test 25: Emergency withdrawal (requires pause)
    await lottery.pause();
    
    const contractBalanceBefore = await ethers.provider.getBalance(CONTRACT_ADDRESS);
    
    if (contractBalanceBefore > 0) {
      const tx6 = await lottery.emergencyWithdraw();
      const receipt6 = await tx6.wait();
      
      const contractBalanceAfter = await ethers.provider.getBalance(CONTRACT_ADDRESS);
      
      if (contractBalanceAfter < contractBalanceBefore) {
        logTest('Emergency Withdrawal', 'passed', `Withdrew ${formatKAS(contractBalanceBefore - contractBalanceAfter)} KAS`, receipt6.gasUsed.toString());
      } else {
        logTest('Emergency Withdrawal', 'failed', 'No funds withdrawn');
      }
    } else {
      logTest('Emergency Withdrawal', 'warning', 'No funds in contract to withdraw');
    }

  } catch (error) {
    logTest('Emergency Function Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ GAS EFFICIENCY TESTS ============

  try {
    console.log('\n⛽ Testing Gas Efficiency...');

    // Unpause for gas tests
    await lottery.unpause();

    // Test 26: Gas usage for different operations
    const gasTests = [];

    // Single ticket purchase
    const tx_single = await lottery.connect(player3).purchaseTickets([[21, 22, 23, 24, 25]], {
      value: TICKET_PRICE
    });
    const receipt_single = await tx_single.wait();
    gasTests.push({ operation: 'Single Ticket Purchase', gas: receipt_single.gasUsed.toString() });

    // Multiple ticket purchase
    const multiTickets = [
      [26, 27, 28, 29, 30],
      [31, 32, 33, 34, 35],
      [1, 5, 10, 15, 20],
      [2, 6, 11, 16, 21],
      [3, 7, 12, 17, 22]
    ];
    const tx_multi = await lottery.connect(player3).purchaseTickets(multiTickets, {
      value: TICKET_PRICE * BigInt(5)
    });
    const receipt_multi = await tx_multi.wait();
    gasTests.push({ operation: '5 Ticket Purchase', gas: receipt_multi.gasUsed.toString() });

    // Calculate gas per ticket
    const gasPerTicket = (Number(receipt_multi.gasUsed) - Number(receipt_single.gasUsed)) / 4;
    gasTests.push({ operation: 'Gas per Additional Ticket', gas: gasPerTicket.toFixed(0) });

    logTest('Gas Efficiency Analysis', 'passed', `Gas usage recorded for optimization analysis`);

    // Store gas analysis
    testResults.gasAnalysis = gasTests;

  } catch (error) {
    logTest('Gas Efficiency Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ FINAL SUMMARY ============

  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`📊 Total Tests: ${testResults.tests.length}`);
  
  const successRate = (testResults.summary.passed / testResults.tests.length * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  // Save detailed results
  fs.writeFileSync('./audit-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Detailed results saved to: audit-results.json');

  // Generate recommendations
  const recommendations = [];
  
  if (testResults.summary.failed > 0) {
    recommendations.push('🔴 CRITICAL: Fix failed tests before deployment');
  }
  
  if (testResults.summary.warnings > 0) {
    recommendations.push('🟡 REVIEW: Address warning items for optimal performance');
  }
  
  if (testResults.gasAnalysis) {
    const avgGas = testResults.gasAnalysis.find(g => g.operation === 'Single Ticket Purchase');
    if (avgGas && Number(avgGas.gas) > 200000) {
      recommendations.push('⛽ OPTIMIZE: Consider gas optimization for ticket purchases');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ APPROVED: Contract ready for deployment');
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  recommendations.forEach(rec => console.log(rec));

  console.log('\n⏰ Audit completed at:', new Date().toLocaleString());
  
  return testResults;
}

// Run the audit
main()
  .then((results) => {
    console.log('\n✅ Audit completed successfully');
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });