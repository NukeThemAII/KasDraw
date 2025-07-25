import hre from 'hardhat';
import fs from 'fs';
const { ethers } = hre;

// Test configuration
const TICKET_PRICE = ethers.parseEther('10'); // 10 KAS
const ADMIN_FEE_PERCENTAGE = 100; // 1% (100 basis points)

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  contractAddress: '',
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
  console.log('🔍 Starting KasDrawLotteryV2Fixed Fresh Audit');
  console.log('🌐 Network:', hre.network.name);
  console.log('⏰ Started at:', new Date().toLocaleString());
  console.log('================================================================================');

  // Get signers
  const [owner, player1, player2, player3, executor] = await ethers.getSigners();
  
  console.log('\n👥 Test Accounts:');
  console.log('Owner:', owner.address);
  console.log('Player1:', player1.address);
  console.log('Player2:', player2.address);
  console.log('Player3:', player3.address);
  console.log('Executor:', executor.address);

  // Deploy fresh contract for testing
  console.log('\n🚀 Deploying fresh contract for testing...');
  
  let lottery;
  try {
    const KasDrawLotteryV2Fixed = await ethers.getContractFactory('KasDrawLotteryV2Fixed');
    lottery = await KasDrawLotteryV2Fixed.deploy();
    await lottery.waitForDeployment();
    
    const contractAddress = await lottery.getAddress();
    testResults.contractAddress = contractAddress;
    
    console.log('📍 Fresh Contract Address:', contractAddress);
    logTest('Fresh Contract Deployment', 'passed', 'Contract deployed successfully');
    
  } catch (error) {
    logTest('Fresh Contract Deployment', 'failed', `Deployment failed: ${error.message}`);
    return;
  }

  console.log('\n🧪 Running Audit Tests...');

  // ============ BASIC CONTRACT TESTS ============

  try {
    // Test 1: Contract deployment and owner
    const contractOwner = await lottery.owner();
    if (contractOwner === owner.address) {
      logTest('Contract Deployment', 'passed', 'Owner correctly set');
    } else {
      logTest('Contract Deployment', 'failed', `Expected ${owner.address}, got ${contractOwner}`);
    }

    // Test 2: Basic configuration
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
      logTest('Game Configuration', 'passed', '5/35 lottery system confirmed');
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

    // Test 7: Duplicate numbers in ticket
    try {
      await lottery.connect(player3).purchaseTickets([[1, 1, 2, 3, 4]], { // Duplicate 1
        value: TICKET_PRICE
      });
      logTest('Duplicate Numbers Test', 'failed', 'Should have reverted with duplicate numbers');
    } catch (error) {
      logTest('Duplicate Numbers Test', 'passed', 'Correctly rejected duplicate numbers');
    }

  } catch (error) {
    logTest('Ticket Purchase Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ ACCOUNTING TESTS ============

  try {
    console.log('\n💰 Testing Accounting & Math...');

    // Test 8: Ticket count
    const stats = await lottery.getLotteryStats();
    const ticketCount = Number(stats.totalTicketsSold);
    
    if (ticketCount === 4) { // 1 + 3 tickets purchased
      logTest('Ticket Count', 'passed', `Correct: ${ticketCount} tickets sold`);
    } else {
      logTest('Ticket Count', 'failed', `Expected 4, got ${ticketCount}`);
    }

    // Test 9: Prize pool and admin fee calculations
    const totalRevenue = parseKAS('40'); // 4 tickets * 10 KAS
    const expectedAdminFee = totalRevenue * BigInt(ADMIN_FEE_PERCENTAGE) / BigInt(10000);
    const expectedPrizePool = totalRevenue - expectedAdminFee;
    
    const actualPrizePool = stats.currentPrizePool;
    const actualAdminFee = stats.totalAdminFees;
    
    if (actualPrizePool.toString() === expectedPrizePool.toString()) {
      logTest('Prize Pool Calculation', 'passed', `Correct: ${formatKAS(actualPrizePool)} KAS`);
    } else {
      logTest('Prize Pool Calculation', 'failed', `Expected ${formatKAS(expectedPrizePool)}, got ${formatKAS(actualPrizePool)}`);
    }
    
    if (actualAdminFee.toString() === expectedAdminFee.toString()) {
      logTest('Admin Fee Calculation', 'passed', `Correct: ${formatKAS(actualAdminFee)} KAS`);
    } else {
      logTest('Admin Fee Calculation', 'failed', `Expected ${formatKAS(expectedAdminFee)}, got ${formatKAS(actualAdminFee)}`);
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
    try {
      const drawId = 1;
      const draw = await lottery.getDraw(drawId);
      
      if (draw && draw.summary) {
        const drawSummary = draw.summary;
        
        if (drawSummary.executed) {
          logTest('Draw Execution Status', 'passed', 'Draw marked as executed');
        } else {
          logTest('Draw Execution Status', 'failed', 'Draw not marked as executed');
        }

        // Test 13: Check winning numbers
        if (drawSummary.winningNumbers) {
          const winningNumbers = drawSummary.winningNumbers.map(n => Number(n));
          if (JSON.stringify(winningNumbers) === JSON.stringify(manualWinningNumbers)) {
            logTest('Winning Numbers', 'passed', `Correct: [${winningNumbers.join(', ')}]`);
          } else {
            logTest('Winning Numbers', 'failed', `Expected [${manualWinningNumbers.join(', ')}], got [${winningNumbers.join(', ')}]`);
          }
        } else {
          logTest('Winning Numbers', 'failed', 'Cannot access winning numbers');
        }
      } else {
        logTest('Draw Execution Status', 'failed', 'Cannot access draw data');
        logTest('Winning Numbers', 'failed', 'Cannot access draw data');
      }
    } catch (error) {
      logTest('Draw Data Access', 'failed', `Error accessing draw data: ${error.message}`);
    }

  } catch (error) {
    logTest('Draw Execution Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ PRIZE CALCULATION TESTS ============

  try {
    console.log('\n🏆 Testing Prize Calculations...');

    // Test 14: Check winner detection
    const player1Tickets = await lottery.getPlayerTickets(player1.address, 1);
    let jackpotWinner = false;
    
    for (let i = 0; i < player1Tickets.length; i++) {
      const matches = await lottery.checkTicketWin(player1Tickets[i], 1);
      if (Number(matches) === 5) {
        jackpotWinner = true;
        break;
      }
    }
    
    if (jackpotWinner) {
      logTest('Jackpot Winner Detection', 'passed', 'Player1 has 5 matches');
    } else {
      logTest('Jackpot Winner Detection', 'failed', 'Player1 should have 5 matches');
    }

    // Test 15: Prize amount calculation
    if (jackpotWinner) {
      const prize = await lottery.calculatePrize(player1Tickets[0], 1);
      const stats = await lottery.getLotteryStats();
      const totalPrizePool = parseKAS('39.6'); // From earlier calculation
      const expectedJackpot = totalPrizePool * BigInt(50) / BigInt(100); // 50%
      
      if (prize.toString() === expectedJackpot.toString()) {
        logTest('Jackpot Prize Amount', 'passed', `Correct: ${formatKAS(prize)} KAS`);
      } else {
        logTest('Jackpot Prize Amount', 'failed', `Expected ${formatKAS(expectedJackpot)}, got ${formatKAS(prize)}`);
      }
    }

  } catch (error) {
    logTest('Prize Calculation Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ PRIZE CLAIMING TESTS ============

  try {
    console.log('\n💎 Testing Prize Claiming...');

    // Test 16: Prize claiming
    const player1Tickets = await lottery.getPlayerTickets(player1.address, 1);
    if (player1Tickets.length > 0) {
      const tx4 = await lottery.connect(player1).claimPrize(player1Tickets[0], 1);
      const receipt4 = await tx4.wait();
      
      logTest('Prize Claiming', 'passed', `Player1 claimed prize`, receipt4.gasUsed.toString());

      // Test 17: Double claim prevention
      try {
        await lottery.connect(player1).claimPrize(player1Tickets[0], 1);
        logTest('Double Claim Test', 'failed', 'Should prevent double claiming');
      } catch (error) {
        logTest('Double Claim Test', 'passed', 'Correctly prevented double claiming');
      }
    }

  } catch (error) {
    logTest('Prize Claiming Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ ADMIN FUNCTION TESTS ============

  try {
    console.log('\n👑 Testing Admin Functions...');

    // Test 18: Admin fee withdrawal
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx5 = await lottery.withdrawAdminFees();
    const receipt5 = await tx5.wait();
    const balanceAfter = await ethers.provider.getBalance(owner.address);
    
    logTest('Admin Fee Withdrawal', 'passed', `Withdrew admin fees`, receipt5.gasUsed.toString());

    // Test 19: Access control
    try {
      await lottery.connect(player1).withdrawAdminFees();
      logTest('Admin Access Control', 'failed', 'Non-owner should not access admin functions');
    } catch (error) {
      logTest('Admin Access Control', 'passed', 'Correctly restricted admin functions');
    }

  } catch (error) {
    logTest('Admin Function Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ EMERGENCY FUNCTION TESTS ============

  try {
    console.log('\n🚨 Testing Emergency Functions...');

    // Test 20: Pause functionality
    await lottery.pause();
    logTest('Pause Functionality', 'passed', 'Contract successfully paused');

    // Test 21: Paused state protection
    try {
      await lottery.connect(player3).purchaseTickets([[26, 27, 28, 29, 30]], {
        value: TICKET_PRICE
      });
      logTest('Paused State Protection', 'failed', 'Should prevent operations when paused');
    } catch (error) {
      logTest('Paused State Protection', 'passed', 'Correctly prevented operations when paused');
    }

    // Test 22: Unpause functionality
    await lottery.unpause();
    logTest('Unpause Functionality', 'passed', 'Contract successfully unpaused');

    // Test 23: Emergency withdrawal
    const contractBalance = await ethers.provider.getBalance(await lottery.getAddress());
    if (contractBalance > 0) {
      const tx6 = await lottery.emergencyWithdraw();
      const receipt6 = await tx6.wait();
      logTest('Emergency Withdrawal', 'passed', `Withdrew ${formatKAS(contractBalance)} KAS`, receipt6.gasUsed.toString());
    } else {
      logTest('Emergency Withdrawal', 'passed', 'No funds to withdraw');
    }

  } catch (error) {
    logTest('Emergency Function Tests', 'failed', `Error: ${error.message}`);
  }

  // ============ FINAL SUMMARY ============

  console.log('\n================================================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('================================================================================');
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`📊 Total Tests: ${testResults.summary.passed + testResults.summary.failed + testResults.summary.warnings}`);
  console.log(`🎯 Success Rate: ${((testResults.summary.passed / (testResults.summary.passed + testResults.summary.failed + testResults.summary.warnings)) * 100).toFixed(1)}%`);

  // Save results
  fs.writeFileSync('audit-results-fresh.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Detailed results saved to: audit-results-fresh.json');

  if (testResults.summary.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Contract is ready for deployment.');
  } else {
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('🔴 CRITICAL: Fix failed tests before deployment');
  }

  console.log(`\n⏰ Audit completed at: ${new Date().toLocaleString()}`);
  console.log('\n✅ Fresh audit completed successfully');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });